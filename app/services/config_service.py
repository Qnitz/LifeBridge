import json
from sqlalchemy.orm import Session
from app.db.models import ConfigKV

DEFAULT_CONFIG = {
    "alert_confidence_threshold": 0.7,
    "high_severity_threshold": 0.92,
    "fall_probability": 0.04,         # simulator only
    "device_id": "SIM_DEVICE_1",
}

def get_config(db: Session, user_id: str) -> dict:
    row = db.query(ConfigKV).filter(ConfigKV.key == "lifebridge", ConfigKV.user_id == user_id).first()
    if not row:
        set_config(db, user_id, DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    try:
        return json.loads(row.value_json)
    except Exception:
        # Recover gracefully
        set_config(db, user_id, DEFAULT_CONFIG)
        return DEFAULT_CONFIG

def set_config(db: Session, user_id: str, new_cfg: dict) -> dict:
    payload = json.dumps(new_cfg)
    row = db.query(ConfigKV).filter(ConfigKV.key == "lifebridge", ConfigKV.user_id == user_id).first()
    if not row:
        row = ConfigKV(key="lifebridge", user_id=user_id, value_json=payload)
        db.add(row)
    else:
        row.value_json = payload
    db.commit()
    return new_cfg
