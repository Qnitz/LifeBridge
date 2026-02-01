from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.settings import Settings
from app.db.session import get_db
from app.db.models import User

router = APIRouter()
settings = Settings()

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

def _issue_token(username: str) -> dict:
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": username,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(hours=8)).timestamp()),
        },
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )
    return {"access_token": token, "token_type": "bearer"}

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
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if user and user.password == payload.password:
        return _issue_token(payload.username)

    if payload.username != settings.auth_username or payload.password != settings.auth_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return _issue_token(payload.username)

@router.post("/api/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")

    user = User(username=payload.username, password=payload.password)
    db.add(user)
    db.commit()
    db.refresh(user)

    return _issue_token(payload.username)
