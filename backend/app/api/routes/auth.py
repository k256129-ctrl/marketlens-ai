import os
import sqlite3
import hashlib
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("SECRET_KEY", "ml-prod-secret-key-2026-secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "marketlens.db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def is_postgres() -> bool:
    return bool(DATABASE_URL and psycopg2 is not None)


def get_db():
    if is_postgres():
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        return conn
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def placeholder() -> str:
    return "%s" if is_postgres() else "?"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, stored_hash: str) -> bool:
    if not stored_hash:
        return False
    # Support legacy SHA-256 hashes from existing local accounts as well as bcrypt
    if len(stored_hash) == 64 and not stored_hash.startswith("$2"):
        return hashlib.sha256(plain_password.encode("utf-8")).hexdigest() == stored_hash
    try:
        return pwd_context.verify(plain_password, stored_hash)
    except Exception:
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def init_users_table():
    conn = get_db()
    cur = conn.cursor()
    try:
        if is_postgres():
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(120) UNIQUE NOT NULL,
                    full_name VARCHAR(150) NOT NULL,
                    password_hash TEXT NOT NULL,
                    recovery_pin_hash TEXT,
                    role VARCHAR(50) DEFAULT 'customer',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_pin_hash TEXT")
        else:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT UNIQUE NOT NULL,
                    full_name TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    recovery_pin_hash TEXT,
                    role TEXT DEFAULT 'customer',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cols = [row[1] for row in cur.execute("PRAGMA table_info(users)").fetchall()]
            if "recovery_pin_hash" not in cols:
                cur.execute("ALTER TABLE users ADD COLUMN recovery_pin_hash TEXT")

        # Seed Master Admin account safely if not present
        p = placeholder()
        cur.execute(f"SELECT id FROM users WHERE user_id = {p}", ("ADMIN_ML",))
        if not cur.fetchone():
            cur.execute(
                f"INSERT INTO users (user_id, full_name, password_hash, recovery_pin_hash, role) VALUES ({p}, {p}, {p}, {p}, {p})",
                ("ADMIN_ML", "System Administrator", hash_password("ML@Admin#2026!"), hash_password("998877"), "admin"),
            )
        conn.commit()
    finally:
        cur.close()
        conn.close()


init_users_table()


class SignUpRequest(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: str = ""
    password: str
    recovery_pin: str = "1234"
    role: Optional[str] = "customer"


class LoginRequest(BaseModel):
    user_id: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    password: str


class ForgotPasswordRequest(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    recovery_pin: str
    new_password: str


def extract_uid(payload) -> str:
    raw = payload.user_id or getattr(payload, "username", None) or getattr(payload, "email", None) or ""
    return raw.strip().upper()


def handle_registration(payload: SignUpRequest):
    uid = extract_uid(payload)
    name = (payload.full_name or uid).strip()
    pwd = payload.password.strip()
    pin = (payload.recovery_pin or "1234").strip()

    if len(uid) < 3:
        raise HTTPException(status_code=400, detail="User ID must be at least 3 characters.")
    if uid == "ADMIN_ML":
        raise HTTPException(status_code=403, detail="This User ID is reserved for the system administrator.")
    if len(pwd) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if len(pin) < 4:
        raise HTTPException(status_code=400, detail="Recovery PIN must be at least 4 digits.")

    conn = get_db()
    cur = conn.cursor()
    p = placeholder()
    try:
        cur.execute(f"SELECT id FROM users WHERE user_id = {p}", (uid,))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail=f"User ID '{uid}' is already registered. Please Sign In.")

        # Public signups are strictly locked to 'customer' role
        cur.execute(
            f"INSERT INTO users (user_id, full_name, password_hash, recovery_pin_hash, role) VALUES ({p}, {p}, {p}, {p}, {p})",
            (uid, name, hash_password(pwd), hash_password(pin), "customer"),
        )
        conn.commit()
        token = create_access_token({"sub": uid, "role": "customer"})
        return {
            "status": "success",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "user_id": uid,
                "userId": uid,
                "name": name,
                "role": "customer",
            },
        }
    finally:
        cur.close()
        conn.close()


@router.post("/register")
def register(payload: SignUpRequest):
    return handle_registration(payload)


@router.post("/signup")
def signup(payload: SignUpRequest):
    return handle_registration(payload)


@router.post("/login")
def login(payload: LoginRequest):
    uid = extract_uid(payload)
    pwd = payload.password.strip()

    conn = get_db()
    cur = conn.cursor()
    p = placeholder()
    try:
        cur.execute(
            f"SELECT user_id, full_name, password_hash, role FROM users WHERE user_id = {p}",
            (uid,),
        )
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail=f"User ID '{uid}' not found. Please Create Account first.")

        if not verify_password(pwd, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid password. Please try again.")

        normalized_role = "admin" if row["user_id"] == "ADMIN_ML" or "admin" in str(row["role"]).lower() else "customer"
        token = create_access_token({"sub": row["user_id"], "role": normalized_role})
        return {
            "status": "success",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "user_id": row["user_id"],
                "userId": row["user_id"],
                "name": row["full_name"],
                "role": normalized_role,
            },
        }
    finally:
        cur.close()
        conn.close()


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    uid = extract_uid(payload)
    pin = payload.recovery_pin.strip()
    new_pwd = payload.new_password.strip()

    if len(new_pwd) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")

    conn = get_db()
    cur = conn.cursor()
    p = placeholder()
    try:
        cur.execute(f"SELECT id, recovery_pin_hash FROM users WHERE user_id = {p}", (uid,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"User ID '{uid}' not found.")

        if not row.get("recovery_pin_hash") or not verify_password(pin, row["recovery_pin_hash"]):
            raise HTTPException(status_code=403, detail="Invalid Recovery PIN.")

        cur.execute(
            f"UPDATE users SET password_hash = {p} WHERE user_id = {p}",
            (hash_password(new_pwd), uid),
        )
        conn.commit()
        return {"status": "success", "message": "Password reset successfully."}
    finally:
        cur.close()
        conn.close()


@router.get("/me")
def get_me(token: Optional[str] = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if not uid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    conn = get_db()
    cur = conn.cursor()
    p = placeholder()
    try:
        cur.execute(f"SELECT user_id, full_name, role FROM users WHERE user_id = {p}", (uid,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user_id": row["user_id"], "name": row["full_name"], "role": row["role"]}
    finally:
        cur.close()
        conn.close()