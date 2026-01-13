from typing import Iterable
from core.event import Event


class Pipeline:
    def ingest(self) -> Iterable[Event]:
        raise NotImplementedError

    def process(self, event: Event) -> Event:
        raise NotImplementedError

    def output(self, event: Event) -> None:
        raise NotImplementedError

    def run(self) -> None:
        for event in self.ingest():
            processed = self.process(event)
            self.output(processed)
