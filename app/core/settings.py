from pydantic import BaseModel

class Settings(BaseModel):
    db_url: str = "sqlite:///./lifebridge.db"
    simulator_interval_ms: int = 500
    jwt_secret: str = "lifebridge-dev-secret"
    jwt_algorithm: str = "HS256"
    auth_username: str = "admin"
    auth_password: str = "lifebridge"
