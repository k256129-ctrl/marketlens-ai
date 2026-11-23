from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Numeric,
    Float,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(120), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    color_hex = Column(String(16), nullable=False, default="#087F5B")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    products = relationship("Product", back_populates="category")


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    district = Column(String(120), nullable=False, index=True)
    address = Column(String(255), nullable=False)
    owner_name = Column(String(120), nullable=True)
    phone = Column(String(40), nullable=True)
    email = Column(String(150), nullable=True)
    status = Column(String(32), nullable=False, default="active")
    rating = Column(Float, nullable=False, default=4.5)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    inventory_items = relationship(
        "InventoryItem",
        back_populates="business",
        cascade="all, delete-orphan",
    )


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(180), nullable=False, index=True)
    brand = Column(String(100), nullable=True)
    unit = Column(String(40), nullable=False, default="unit")
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    category = relationship("Category", back_populates="products")
    inventory_items = relationship(
        "InventoryItem",
        back_populates="product",
        cascade="all, delete-orphan",
    )


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    unit_price = Column(Numeric(12, 2), nullable=False)
    cost_price = Column(Numeric(12, 2), nullable=True)
    quantity = Column(Integer, nullable=False, default=0)
    min_stock_level = Column(Integer, nullable=False, default=10)
    last_restocked_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    business = relationship("Business", back_populates="inventory_items")
    product = relationship("Product", back_populates="inventory_items")

    __table_args__ = (
        UniqueConstraint("business_id", "product_id", name="uq_business_product_inventory"),
        Index("ix_inventory_qty_min", "quantity", "min_stock_level"),
    )


class LocationMetric(Base):
    __tablename__ = "location_metrics"

    id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String(140), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    zone_type = Column(String(80), nullable=False)  # Commercial Hub, Residential Retail, Tech Corridor, High Street
    avg_monthly_rent_usd = Column(Numeric(12, 2), nullable=False)
    rent_per_sqft_usd = Column(Float, nullable=False)
    competition_level = Column(String(32), nullable=False)  # Low, Moderate, High, Saturated
    competition_index = Column(Integer, nullable=False)  # 0-100 (higher = more saturated)
    foot_traffic_score = Column(Integer, nullable=False)  # 0-100
    demand_growth_score = Column(Integer, nullable=False)  # 0-100
    opportunity_score = Column(Integer, nullable=False)  # Computed composite 0-100
    best_fit_sectors = Column(String(255), nullable=False)
    data_source_type = Column(String(40), nullable=False, default="ILLUSTRATIVE_ESTIMATE")
    source_note = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # business, product, inventory, system
    entity_id = Column(Integer, nullable=True)
    action = Column(String(40), nullable=False)  # created, updated, deleted, low_stock_alert
    title = Column(String(180), nullable=False)
    detail = Column(String(255), nullable=True)
    severity = Column(String(24), nullable=False, default="info")  # info, success, warning, danger
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)
