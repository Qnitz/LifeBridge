from dataclasses import dataclass
from typing import Any, Dict
from datetime import datetime


@dataclass
class Event:
    id: str
    timestamp: datetime
    source: str
    payload: Dict[str, Any]
    type: str | None = None

