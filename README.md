# LifeBridge 🛡️
**Advanced Fall Detection & Medical Monitoring System**

LifeBridge is a modular, edge-oriented system designed to detect, process, and react to critical fall events in real time. Built for privacy and reliability, all sensor data is processed locally using physics-based algorithms, ensuring immediate response without cloud dependency.

## Key Features
* **Physics-Based Detection**: Analyzes 3D acceleration (X, Y, Z) to distinguish between normal walking and high-G impacts using the Signal Vector Magnitude (SVM) algorithm.
* **Secure Caregiver Dashboard**: Authenticated web interface (FastAPI + JWT/Session) displaying real-time multi-line charts (Chart.js) and system status.
* **Emergency Interlock**: Automatically pauses monitoring and locks the UI upon fall detection until a caregiver formally "Acknowledges" and "Resolves" the alert.
* **Smart Alerting & Deduplication**: Prevents caregiver alert fatigue through intelligent cooldown windows and state management.
* **Edge-First Architecture**: Lightweight FastAPI backend with an asynchronous simulation engine and zero-config SQLite persistence.

## 🛠️ Technical Overview
The core detection engine utilizes the **Signal Vector Magnitude (SVM)** formula to normalize 3D impact forces into a single deterministic scalar:
$$Total\ Acceleration = \sqrt{x^2 + y^2 + z^2}$$
* **Walking Baseline**: Rhythmic oscillations around 9.8 m/s² (1G).
* **Fall Signature**: Sharp spikes exceeding 24.0 m/s² (>2.4G) followed by an immediate inactivity window.

## Installation & Setup

**1. Create & Activate a Virtual Environment (Recommended)**
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activated

pip install -r requirements.txt

uvicorn app.main:app --reload

Copy the example environment file to set up your local secrets: cp .env.example .env

Open: http://127.0.0.1:8000/login

## Demo checklist
- Login / Register
- Simulate fall
- Acknowledge + resolve alert
- View activity
- Export logs

Documentation
Detailed architectural and design documents are located in the /docs folder:

Project Book & Maintenance Manual

System Architecture & LDD

API & Endpoint Mapping

Database Schema

Endpoint,Method,Description
/login,GET/POST,Caregiver authentication portal.
/api/status,GET,Returns current system state (Normal vs. Danger).
/api/activity,GET,"Historical X,Y,Z and SVM data for chart rendering."
/api/alerts,GET,List of active and resolved fall alerts.
/api/events,POST,Webhook to ingest raw sensor data from edge devices.


Repository Structure
/app: Core application code (/api routes, /db models, /services logic).

/docs: Technical documentation, markdown guides, and architectural decisions.

/scripts: Utility scripts, including the physics-based motion simulator.

/static: Compiled frontend assets (.js, .css, images).

/templates: HTML views rendered by the server.
