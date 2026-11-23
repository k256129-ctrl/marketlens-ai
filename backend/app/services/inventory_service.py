from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.models.domain import Business, Category, InventoryItem, Product
from app.schemas.inventory import InventoryCreate, InventoryItemOut, InventoryUpdate
from app.services.activity_service import log_activity


def compute_stock_status(quantity: int, min_stock_level: int) -> str:
    if quantity <= 0:
        return "out_of_stock"
    if quantity <= min_stock_level:
        return "low_stock"
    return "in_stock"


def serialize_inventory_item(item: InventoryItem) -> InventoryItemOut:
    unit_price = float(item.unit_price)
    cost_price = float(item.cost_price) if item.cost_price is not None else None
    stock_status = compute_stock_status(item.quantity, item.min_stock_level)
    return InventoryItemOut(
        id=item.id,
        business_id=item.business_id,
        business_name=item.business.name,
        business_city=item.business.city,
        business_district=item.business.district,
        product_id=item.product_id,
        sku=item.product.sku,
        product_name=item.product.name,
        brand=item.product.brand,
        unit=item.product.unit,
        category_id=item.product.category_id,
        category_name=item.product.category.name,
        category_color=item.product.category.color_hex,
        unit_price=unit_price,
        cost_price=cost_price,
        quantity=item.quantity,
        min_stock_level=item.min_stock_level,
        stock_status=stock_status,
        total_value=round(unit_price * item.quantity, 2),
        last_restocked_at=item.last_restocked_at,
        updated_at=item.updated_at,
    )


def create_inventory_record(db: Session, payload: InventoryCreate) -> InventoryItemOut:
    business = db.query(Business).filter(Business.id == payload.business_id).first()
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected business does not exist.")

    product = None
    if payload.product_id:
        product = db.query(Product).filter(Product.id == payload.product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected product does not exist.")
    else:
        if not payload.new_product_name or not payload.new_product_sku or not payload.new_product_category_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Provide either an existing product_id or new_product_sku, new_product_name, and new_product_category_id.",
            )
        category = db.query(Category).filter(Category.id == payload.new_product_category_id).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected category does not exist.")

        normalized_sku = payload.new_product_sku.strip().upper()
        existing_sku = db.query(Product).filter(Product.sku == normalized_sku).first()
        if existing_sku:
            product = existing_sku
        else:
            product = Product(
                sku=normalized_sku,
                name=payload.new_product_name.strip(),
                brand=payload.new_product_brand.strip() if payload.new_product_brand else None,
                unit=(payload.new_product_unit or "unit").strip(),
                category_id=category.id,
            )
            db.add(product)
            db.flush()

    duplicate = (
        db.query(InventoryItem)
        .filter(InventoryItem.business_id == business.id, InventoryItem.product_id == product.id)
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"'{product.name}' is already tracked under '{business.name}'. Edit the existing stock row instead.",
        )

    item = InventoryItem(
        business_id=business.id,
        product_id=product.id,
        unit_price=payload.unit_price,
        cost_price=payload.cost_price,
        quantity=payload.quantity,
        min_stock_level=payload.min_stock_level,
        last_restocked_at=datetime.now(timezone.utc),
    )
    db.add(item)
    db.flush()

    stock_state = compute_stock_status(item.quantity, item.min_stock_level)
    log_activity(
        db,
        entity_type="inventory",
        entity_id=item.id,
        action="created",
        title=f"Added {product.name} to {business.name}",
        detail=f"{item.quantity} {product.unit}(s) @ ${float(item.unit_price):,.2f}",
        severity="warning" if stock_state != "in_stock" else "success",
    )
    db.commit()

    loaded = (
        db.query(InventoryItem)
        .options(
            joinedload(InventoryItem.business),
            joinedload(InventoryItem.product).joinedload(Product.category),
        )
        .filter(InventoryItem.id == item.id)
        .first()
    )
    return serialize_inventory_item(loaded)


def update_inventory_record(db: Session, inventory_id: int, payload: InventoryUpdate) -> InventoryItemOut:
    item = (
        db.query(InventoryItem)
        .options(
            joinedload(InventoryItem.business),
            joinedload(InventoryItem.product).joinedload(Product.category),
        )
        .filter(InventoryItem.id == inventory_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found.")

    previous_qty = item.quantity

    if payload.unit_price is not None:
        item.unit_price = payload.unit_price
    if payload.cost_price is not None:
        item.cost_price = payload.cost_price
    if payload.quantity is not None:
        if payload.quantity > previous_qty:
            item.last_restocked_at = datetime.now(timezone.utc)
        item.quantity = payload.quantity
    if payload.min_stock_level is not None:
        item.min_stock_level = payload.min_stock_level
    if payload.product_name is not None:
        item.product.name = payload.product_name.strip()
    if payload.category_id is not None:
        cat = db.query(Category).filter(Category.id == payload.category_id).first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
        item.product.category_id = payload.category_id

    db.flush()
    new_state = compute_stock_status(item.quantity, item.min_stock_level)
    log_activity(
        db,
        entity_type="inventory",
        entity_id=item.id,
        action="updated",
        title=f"Updated {item.product.name} ({item.business.name})",
        detail=f"Qty: {previous_qty} → {item.quantity} | Price: ${float(item.unit_price):,.2f}",
        severity="warning" if new_state in ("low_stock", "out_of_stock") else "info",
    )
    db.commit()
    db.refresh(item)
    return serialize_inventory_item(item)


def delete_inventory_record(db: Session, inventory_id: int) -> None:
    item = (
        db.query(InventoryItem)
        .options(joinedload(InventoryItem.business), joinedload(InventoryItem.product))
        .filter(InventoryItem.id == inventory_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory item not found.")

    title = f"Removed {item.product.name} from {item.business.name}"
    db.delete(item)
    log_activity(
        db,
        entity_type="inventory",
        entity_id=inventory_id,
        action="deleted",
        title=title,
        detail="Inventory SKU entry deleted by operator.",
        severity="danger",
    )
    db.commit()
