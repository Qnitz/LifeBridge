import random
import datetime
import numpy as np

# Configuration
GRAVITY = 9.8  # m/s^2

def now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).astimezone().isoformat(timespec="seconds")

def generate_walking_data(t):
    """
    Generates smooth sine waves to mimic human walking.
    Returns: x, y, z
    """
    # Y-axis: Vertical bounce (Gravity + step fluctuation)
    y = GRAVITY + 0.5 * np.sin(2 * np.pi * 2 * t)
    
    # X-axis: Side-to-side sway (half step speed)
    x = 0.2 * np.sin(2 * np.pi * 1 * t)
    
    # Z-axis: Forward/Backward surge
    z = 0.3 * np.cos(2 * np.pi * 2 * t)
    
    # Add natural sensor noise
    noise = np.random.normal(0, 0.1, 3) 
    return x + noise[0], y + noise[1], z + noise[2]

def generate_fall_impact():
    """
    Generates a chaotic high-G impact vector.
    This simulates the exact moment the device hits the ground.
    """
    # Impact Magnitude: Random between 25 m/s^2 (~2.5g) and 60 m/s^2 (~6g)
    impact_force = random.uniform(25, 65)
    
    # Random 3D direction for the impact
    phi = random.uniform(0, 2 * np.pi)
    theta = random.uniform(0, np.pi)
    
    x = impact_force * np.sin(theta) * np.cos(phi)
    y = impact_force * np.sin(theta) * np.sin(phi)
    z = impact_force * np.cos(theta)
    
    return x, y, z

def detect_fall(x, y, z):
    """
    The BRAIN 🧠: Analyzes raw physics data to detect anomalies.
    Returns: (is_fall: bool, confidence: float, total_acc: float)
    """
    # Calculate Total Acceleration Vector (SVM)
    total_acc = np.sqrt(x**2 + y**2 + z**2)
    
    # --- LOGIC GATES ---
    # Threshold 1: Hard Impact (Greater than 2.5g)
    IMPACT_THRESHOLD = 24.0 
    # Threshold 2: Free Fall (Less than 0.2g)
    FREEFALL_THRESHOLD = 2.0
    
    is_fall = False
    confidence = 0.0
    
    if total_acc > IMPACT_THRESHOLD:
        is_fall = True
        # Calculate confidence based on impact severity (capped at 99%)
        # The harder the hit, the more confident we are.
        confidence = min(0.85 + (total_acc - IMPACT_THRESHOLD) / 50.0, 0.99)
        
    elif total_acc < FREEFALL_THRESHOLD:
        # Freefall detected (usually precedes impact)
        # We flag it, but with lower confidence since we haven't hit ground yet
        is_fall = True 
        confidence = 0.65 
        
    return is_fall, confidence, total_acc

def next_activity_event(cfg: dict) -> dict:
    device_id = str(cfg.get("device_id", "SIM_DEVICE_1"))
    
    # 1. PHYSICS PHASE: What is happening to the body?
    p_fall = float(cfg.get("fall_probability", 0.04))
    
    if random.random() < p_fall:
        # A fall is physically occurring -> Generate Impact Data
        x, y, z = generate_fall_impact()
    else:
        # Just walking -> Generate Walking Data
        t = datetime.datetime.now().timestamp()
        x, y, z = generate_walking_data(t)

    # 2. DETECTION PHASE: What does the sensor see?
    # We feed the *generated physics* into the *detector*.
    is_detected, confidence, total_acc = detect_fall(x, y, z)
    
    # 3. REPORTING PHASE: Construct the event
    timestamp = now_iso()
    
    if is_detected:
        return {
            "device_id": device_id,
            "event_type": "FALL_CONFIRMED",
            "state": "danger",
            "confidence": round(confidence, 2),
            "timestamp": timestamp,
            "raw_data": {"x": round(x, 1), "y": round(y, 1), "z": round(z, 1)}
        }
    else:
        return {
            "device_id": device_id,
            "event_type": "WALKING",
            "state": "normal",
            "confidence": round(random.uniform(0.8, 0.95), 2),
            "timestamp": timestamp,
            "raw_data": {"x": round(x, 1), "y": round(y, 1), "z": round(z, 1)}
        }