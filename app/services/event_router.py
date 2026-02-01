from time import perf_counter
from sqlalchemy.orm import Session
from app.db.models import Event
from app.services.config_service import get_config
from app.services.alert_manager import should_alert, create_alert

def ingest_event(
    db: Session,
    user_id: str,
    device_id: str,
    event_type: str,
    state: str,
    confidence: float,
    raw_data: dict | None = None,
    started_at: float | None = None,
) -> dict:
    start_time = started_at if started_at is not None else perf_counter()
    event = Event(user_id=user_id, device_id=device_id, event_type=event_type, state=state, confidence=float(confidence), raw_data=raw_data or {})
    db.add(event)
    db.commit()
    db.refresh(event)
    event_commit_ms = (perf_counter() - start_time) * 1000.0

    cfg = get_config(db, user_id)
    alert = None
    alert_commit_ms = None
    if should_alert(event, cfg):
        alert = create_alert(db, event, cfg, user_id)
        alert_commit_ms = (perf_counter() - start_time) * 1000.0

    return {
        "event": {
            "id": event.id,
            "device_id": event.device_id,
            "event_type": event.event_type,
            "state": event.state,
            "confidence": event.confidence,
            "created_at": event.created_at.isoformat() if event.created_at is not None else None,
        },
        "alert": {
            "id": alert.id,
            "status": alert.status,
            "severity": alert.severity,
            "event_id": alert.event_id,
        } if alert else None
        ,
        "timing": {
            "event_commit_ms": event_commit_ms,
            "alert_commit_ms": alert_commit_ms,
        },
    }
