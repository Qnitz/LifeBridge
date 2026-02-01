from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.config_service import get_config, set_config

router = APIRouter()

class ConfigUpdate(BaseModel):
    alert_confidence_threshold: float | None = None
    high_severity_threshold: float | None = None
    fall_probability: float | None = None  # simulator
    device_id: str | None = None

@router.get("/api/config")
def read_config(db: Session = Depends(get_db)):
    return get_config(db)

@router.put("/api/config")
def update_config(payload: ConfigUpdate, db: Session = Depends(get_db)):
    cfg = get_config(db)
    for k, v in payload.model_dump(exclude_none=True).items():
        cfg[k] = v
    return set_config(db, cfg)
