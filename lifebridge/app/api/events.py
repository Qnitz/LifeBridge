from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.services.event_router import ingest_event

router = APIRouter()

# This defines the data format your phone must send
class EventInput(BaseModel):
    device_id: str
    event_type: str  # e.g., "FALL_CONFIRMED" or "WALKING"
    state: str       # e.g., "danger" or "normal"
    confidence: float
    # We can add x,y,z later if we want to log raw data

@router.post("/api/events")
def receive_mobile_event(ev: EventInput, db: Session = Depends(get_db)):
    """
    Receives real sensor data from a mobile phone.
    """
    try:
        # Pass the data into our existing logic engine
        result = ingest_event(
            db=db,
            device_id=ev.device_id,
            event_type=ev.event_type,
            state=ev.state,
            confidence=ev.confidence
        )
        return {"status": "received", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))