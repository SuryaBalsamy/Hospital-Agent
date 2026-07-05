# HorizonCare AI Medical Center

> **Intelligent Healthcare. Compassionate Care.**

---

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-emerald?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)](https://react.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql&logoColor=white)](https://mysql.com)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Flash-violet?logo=google-gemini&logoColor=white)](https://ai.google.dev)
[![JWT](https://img.shields.io/badge/JWT-Secure-gold?logo=json-web-tokens&logoColor=white)](https://jwt.io)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Introduction
HorizonCare AI Medical Center is a premium, state-of-the-art Hospital Management System designed to bridge the gap between intelligent automated medical coordination and patient-centered clinical operations. Engineered as a high-performance modern SaaS, it provides patients, doctors, receptionists, and administrators with role-specific dashboards, a conversational AI health assistant, real-time queue orchestration, and streamlined check-ins.

## 📌 Problem Statement
Traditional hospital setups suffer from:
1. **Inefficient Wards Navigation:** Patients struggle to find testing rooms, pharmacies, or wards.
2. **Scheduling Bottlenecks:** Heavy queues and high wait times at reception desks.
3. **Lack of 24/7 Patient Inquiries Support:** Trivial patient queries about symptoms, departments, and doctors tie up receptionist resources.
4. **Disjointed Clinical Workflows:** Disconnected tracking of patient queue positions, arrival confirmations, and doctor schedule updates.

## 🎯 Objectives
- **Intelligent LLM Tool Use:** Provide an AI Assistant driven by Google Gemini for symptom-to-department routing, doctor checks, floor navigation, and slot preparation.
- **Fast-Path Confirmed Actions:** Bypass LLM delays instantly for booking confirmations (e.g. "Yes", "Proceed") via direct DB triggers.
- **Dynamic Queue Management:** Receptionist checks log instant arrival check-ins, updating the doctor's live waiting queue.
- **Premium SaaS Theme:** A beautiful, responsive light theme featuring smooth spring animations, unified typography, custom icons, and visual indicators.

---

## 🚀 Key Features

### 🤖 AI Health Orchestrator
- **Symptom Checker:** Maps natural language complaints to corresponding clinical departments and matching specialists.
- **Dynamic Floor Navigator:** Resolves real-time directions for wards, testing rooms, cafeteria, and billing counters using live database mappings.
- **Self-Booking assistant:** Prepares bookings and coordinates reservations interactively.
- **ChatGPT-Style Layout:** Smooth typing animations, pill suggestion chips, message copying, and clean light UI.

### 👥 Role-Based Modules
- **Patient Dashboard:** View upcoming appointment cards, medical logs, dynamic queue status estimates, and chat history.
- **Doctor Dashboard:** Manage active upcoming appointments (excluding cancelled records) with tab toggles for today's schedule vs upcoming weeks.
- **Receptionist Dashboard:** Live daily queue lists, checkout logs, and instant patient check-in scans.
- **Admin Console:** Hospital analytics, stats tracking, department registries, and doctor records management.

---

## 🛠️ Technology Stack
- **Frontend:** React 18, React Router v6, Axios, Vanilla CSS Variables, React Icons, Outfit Font.
- **Backend:** Python 3.10+, FastAPI, SQLAlchemy, PyMySQL, Python-JOSE (JWT tokens), Passlib (Bcrypt hashing).
- **LLM Engine:** Gemini AI Model (`gemini-flash-latest`).
- **Database:** MySQL 8.0+.
- **Containerization:** Docker & Docker Compose.

---

## 📁 Repository Structure
```
Hospital-Agent/
├── backend/
│   ├── app/
│   │   ├── agent/             # LLM tool definition and database executor logic
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── routers/           # Auth, Patients, Doctors, Receptionists routers
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── services/          # Gemini AI services integration
│   │   └── utils/             # Hashing, auth guards, JWT helpers
│   ├── .env.example
│   ├── Dockerfile
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/        # Sidebar, topnav, ProtectedRoute, loading components
│   │   ├── context/           # React AuthContext
│   │   ├── pages/             # Landing, Auth, Doctor, Patient, Receptionist, Admin pages
│   │   ├── services/          # Axios API communication services
│   │   └── styles/            # Global stylesheets and SaaS Light Theme
│   ├── Dockerfile
│   └── vite.config.js
├── docs/                      # Architectural, Database, API, and report files
├── screenshots/               # Application UI captures
├── docker-compose.yml
└── README.md
```

---

## ⚡ Setup & Local Installation

### 1. Database Configuration
1. Start your local MySQL instance.
2. Initialize the schema using the script defined in [docs/Database.md](docs/Database.md).
3. Seed baseline users and configurations.

### 2. Backend Installation
1. Move to backend directory and create virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Create your local configuration file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Update environment parameters:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hospital_ai_assistant
   SECRET_KEY=your_secure_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the server:
   ```bash
   python run.py
   ```

### 3. Frontend Installation
1. Move to frontend directory:
   ```bash
   cd ../frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open browser to **[http://localhost:5173](http://localhost:5173)** to see the demo!

---

## 🐳 Deployment (Docker Compose)
To run the complete ecosystem (MySQL, FastAPI Backend, React Frontend) inside Docker containers:
```bash
docker-compose up --build
```
The client will bind to `http://localhost` (port 80), proxying `/api` requests to the FastAPI backend running at `http://localhost:8000`.

---

## 🔒 Security Compliance
- **No Credentials Transmitted:** `.gitignore` excludes all `.env` files, build caches, and node dependencies.
- **Client Sandbox:** The React client executes entirely in the user's browser; all secrets (database passwords, JWT keys, Gemini API keys) are strictly sandboxed on the FastAPI backend.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author
- **Surya Balsamy** - Lead Developer & Software Engineer (SuryaBalsamy)
