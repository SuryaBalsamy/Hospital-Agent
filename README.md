# AI Hospital Assistant

A complete modern, responsive, and professional hospital management web application built with a React/Vite frontend and a FastAPI backend. It features role-based authentication and dedicated dashboards for Patients, Doctors, Receptionists, and Admins.

## Tech Stack
- **Frontend**: React, Vite, React Router, Axios, plain CSS with glassmorphism design.
- **Backend**: Python, FastAPI, SQLAlchemy (Sync), PyMySQL, JWT Authentication.
- **Database**: MySQL.

## Project Structure
- `backend/` - Contains the FastAPI application, database models, schemas, routers, and utils.
- `frontend/` - Contains the React Vite frontend application, components, pages, context, and routing.

## Requirements
- Python 3.10+
- Node.js 18+
- MySQL Server

## Setup and Running

### 1. Database Setup
The database schema (`hospital_ai_assistant`) must be loaded into your local MySQL server.
1. Connect to MySQL.
2. Run the provided schema script to create the tables.
3. (Optional) Insert sample data.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Configure environment variables. The `.env` file in `backend/` should match your MySQL setup:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hospital_ai_assistant
SECRET_KEY=hospital_ai_secret_key_2024_secure_random_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Start the backend server:
```bash
python run.py
# Server will run at http://localhost:8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Server will run at http://localhost:5173
```

## Sample Credentials (for testing)
If sample data was loaded into the database:
- **Admin**: `admin` / `admin123`
- **Doctor**: `priya` / `admin123`
- **Receptionist**: `reception1` / `admin123`
