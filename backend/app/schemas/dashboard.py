from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class KpiMetrics(BaseModel):
    total_businesses: int
    active_businesses: int
    total_products: int
    total_inventory_items: int
    total_units_in_stock: int
    total_inventory_value: float
    low_stock_products: int
    out_of_stock_products: int
    avg_opportunity_score: float


class CategoryDistributionPoint(BaseModel):
    category_id: int
    category_name: str
    color_hex: str
    product_count: int
    total_units: int
    inventory_value: float


class BusinessPerformancePoint(BaseModel):
    business_id: int
    business_name: str
    city: str
    category: str
    sku_count: int
    total_units: int
    inventory_value: float
    low_stock_count: int


class LowStockAlertItem(BaseModel):
    inventory_id: int
    sku: str
    product_name: str
    business_name: str
    city: str
    quantity: int
    min_stock_level: int
    deficit: int
    unit_price: float


class ActivityLogOut(BaseModel):
    id: int
    entity_type: str
    entity_id: Optional[int]
    action: str
    title: str
    detail: Optional[str]
    severity: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardOverviewOut(BaseModel):
    kpis: KpiMetrics
    category_distribution: List[CategoryDistributionPoint]
    business_performance: List[BusinessPerformancePoint]
    low_stock_alerts: List[LowStockAlertItem]
    recent_activities: List[ActivityLogOut]
    analytical_insights: List[str]
