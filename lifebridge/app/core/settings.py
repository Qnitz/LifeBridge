from pydantic import BaseModel

class Settings(BaseModel):
    db_url: str = "sqlite:///./lifebridge.db"
    simulator_interval_ms: int = 500
