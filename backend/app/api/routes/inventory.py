from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.api.routes.products import ensure_200_products, serialize_product

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
@router.get("/")
def get_inventory(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(500, ge=1, le=2000),
    db: Session = Depends(get_db),
):
    ensure_200_products(db)
    query = "SELECT * FROM marketlenz_catalog WHERE 1=1"
    params = {}

    if q and q.strip():
        query += " AND (name LIKE :q OR category LIKE :q OR sku LIKE :q)"
        params["q"] = f"%{q.strip()}%"
    if category and category.strip() and category.strip().lower() != "all":
        query += " AND category = :category"
        params["category"] = category.strip()

    query += " ORDER BY id ASC LIMIT :limit"
    params["limit"] = limit

    rows = db.execute(text(query), params).fetchall()
    items = [serialize_product(r) for r in rows]

    total_units = sum(i["stock"] for i in items)
    total_value = round(sum(i["price"] * i["stock"] for i in items), 2)
    low_stock = sum(1 for i in items if 0 < i["stock"] < 15)

    return {
        "items": items,
        "inventory": items,
        "total": len(items),
        "summary": {
            "total_skus": len(items),
            "total_units": total_units,
            "total_value": total_value,
            "low_stock_count": low_stock,
        },
    }