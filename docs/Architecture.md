# System Architecture — HorizonCare AI Medical Center

## Overview
HorizonCare AI Medical Center uses a decoupled Client-Server architecture designed to scale independently and deliver maximum visual reactivity.

```
                  ┌──────────────────────┐
                  │   React frontend     │
                  │   (localhost:5173)   │
                  └──────────┬───────────┘
                             │
                      HTTP REST / JSON
                             │
                             ▼
                  ┌──────────────────────┐
                  │   FastAPI Backend    │
                  │   (localhost:8000)   │
                  └────┬────────────┬────┘
                       │            │
             SQLAlchemy│            │HTTP (SDK)
                 (ORM) │            │
                       ▼            ▼
         ┌────────────────┐      ┌────────────────┐
         │  MySQL Database│      │   Gemini AI    │
         │(localhost:3306)│      │(flash-latest)  │
         └────────────────┘      └────────────────┘
```

## Component Breakdown

### 1. Frontend Client
- **Tech Stack:** React 18, React Router v6, Axios, Vanilla CSS Variables, React Icons.
- **Routing:** Protected routing system separating `PATIENT`, `DOCTOR`, `RECEPTIONIST`, and `ADMIN` layout portals.
- **Visuals:** Modern SaaS layout focusing on clean light palettes, rounded corners (`16-20px`), smooth spring transitions, and interactive stat cards.

### 2. Backend Server
- **Tech Stack:** FastAPI, SQLAlchemy ORM, PyMySQL, Python-JOSE (JWT tokens), Passlib (bcrypt).
- **Authentication:** OAuth2 Password Bearer flow. JWT authorization tokens issued upon successful login validation.
- **Middlewares:** CORS middleware restricting resource loading to frontend origins.

### 3. Database Layer
- **Storage:** Relational MySQL schema mapping user accounts, doctor profiles, availability logs, appointments, QR scan records, and historical conversation histories.
- **ORM:** Sync SQLAlchemy Session pooling.

### 4. AI Orchestrator Service
- **Model:** `gemini-flash-latest` (free-tier with 1,500 requests/day).
- **Tool Orchestrator:** Maps database functions to Gemini via JSON Function Schemas. If Gemini returns `function_call`, the backend executes the corresponding python method (via SQL ORM) and sends the query outputs back to Gemini to formulate natural text responses.
