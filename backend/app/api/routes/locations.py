from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.domain import LocationMetric
from app.schemas.location import LocationComparisonOut, LocationMetricOut

router = APIRouter(prefix="/locations", tags=["Location Intelligence"])


@router.get("", response_model=List[LocationMetricOut])
def list_locations(
    search: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    competition_level: Optional[str] = Query(None),
    max_rent: Optional[float] = Query(None, gt=0),
    db: Session = Depends(get_db),
):
    query = db.query(LocationMetric)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                LocationMetric.area_name.ilike(term),
                LocationMetric.city.ilike(term),
                LocationMetric.zone_type.ilike(term),
                LocationMetric.best_fit_sectors.ilike(term),
            )
        )
    if city:
        query = query.filter(LocationMetric.city.ilike(city.strip()))
    if competition_level:
        query = query.filter(LocationMetric.competition_level.ilike(competition_level.strip()))
    if max_rent is not None:
        query = query.filter(LocationMetric.avg_monthly_rent_usd <= max_rent)

    return query.order_by(LocationMetric.opportunity_score.desc()).all()


@router.get("/compare", response_model=LocationComparisonOut)
def compare_locations(
    ids: Optional[str] = Query(None, description="Comma-separated location IDs to compare"),
    db: Session = Depends(get_db),
):
    query = db.query(LocationMetric)
    if ids:
        id_list = [int(x.strip()) for x in ids.split(",") if x.strip().isdigit()]
        if id_list:
            query = query.filter(LocationMetric.id.in_(id_list))

    locations = query.order_by(LocationMetric.opportunity_score.desc()).all()
    if not locations:
        return LocationComparisonOut(
            locations=[],
            recommended_area="N/A",
            recommendation_reason="No matching areas found for comparison.",
            methodology_disclaimer="All figures combine illustrative commercial benchmarks and municipal zoning records.",
        )

    top = locations[0]
    reason = (
        f"{top.area_name} ({top.city}) achieves the highest composite Opportunity Score ({top.opportunity_score}/100), "
        f"balancing {top.competition_level.lower()} competition (index {top.competition_index}/100) with "
        f"{top.foot_traffic_score}/100 foot traffic at ~${float(top.avg_monthly_rent_usd):,.0f}/mo estimated rent."
    )
    return LocationComparisonOut(
        locations=[LocationMetricOut.model_validate(loc) for loc in locations],
        recommended_area=f"{top.area_name}, {top.city}",
        recommendation_reason=reason,
        methodology_disclaimer=(
            "Transparency Notice: Rental figures and foot-traffic scores labeled 'ILLUSTRATIVE_ESTIMATE' are modeled "
            "commercial planning benchmarks, not live MLS/brokerage feeds. Always validate lease rates locally."
        ),
    )
