from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.domain import Business, InventoryItem, Product
from app.schemas.business import (
    BusinessCreate,
    BusinessDetailOut,
    BusinessInventoryItemBrief,
    BusinessSummaryOut,
    BusinessUpdate,
)
from app.services.activity_service import log_activity
from app.services.inventory_service import compute_stock_status

router = APIRouter(prefix="/businesses", tags=["Businesses & Shops"])


def _build_business_summary(biz: Business) -> BusinessSummaryOut:
    items = biz.inventory_items or []
    total_products = len(items)
    total_units = sum(i.quantity for i in items)
    inventory_value = round(sum(float(i.unit_price) * i.quantity for i in items), 2)
    low_stock_count = sum(1 for i in items if i.quantity <= i.min_stock_level)
    return BusinessSummaryOut(
        id=biz.id,
        name=biz.name,
        category=biz.category,
        city=biz.city,
        district=biz.district,
        address=biz.address,
        owner_name=biz.owner_name,
        phone=biz.phone,
        email=biz.email,
        status=biz.status,
        rating=biz.rating,
        description=biz.description,
        total_products=total_products,
        total_units=total_units,
        inventory_value=inventory_value,
        low_stock_count=low_stock_count,
        created_at=biz.created_at,
        updated_at=biz.updated_at,
    )


@router.get("", response_model=List[BusinessSummaryOut])
def list_businesses(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    query = db.query(Business).options(joinedload(Business.inventory_items))
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Business.name.ilike(term),
                Business.district.ilike(term),
                Business.city.ilike(term),
                Business.owner_name.ilike(term),
            )
        )
    if category:
        query = query.filter(Business.category.ilike(category.strip()))
    if city:
        query = query.filter(Business.city.ilike(city.strip()))
    if status_filter:
        query = query.filter(Business.status == status_filter.strip())

    businesses = query.order_by(Business.name.asc()).all()
    return [_build_business_summary(b) for b in businesses]


@router.get("/{business_id}", response_model=BusinessDetailOut)
def get_business_detail(business_id: int, db: Session = Depends(get_db)):
    biz = (
        db.query(Business)
        .options(
            joinedload(Business.inventory_items)
            .joinedload(InventoryItem.product)
            .joinedload(Product.category)
        )
        .filter(Business.id == business_id)
        .first()
    )
    if not biz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found.")

    summary = _build_business_summary(biz)
    inv_list = [
        BusinessInventoryItemBrief(
            inventory_id=inv.id,
            product_id=inv.product_id,
            sku=inv.product.sku,
            product_name=inv.product.name,
            category_name=inv.product.category.name,
            unit=inv.product.unit,
            unit_price=float(inv.unit_price),
            quantity=inv.quantity,
            min_stock_level=inv.min_stock_level,
            stock_status=compute_stock_status(inv.quantity, inv.min_stock_level),
            total_value=round(float(inv.unit_price) * inv.quantity, 2),
        )
        for inv in biz.inventory_items
    ]
    return BusinessDetailOut(**summary.model_dump(), inventory=inv_list)


@router.post("", response_model=BusinessSummaryOut, status_code=status.HTTP_201_CREATED)
def create_business(payload: BusinessCreate, db: Session = Depends(get_db)):
    biz = Business(**payload.model_dump())
    db.add(biz)
    db.flush()
    log_activity(
        db,
        entity_type="business",
        entity_id=biz.id,
        action="created",
        title=f"Registered business '{biz.name}'",
        detail=f"{biz.category} • {biz.district}, {biz.city}",
        severity="success",
    )
    db.commit()
    db.refresh(biz)
    return _build_business_summary(biz)


@router.put("/{business_id}", response_model=BusinessSummaryOut)
def update_business(business_id: int, payload: BusinessUpdate, db: Session = Depends(get_db)):
    biz = (
        db.query(Business)
        .options(joinedload(Business.inventory_items))
        .filter(Business.id == business_id)
        .first()
    )
    if not biz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found.")

    updates = payload.model_dump(exclude_unset=True)
    for key, val in updates.items():
        setattr(biz, key, val)

    log_activity(
        db,
        entity_type="business",
        entity_id=biz.id,
        action="updated",
        title=f"Updated shop profile '{biz.name}'",
        detail=f"{biz.district}, {biz.city} ({biz.status})",
        severity="info",
    )
    db.commit()
    db.refresh(biz)
    return _build_business_summary(biz)


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business(business_id: int, db: Session = Depends(get_db)):
    biz = db.query(Business).filter(Business.id == business_id).first()
    if not biz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found.")

    name = biz.name
    db.delete(biz)
    log_activity(
        db,
        entity_type="business",
        entity_id=business_id,
        action="deleted",
        title=f"Removed business '{name}'",
        detail="Shop and associated stock entries deleted.",
        severity="danger",
    )
    db.commit()
    return None
