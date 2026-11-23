from typing import Optional
from sqlalchemy.orm import Session
from app.models.domain import ActivityLog


def log_activity(
    db: Session,
    *,
    entity_type: str,
    action: str,
    title: str,
    detail: Optional[str] = None,
    entity_id: Optional[int] = None,
    severity: str = "info",
) -> ActivityLog:
    entry = ActivityLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        title=title,
        detail=detail,
        severity=severity,
    )
    db.add(entry)
    return entry
