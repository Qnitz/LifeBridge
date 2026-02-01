import csv
from io import StringIO
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Event
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/api/logs/export")
def export_logs(limit: int = 500, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    events = (
        db.query(Event)
        .filter(Event.user_id == current_user)
        .order_by(Event.created_at.desc())
        .limit(min(max(limit, 1), 2000))
        .all()
    )

    buf = StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "device_id", "event_type", "state", "confidence", "created_at"])
    for e in events:
        w.writerow([e.id, e.device_id, e.event_type, e.state, e.confidence, e.created_at.isoformat() if e.created_at else None])

    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=lifebridge_logs.csv"}
    )
