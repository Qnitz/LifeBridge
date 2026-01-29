from typing import Iterable
from core.event import Event
from datetime import datetime
from uuid import uuid4

from src.core import event


class Pipeline:
    def ingest(self):
        yield Event(
            id=str(uuid4()),
            timestamp=datetime.utcnow(),
            source="test",
            payload={"msg": "hello"},
        )

    def process(self, event: Event) -> Event:
        raise NotImplementedError

    def output(self, event: Event) -> None:
        raise NotImplementedError

    def run(self) -> None:
        for event in self.ingest():
            processed = self.process(event)
            self.output(processed)

    def process(self, event: Event) -> Event:
        return event






