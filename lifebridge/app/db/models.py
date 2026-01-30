from sqlalchemy import JSON, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True, nullable=False, default="SIM_DEVICE_1")
    event_type = Column(String, index=True, nullable=False)
    state = Column(String, index=True, nullable=False)
    confidence = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    raw_data = Column(JSON, nullable=True)

    alert = relationship("Alert", back_populates="event", uselist=False)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), unique=True, nullable=False)
    severity = Column(String, nullable=False, default="HIGH")
    status = Column(String, index=True, nullable=False, default="ACTIVE")  # ACTIVE/ACKED/RESOLVED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)

    event = relationship("Event", back_populates="alert")

class ConfigKV(Base):
    __tablename__ = "config"
    key = Column(String, primary_key=True)
    value_json = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
