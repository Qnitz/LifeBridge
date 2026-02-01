from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Event
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/api/activity")
def get_activity(limit: int = 30, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    rows = (
        db.query(Event)
        .filter(Event.user_id == current_user)
        .order_by(Event.created_at.desc())
        .limit(min(max(limit, 1), 200))
        .all()
    )
    return [
    {
        "id": e.id,
        # We append "Z" to tell the browser this is UTC time
        "timestamp": (e.created_at.isoformat() + "Z") if e.created_at is not None else None,
        "event_type": e.event_type,
        "confidence": e.confidence,
        "state": e.state,
        "raw_data": e.raw_data # This sends X, Y, Z to the graph
    }
    for e in rows
]