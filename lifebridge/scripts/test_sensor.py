import requests
import time
import random

URL = "http://127.0.0.1:8000/api/events"

def simulate_walking():
    payload = {
        "device_id": "TEST_PHONE_01",
        "event_type": "WALKING",
        "state": "normal",
        "confidence": 0.85,
        "raw_data": {"x": 0.1, "y": 9.8, "z": 0.2} # Add this to keep the graph moving!
    }
    try:
        r = requests.post(URL, json=payload)
        # using \r overwrites the line so it doesn't fill your screen
        print(f"🚶 Walking... (Server: {r.status_code})", end="\r")
    except Exception:
        print("❌ Server offline?      ", end="\r")

def simulate_fall():
    print("\n\n⚠️  FALL DETECTED! SENDING ALERT... ⚠️")
    payload = {
        "device_id": "TEST_PHONE_01",
        "event_type": "FALL_CONFIRMED",
        "state": "danger",
        "confidence": 0.98,
        "raw_data": {"x": 45.0, "y": 12.5, "z": -30.0} # Massive spike for the graph
    }
    try:
        requests.post(URL, json=payload)
        print("🚨 ALERT SENT! Person is down.")
    except Exception as e:
        print(f"❌ Failed to send alert: {e}")

if __name__ == "__main__":
    print("📱 Smart Sensor Simulator Started...")
    print("   The person will walk. If they fall, they will stop moving.")
    
    try:
        while True:
            # 1. Simulate Walking
            if random.random() > 0.05:
                simulate_walking()
                time.sleep(1)
            else:
                # 2. Simulate Fall
                simulate_fall()
                
                # 3. STOP MOVING (Wait for user)
                print("🛑 PARAMEDIC MODE: Client is unconscious. No movement.")
                input("👉 Press [ENTER] to help the client stand up...")
                print("✅ Client is up. Resuming walking...\n")
            
    except KeyboardInterrupt:
        print("\nStopping sensor...")