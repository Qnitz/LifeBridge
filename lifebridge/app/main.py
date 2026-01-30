import asyncio
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.events import router as events_router
from app.db.session import init_db, SessionLocal
from app.services.config_service import get_config
from app.services.simulator import next_activity_event
from app.services.event_router import ingest_event
from app.db.models import Event, Alert 
from app.api.status import router as status_router
from app.api.activity import router as activity_router 
from app.api.alerts import router as alerts_router
from app.api.config import router as config_router
from app.api.logs import router as logs_router


app = FastAPI(title="LifeBridge Backend", version="1.0.0")

app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(events_router)
app.include_router(status_router)
app.include_router(activity_router)
app.include_router(alerts_router)
app.include_router(config_router)
app.include_router(logs_router)

@app.on_event("startup")
async def startup():
    init_db()
    # start simulator task
    asyncio.create_task(simulator_loop())

@app.get("/", response_class=HTMLResponse)
def index():
    return FileResponse("templates/index.html")

async def simulator_loop():
    while True:
        db: Session | None = None
        try:
            db = SessionLocal()
            
            # --- SIMPLIFIED PAUSE LOGIC ---
            # If there is ANY un-acknowledged HIGH severity alert, we must pause.
            # This ensures safety. The Frontend will now detect this state properly.
            active_high = db.query(Alert).filter(Alert.status == "ACTIVE", Alert.severity == "HIGH").first()
            
            if active_high:
                await asyncio.sleep(1)
                db.close()
                continue # PAUSE HERE
            # ------------------------------

            cfg = get_config(db)
            ev = next_activity_event(cfg)
            ingest_event(
                db, 
                ev["device_id"], 
                ev["event_type"], 
                ev["state"], 
                ev["confidence"],
                raw_data=ev.get("raw_data") 
            )
            
        except Exception as e:
            print(f"Simulator Error: {e}")
            pass
        finally:
            try:
                if db:
                    db.close()
            except Exception:
                pass

        await asyncio.sleep(0.5)