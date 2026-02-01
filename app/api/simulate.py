import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.config_service import get_config
from app.services.event_router import ingest_event
from app.api.auth import get_current_user

router = APIRouter()

@router.post("/api/simulate/walk")
def simulate_walk(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    cfg = get_config(db, user)
    device_id = str(cfg.get("device_id") or "SIM_DEVICE_1")
    confidence = round(random.uniform(0.3, 0.6), 2)
    return ingest_event(
        db=db,
        user_id=user,
        device_id=device_id,
        event_type="WALKING",
        state="normal",
        confidence=confidence,
        raw_data=None,
    )

@router.post("/api/simulate/fall")
def simulate_fall(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    cfg = get_config(db, user)
    device_id = str(cfg.get("device_id") or "SIM_DEVICE_1")
    return ingest_event(
        db=db,
        user_id=user,
        device_id=device_id,
        event_type="FALL_CONFIRMED",
        state="danger",
        confidence=0.96,
        raw_data=None,
    )
