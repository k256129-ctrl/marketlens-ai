from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class InventoryCreate(BaseModel):
    business_id: int = Field(..., gt=0)
    product_id: Optional[int] = Field(None, gt=0)
    # Optional inline product creation so users can add a brand-new product directly in Inventory
    new_product_sku: Optional[str] = Field(None, min_length=2, max_length=64)
    new_product_name: Optional[str] = Field(None, min_length=2, max_length=180)
    new_product_brand: Optional[str] = Field(None, max_length=100)
    new_product_unit: Optional[str] = Field("unit", max_length=40)
    new_product_category_id: Optional[int] = Field(None, gt=0)
    unit_price: float = Field(..., gt=0)
    cost_price: Optional[float] = Field(None, ge=0)
    quantity: int = Field(..., ge=0)
    min_stock_level: int = Field(10, ge=0)


class InventoryUpdate(BaseModel):
    unit_price: Optional[float] = Field(None, gt=0)
    cost_price: Optional[float] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)
    product_name: Optional[str] = Field(None, min_length=2, max_length=180)
    category_id: Optional[int] = Field(None, gt=0)


class InventoryItemOut(BaseModel):
    id: int
    business_id: int
    business_name: str
    business_city: str
    business_district: str
    product_id: int
    sku: str
    product_name: str
    brand: Optional[str]
    unit: str
    category_id: int
    category_name: str
    category_color: str
    unit_price: float
    cost_price: Optional[float]
    quantity: int
    min_stock_level: int
    stock_status: str  # "in_stock" | "low_stock" | "out_of_stock"
    total_value: float
    last_restocked_at: datetime
    updated_at: datetime
