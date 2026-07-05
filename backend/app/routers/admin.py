from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.models import User, Doctor, Receptionist, Patient, Department, Appointment
from app.schemas.schemas import (
    DoctorOut, DoctorCreate, ReceptionistOut, PatientOut,
    DepartmentOut, DepartmentCreate, DashboardStats
)
from app.utils.auth import require_admin

router = APIRouter()


@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    today = date.today()
    return DashboardStats(
        total_patients=db.query(Patient).count(),
        total_doctors=db.query(Doctor).count(),
        total_receptionists=db.query(Receptionist).count(),
        total_departments=db.query(Department).count(),
        today_appointments=db.query(Appointment).filter(
            Appointment.appointment_date == today
        ).count(),
    )


# ---- Doctors ----

@router.get("/doctors", response_model=list[DoctorOut])
def admin_list_doctors(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(Doctor).all()


@router.post("/doctors", response_model=DoctorOut, status_code=201)
def admin_create_doctor(
    payload: DoctorCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doctor = Doctor(**payload.model_dump())
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


@router.delete("/doctors/{doctor_id}", status_code=204)
def admin_delete_doctor(
    doctor_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(doctor)
    db.commit()


# ---- Receptionists ----

@router.get("/receptionists", response_model=list[ReceptionistOut])
def admin_list_receptionists(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(Receptionist).all()


# ---- Patients ----

@router.get("/patients", response_model=list[PatientOut])
def admin_list_patients(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(Patient).all()


# ---- Departments ----

@router.get("/departments", response_model=list[DepartmentOut])
def admin_list_departments(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(Department).all()


@router.post("/departments", response_model=DepartmentOut, status_code=201)
def admin_create_department(
    payload: DepartmentCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Department).filter(
        Department.department_name == payload.department_name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    dept = Department(**payload.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.put("/departments/{dept_id}", response_model=DepartmentOut)
def admin_update_department(
    dept_id: int,
    payload: DepartmentCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    dept = db.query(Department).filter(Department.department_id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(dept, key, value)
    db.commit()
    db.refresh(dept)
    return dept


@router.delete("/departments/{dept_id}", status_code=204)
def admin_delete_department(
    dept_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    dept = db.query(Department).filter(Department.department_id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
