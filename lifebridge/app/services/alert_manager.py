from sqlalchemy.orm import Session
from app.db.models import Alert, Event
from app.services.notifications import send_sms_alert

def should_alert(event: Event, cfg: dict) -> bool:
    threshold = float(cfg.get("alert_confidence_threshold", 0.8))
    return event.event_type in {"FALL_SUSPECTED", "FALL_CONFIRMED"} and float(event.confidence) >= threshold # type: ignore

def create_alert(db: Session, event: Event, cfg: dict) -> Alert:
    high_threshold = float(cfg.get("high_severity_threshold", 0.92))
    severity = "HIGH" if float(event.confidence) >= high_threshold else "MED" # type: ignore

    # --- THE GATEKEEPER ---
    # 1. Check if a HIGH alert is ALREADY active.
    if severity == "HIGH":
        existing_alert = db.query(Alert).filter(
            Alert.status == "ACTIVE",
            Alert.severity == "HIGH"
        ).first()
        
        if existing_alert:
            # 2. If yes, IGNORE this new signal. 
            # This stops the "multiple alarms" problem instantly.
            print(f"⚠️ Duplicate fall ignored. Alert {existing_alert.id} is already active.")
            return existing_alert
    # ----------------------

    # 3. Create new alert only if the gate is open (no active alerts)
    alert = Alert(event_id=event.id, severity=severity, status="ACTIVE")
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Send SMS
    if severity == "HIGH":
        msg = f"Fall Detected! Device {event.device_id}. Confidence: {int(event.confidence * 100)}%. Please check immediately." # type: ignore
        send_sms_alert(msg)

    return alert