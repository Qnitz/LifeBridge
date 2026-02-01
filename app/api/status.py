from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Event, Alert

router = APIRouter()

@router.get("/api/status")
def get_status(db: Session = Depends(get_db)):
    last_event = db.query(Event).order_by(Event.created_at.desc()).first()
    
    # Check if the system is actually paused
    active_high = db.query(Alert).filter(Alert.status == "ACTIVE", Alert.severity == "HIGH").first()

    if not last_event:
        return {"state": "NORMAL", "active_alert": False, "system_paused": False, "confidence": None, "last_update": None}

    state = "NORMAL"
    if last_event.event_type in {"FALL_SUSPECTED"}:
        state = "WARNING"
    if last_event.event_type in {"FALL_CONFIRMED"}:
        state = "FALL_DETECTED"

    return {
        "state": state,
        "active_alert": bool(active_high),
        "system_paused": bool(active_high), # <--- NEW FLAG
        "confidence": last_event.confidence,
        # Adding "Z" fixes the 2-hour timezone difference
        "last_update": (last_event.created_at.isoformat() + "Z") if last_event.created_at else None
    }