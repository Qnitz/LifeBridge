# LifeBridge AI Coding Agent Instructions

## Project Overview
LifeBridge is a modular, edge-oriented system for detecting, processing, and reacting to critical events in real time. The implementation follows a pipeline-style architecture focused on clear data flow, reliability, and gradual scalability.

## Architecture & Component Structure

### Core Modules
- **`src/core/`**: Foundational types and interfaces (e.g., `Event` dataclass with id, timestamp, source, payload, type)
- **`src/pipeline/`**: Event processing pipeline stages (currently empty template, will contain ingestion, detection, routing logic)
- **`src/config/`**: Configuration management (currently empty template)
- **`src/utils/`**: Utility functions and helpers (currently empty template)

### Data Flow Model
Events flow through distinct stages:
1. **Input Ingestion**: Receive/ingest events from external sources
2. **Event Detection**: Classify and detect critical events
3. **Routing**: Route events to relevant handlers
4. **Output/Alerting**: Execute handlers and alert mechanisms

All stages work with the central `Event` type defined in `src/core/event.py`.

## Key Design Patterns

### Event-Driven Architecture
- Central event type: `Event` dataclass (id, timestamp, source, payload, type)
- All components operate on events as the primary data unit
- Loose coupling between pipeline stages enables extensibility

### Module Organization
- Each module (pipeline, config, utils) starts as a template with `__init__.py`
- Imports from `src/core` are primary; avoid cross-module circular dependencies
- Use type hints throughout (Python 3.10+ union syntax supported)

## Development Conventions

### Code Style
- Use dataclasses for data structures (see `Event` as example)
- Leverage Python 3.10+ features (union types with `|` syntax, match statements if appropriate)
- Include type hints for all function parameters and returns
- Keep functions focused with clear single responsibilities

### Testing
- Tests are in `/tests` directory (parallel structure to `/src`)
- Current state: minimal setup; establish patterns early for CI/CD readiness
- Execute tests via `python -m pytest` in project root

### Documentation Artifacts
- Architecture decisions documented in `/docs` (LDD - Logical Design Document)
- Diagrams in `/diagrams` (UML and architecture diagrams)
- Inline code comments explain the "why", not the "what"

## Common Tasks & Workflows

### Adding a New Event Handler
1. Create handler module in `src/pipeline/` (e.g., `src/pipeline/handlers/my_handler.py`)
2. Import `Event` from `src/core.event`
3. Define handler function with signature: `def handle(event: Event) -> Any`
4. Register handler in routing logic (pipeline initialization code)

### Extending Event Type
- Modify `src/core/event.py` dataclass if adding core properties
- Use event `payload` (Dict[str, Any]) for type-specific data to avoid over-coupling
- Update type hints and ensure backward compatibility with existing event sources

### Running the Application
- Entry point: `src/main.py`
- Run: `python src/main.py` from project root
- No configuration files required yet (config module is scaffolding)

## Project-Specific Patterns to Avoid

### Anti-Patterns
- Avoid importing from non-core modules directly; use clear module boundaries
- Don't hardcode event types; use the `type` field of Event
- Don't create tightly coupled handler chains; route via central pipeline
- Avoid early optimization; this project prioritizes correctness and clarity

## Important Files & Quick Reference

| File | Purpose |
|------|---------|
| [src/core/event.py](src/core/event.py) | Core Event dataclass definition |
| [src/main.py](src/main.py) | Application entry point |
| [README.md](README.md) | Project scope and high-level architecture |
| [docs/](docs/) | Design documents (LDD, SRS) |

## When Implementing Features

1. **Understand the event flow**: Trace where events originate, how they're processed, where they're routed
2. **Preserve simplicity**: Add only what's needed; future-proof via the `Event.payload` extensibility
3. **Reference the pipeline stages**: New logic fits into one of the 4 stages above; if not, reconsider the design
4. **Maintain module boundaries**: Core → Pipeline → Handlers; avoid reverse dependencies
5. **Plan for testing**: Consider how to mock Events and test handlers in isolation
