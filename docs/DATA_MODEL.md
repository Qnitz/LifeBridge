# Data model

## Event
Fields
- id
- user_id
- device_id
- event_type
- state
- confidence
- created_at
- raw_data

Indexes/constraints
- id: primary key
- user_id: index
- device_id: index
- event_type: index
- state: index

Relationships
- Alert 1:1 via Alert.event_id (back_populates=event)

## Alert
Fields
- id
- event_id
- user_id
- severity
- status
- created_at
- acked_at
- acknowledged_at

Indexes/constraints
- id: primary key
- event_id: unique, foreign key -> Event.id
- user_id: index
- status: index

Relationships
- Event 1:1 via event_id (unique)

## ConfigKV
Fields
- key
- user_id
- value_json
- updated_at

Indexes/constraints
- (key, user_id): composite primary key

Relationships
- none

## User
Fields
- id
- username
- password
- created_at

Indexes/constraints
- id: primary key
- username: unique, index

Relationships
- none

## Mermaid ERD

```mermaid
erDiagram
  EVENT {
    int id PK
    string user_id
    string device_id
    string event_type
    string state
    float confidence
    datetime created_at
    json raw_data
  }
  ALERT {
    int id PK
    int event_id FK
    string user_id
    string severity
    string status
    datetime created_at
    datetime acked_at
    datetime acknowledged_at
  }
  CONFIGKV {
    string key PK
    string user_id PK
    string value_json
    datetime updated_at
  }
  USER {
    int id PK
    string username
    string password
    datetime created_at
  }

  EVENT ||--|| ALERT : "event_id (unique)"
```
