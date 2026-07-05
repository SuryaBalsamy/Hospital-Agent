from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, patients, doctors, receptionists, admin, hospital, ai

app = FastAPI(
    title="Hospital AI Assistant API",
    description="Backend API for the AI-Powered Multispeciality Hospital Assistant",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow frontend dev server
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router,          prefix="/api/auth",          tags=["Authentication"])
app.include_router(patients.router,      prefix="/api/patients",      tags=["Patients"])
app.include_router(doctors.router,       prefix="/api/doctors",       tags=["Doctors"])
app.include_router(receptionists.router, prefix="/api/receptionists", tags=["Receptionists"])
app.include_router(admin.router,         prefix="/api/admin",         tags=["Admin"])
app.include_router(hospital.router,      prefix="/api/hospital",      tags=["Hospital"])
app.include_router(ai.router)

# ---------------------------------------------------------------------------
# Health check & Root
# ---------------------------------------------------------------------------
@app.get("/", tags=["Root"])
def root_index():
    return {
        "message": "HorizonCare AI Medical Center API is running successfully.",
        "health_check": "/api/health",
        "documentation": "/docs"
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Hospital AI Assistant API", "version": "1.0.0"}
