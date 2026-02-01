import os
try:
    from twilio.rest import Client
except ImportError:
    Client = None  # Handle case where twilio isn't installed yet

# --- CONFIGURATION (Enter your Twilio details here) ---
TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN = "your_auth_token_here"
TWILIO_PHONE_NUMBER = "+15550000000"
CAREGIVER_PHONE_NUMBER = "+972500000000"
# ----------------------------------------------------

def send_sms_alert(message_body):
    """
    Sends an SMS using Twilio if configured.
    Otherwise, prints a simulation message to the console.
    """
    # 1. Check if credentials are set (Not default placeholders)
    if "your_auth_token" in TWILIO_AUTH_TOKEN or "ACxxx" in TWILIO_ACCOUNT_SID or Client is None:
        # --- SIMULATION MODE ---
        print("\n" + "="*40)
        print(f"📡 [SIMULATION] SENDING SMS TO CAREGIVER ({CAREGIVER_PHONE_NUMBER})")
        print(f"💬 MESSAGE: {message_body}")
        print("="*40 + "\n")
        return True

    # 2. Real SMS Mode
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"🚨 LifeBridge Alert: {message_body}",
            from_=TWILIO_PHONE_NUMBER,
            to=CAREGIVER_PHONE_NUMBER
        )
        print(f"✅ SMS Sent successfully! SID: {message.sid}")
        return True
    except Exception as e:
        print(f"❌ Failed to send SMS: {e}")
        return False