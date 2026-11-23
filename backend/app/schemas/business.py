from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class BusinessBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=120)
    address: str = Field(..., min_length=4, max_length=255)
    owner_name: Optional[str] = Field(None, max_length=120)
    phone: Optional[str] = Field(None, max_length=40)
    email: Optional[str] = Field(None, max_length=150)
    status: str = Field("active", pattern=r"^(active|inactive|pending)$")
    rating: float = Field(4.5, ge=0.0, le=5.0)
    description: Optional[str] = None


class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    category: Optional[str] = Field(None, min_length=2, max_length=100)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    district: Optional[str] = Field(None, min_length=2, max_length=120)
    address: Optional[str] = Field(None, min_length=4, max_length=255)
    owner_name: Optional[str] = Field(None, max_length=120)
    phone: Optional[str] = Field(None, max_length=40)
    email: Optional[str] = Field(None, max_length=150)
    status: Optional[str] = Field(None, pattern=r"^(active|inactive|pending)$")
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    description: Optional[str] = None


class BusinessSummaryOut(BusinessBase):
    id: int
    total_products: int = 0
    total_units: int = 0
    inventory_value: float = 0.0
    low_stock_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BusinessInventoryItemBrief(BaseModel):
    inventory_id: int
    product_id: int
    sku: str
    product_name: str
    category_name: str
    unit: str
    unit_price: float
    quantity: int
    min_stock_level: int
    stock_status: str
    total_value: float


class BusinessDetailOut(BusinessSummaryOut):
    inventory: List[BusinessInventoryItemBrief] = []
