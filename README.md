# RootAI — Soil Health Dashboard from Sensor Logs

> A sensor-driven web system that processes soil sensor logs, visualizes soil health trends, detects threshold breaches, and recommends optimal planting windows.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [End-to-End Workflow](#end-to-end-workflow)
- [API Documentation](#api-documentation)
- [Module-wise Development](#module-wise-development)
- [Team](#team)
- [Future Scope](#future-scope)
- [Known Limitations](#known-limitations)
- [Impact](#impact)

---

## Problem Statement

Modern farms increasingly use sensors to monitor soil parameters such as pH, moisture, nitrogen levels, and temperature. However, raw sensor logs provide limited insight without structured analysis. Farmers need meaningful interpretation of soil health trends to determine planting windows and manage crop health proactively.

### The Problem

There is no structured tool that:

- Ingests time-series soil sensor data
- Tracks long-term soil health trends
- Detects threshold breaches
- Correlates soil parameters with historical yield data
- Provides actionable planting recommendations

Challenges include:

- Implementing time-series analysis
- Handling multi-parameter correlation
- Designing meaningful alert thresholds
- Avoiding false-positive alerts
- Raw data without interpretation limits practical value

### The Consequence

Without analytical dashboards:

- Soil degradation may go unnoticed
- Planting decisions are poorly timed
- Yield predictions are inaccurate
- Resource application becomes reactive
- Long-term soil health declines

Missed early signals reduce productivity and sustainability.

### The Challenge

Can we build a Soil Health Dashboard that:

- Processes sensor logs from CSV inputs
- Visualizes trends in soil parameters
- Detects critical threshold breaches
- Correlates soil conditions with historical yield
- Recommends optimal planting windows
- Provides clear, actionable alerts

The objective is to convert sensor data into meaningful agricultural intelligence.

### Target Users

| User Type | Description |
|---|---|
| Farmers | Primary beneficiaries for on-ground decision-making |
| Agricultural Consultants | Data-backed advisory services |
| Agri-tech Startups | Integration into existing platforms |
| Government Departments | Policy and analytics support |
| NGOs | Rural farming outreach programs |

---

## Solution Overview

RootAI is a full-stack web application that ingests soil sensor data exported as CSV files, processes it through a rule-based analysis engine, and presents meaningful agricultural intelligence through an interactive dashboard. Users can select a field, view soil health trends over time, receive threshold-based alerts, and get planting window recommendations — all without requiring a trained ML model or laboratory input.

---

## Key Features

### Core (Built)

- **Multi-Field Data Support** — Dropdown-based field selection to load and analyze sensor logs per field
- **Soil Health Score (0–100)** — Rule-based scoring engine that evaluates soil parameters and outputs a normalized health score
- **Trend Visualization** — Per-field time-series charts for pH, moisture, nitrogen, temperature, and other parameters
- **Smart Alerts** — Threshold-based and trend-based alerts that flag anomalies and avoid false positives
- **Planting Window Recommendation** — Actionable recommendations on optimal planting periods based on current soil conditions

### Optional (If Time Permits)

- **Soil Stability Index** — Composite metric reflecting the consistency and reliability of soil conditions over time

---

## System Architecture

```
Sensor --> CSV File --> Backend (Node.js + CSV Parser) --> Rule-Based Engine --> Frontend Dashboard
```

### Components

**1. Frontend**
- Built with HTML, CSS, and JavaScript
- Field selection via dropdown
- Displays trend charts, health score, alerts, and planting recommendations
- Communicates with backend via REST API

**2. Backend**
- Built with Node.js and Express.js
- Reads and parses CSV files using a CSV parser library
- Runs rule-based logic for soil health scoring, alert detection, and planting window calculation
- Serves structured JSON responses to the frontend

**3. Data Layer (CSV)**
- Sensor data exported as CSV files
- Each file represents time-series readings for a field
- Parameters include: pH, moisture, nitrogen (N), phosphorus (P), potassium (K), temperature

**4. Database (MongoDB)**
- Stores parsed sensor records
- Stores computed health scores and alert logs
- Supports historical trend queries

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Data Parsing | csv-parser (Node.js library) |
| Rule Engine | Custom JavaScript logic |
| Database | MongoDB |
| Deployment | AWS / Render / Vercel *(to be finalized)* |

---

## End-to-End Workflow

1. Soil sensors collect field data and export it as a CSV file
2. CSV file is uploaded to the system via the dashboard
3. Backend parses and validates the incoming data
4. Rule-based engine evaluates soil parameters against defined thresholds
5. Soil health score (0–100) is calculated and classified
6. Crop recommendation logic runs based on current soil conditions
7. Results and sensor records are stored in MongoDB
8. API sends structured response back to the frontend
9. Dashboard renders health score, alerts, trends, and crop recommendations
10. Farmer reviews insights and makes informed planting decisions

---

## API Documentation

> Full API documentation to be completed.

**Base URL:** `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload` | Upload CSV sensor log for a field |
| GET | `/fields` | List all available fields |
| GET | `/field/:id/score` | Get soil health score for a field |
| GET | `/field/:id/trends` | Get trend data for a field |
| GET | `/field/:id/alerts` | Get active alerts for a field |
| GET | `/field/:id/planting` | Get planting window recommendation |

**Sample CSV Format:**

```
timestamp,field_id,ph,moisture,nitrogen,phosphorus,potassium,temperature
2024-01-01 08:00,field_1,6.5,42,90,38,45,23.5
2024-01-01 12:00,field_1,6.3,39,88,37,44,25.1
```

**Sample Response — Soil Health Score:**

```json
{
  "field_id": "field_1",
  "score": 74,
  "status": "Moderate",
  "evaluated_at": "2024-01-01T12:00:00Z"
}
```

---

## Module-wise Development

### Checkpoint 1: Research & Planning
- Problem statement finalization
- Architecture planning
- CSV schema design
- Threshold and scoring rule definition
- Git repository setup

### Checkpoint 2: Backend Development
- REST API creation with Express.js
- CSV parsing and ingestion pipeline
- MongoDB integration
- Rule-based scoring and alert engine
- Unit testing

### Checkpoint 3: Frontend Development
- Responsive dashboard UI
- Field selection dropdown
- Trend visualization charts
- Health score display
- Alert and planting window panels
- API integration

### Checkpoint 4: CSV Integration & Rule Engine
- Multi-field CSV support
- Health score computation logic
- Threshold breach detection
- Trend-based alert logic (avoiding false positives)
- Planting window calculation rules

### Checkpoint 5: End-to-End Validation
- Full pipeline testing (CSV to dashboard)
- Alert accuracy verification
- Score consistency checks
- Cross-field data isolation testing

### Checkpoint 6: Deployment
- Backend hosting
- Frontend hosting
- Public live link
- Final system testing

---

## Team

| Member | Role | Responsibilities |
|---|---|---|
| Member 1 | Backend & Integration | API development, CSV ingestion pipeline, database management |
| Member 2 | Data & Logic Engineer | Rule engine, scoring logic, alert thresholds, planting window logic |
| Member 3 | Frontend Developer | UI/UX design, trend charts, dashboard, API integration |

---

## Future Scope

The following features are planned for future expansion beyond the current build:

- Multi-Field Comparison Dashboard
- Yield Correlation Analysis
- PDF Export Reports
- AI-Powered Plain English Insights
- Weather Correlation Engine
- SMS / WhatsApp Alerts
- Predictive Soil Forecasting
- Mobile application development
- Satellite imagery integration
- Government-level agricultural analytics dashboard

---

## Known Limitations

- No live sensor connection; data must be manually exported to CSV
- Rule-based scoring may not generalize across all soil types and regions
- Limited regional threshold calibration
- Internet connection required
- No user authentication in the current build

---

## Impact

RootAI converts raw sensor logs into meaningful agricultural intelligence by:

- Enabling proactive soil health monitoring
- Improving timing of planting decisions
- Reducing soil degradation through early detection
- Supporting data-driven resource application
- Promoting sustainable and productive farming practices

RootAI aims to make smart farming accessible, affordable, and scalable.

---

## License

This project is developed as part of a hackathon. License details to be added.