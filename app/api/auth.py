from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from app.core.settings import Settings

router = APIRouter()
settings = Settings()

class LoginRequest(BaseModel):
    username: str
    password: str

def get_current_user(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=401, detail="Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=401, detail="Invalid token")
    return str(subject)

@router.post("/api/login")
def login(payload: LoginRequest):
    if payload.username != settings.auth_username or payload.password != settings.auth_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": payload.username,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(hours=8)).timestamp()),
        },
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    return {"access_token": token, "token_type": "bearer"}
