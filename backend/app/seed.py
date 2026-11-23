from sqlalchemy.orm import Session
from app.api.routes.products import ensure_200_products


def seed_initial_data(db: Session):
    try:
        ensure_200_products(db)
    except Exception as e:
        db.rollback()
        print(f"[Marketlenz AI] Startup seed note: {e}")