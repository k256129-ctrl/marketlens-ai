from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    sku: str = Field(..., min_length=2, max_length=64)
    name: str = Field(..., min_length=2, max_length=180)
    brand: Optional[str] = Field(None, max_length=100)
    unit: str = Field("unit", min_length=1, max_length=40)
    description: Optional[str] = None
    category_id: int = Field(..., gt=0)


class ProductCreate(ProductBase):
    pass


class ProductOfferOut(BaseModel):
    inventory_id: int
    business_id: int
    business_name: str
    city: str
    district: str
    address: str
    rating: float
    unit_price: float
    quantity: int
    min_stock_level: int
    stock_status: str


class ProductMarketOut(BaseModel):
    id: int
    sku: str
    name: str
    brand: Optional[str]
    unit: str
    description: Optional[str]
    category_id: int
    category_name: str
    category_color: str
    shop_count: int
    total_available_units: int
    min_price: Optional[float]
    max_price: Optional[float]
    avg_price: Optional[float]
    price_spread: Optional[float]
    best_shop_name: Optional[str]
    offers: List[ProductOfferOut] = []
    created_at: datetime
