from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.dashboard import DashboardOverviewOut
from app.services.dashboard_service import build_dashboard_overview

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])


@router.get("/overview", response_model=DashboardOverviewOut)
def get_dashboard_overview(db: Session = Depends(get_db)):
    return build_dashboard_overview(db)
