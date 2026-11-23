from datetime import datetime
from typing import List
from pydantic import BaseModel


class LocationMetricOut(BaseModel):
    id: int
    area_name: str
    city: str
    zone_type: str
    avg_monthly_rent_usd: float
    rent_per_sqft_usd: float
    competition_level: str
    competition_index: int
    foot_traffic_score: int
    demand_growth_score: int
    opportunity_score: int
    best_fit_sectors: str
    data_source_type: str
    source_note: str
    updated_at: datetime

    model_config = {"from_attributes": True}


class LocationComparisonOut(BaseModel):
    locations: List[LocationMetricOut]
    recommended_area: str
    recommendation_reason: str
    methodology_disclaimer: str
