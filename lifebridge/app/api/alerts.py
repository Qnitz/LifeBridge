from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Alert

router = APIRouter()

# 1. GET: List all alerts (This is why you can see them)
@router.get("/api/alerts")
def get_alerts(limit: int = 10, db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()

# 2. POST: Resolve an alert (This is the MISSING part causing the 404)
@router.post("/api/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    # Find the alert
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Mark it as resolved
    alert.status = "RESOLVED" # type: ignore
    db.commit()
    
    return {"status": "resolved", "id": alert_id}