from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.settings import Settings
from app.db.base import Base

SQLALCHEMY_DATABASE_URL = "sqlite:///./app/db/lifebridge.db"
settings = Settings()

engine = create_engine(settings.db_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
