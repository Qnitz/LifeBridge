# LifeBridge 🛡️
**Advanced Fall Detection & Medical Monitoring System**

LifeBridge is a modular, edge-oriented system designed to detect, process, and react to critical events in real time. The project focuses on clear data flow, reliability, and architectural clarity, following the decisions defined in the system's Design Documents.

## 🚀 Features
* **Physics-Based Detection**: Analyzes X, Y, and Z acceleration to distinguish between walking and high-G impacts using Signal Vector Magnitude (SVM).
* **Live Sensor Dashboard**: Real-time multi-line chart (Chart.js) visualizing motion data across three axes.
* **Emergency Interlock**: Automatically pauses monitoring and locks the UI upon fall detection until a "Safe" confirmation is received.
* **Smart Alerts**: Deduplication logic to prevent caregiver alert fatigue.
* **Scalable Architecture**: FastAPI backend with an asynchronous simulation engine and SQLite persistence.

## 🛠️ Technical Overview
The system utilizes the **Signal Vector Magnitude (SVM)** formula to identify anomalies:
$$Total\ Acceleration = \sqrt{x^2 + y^2 + z^2}$$
* **Walking**: Normal rhythmic oscillations around 9.8 m/s² (Gravity).
* **Fall**: Sharp spikes exceeding 25 m/s² (2.5G impact) followed by potential inactivity.

## 📥 Installation & Setup
1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt

Run the Simulator:Bashpython scripts/test_sensor.py

💻 Development Workflow (VS Code)This project includes a pre-configured .vscode/launch.json file. To run the project:Open the project folder in Visual Studio Code.Press F5 or go to the "Run and Debug" tab.Select "Launch LifeBridge" to start the FastAPI server automatically.

📁 Repository Structure

/app: Application source code including API routes, database models, and core.

services./scripts: Setup and utility scripts, including the manual sensor simulator.

/static & /templates: Frontend visualization layer and UI assets.

/docs: Design documents (SRS, LDD, and notes).

