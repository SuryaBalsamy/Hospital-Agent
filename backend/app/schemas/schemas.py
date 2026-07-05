from __future__ import annotations
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, time, datetime
from app.models.models import (
    UserRole, DoctorStatus, Gender, DayOfWeek,
    AppointmentStatus, NotificationType, QRScanStatus
)


# ---------------------------------------------------------------------------
# Auth Schemas
# ---------------------------------------------------------------------------

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: UserRole
    full_name: Optional[str] = None
    phone: Optional[str] = None
    # Patient extras
    dob: Optional[date] = None
    gender: Optional[Gender] = None
    blood_group: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    username: str
    full_name: Optional[str] = None


class UserOut(BaseModel):
    user_id: int
    username: str
    email: str
    role: UserRole
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Department Schemas
# ---------------------------------------------------------------------------

class DepartmentCreate(BaseModel):
    department_name: str
    floor: Optional[str] = None
    block_name: Optional[str] = None
    description: Optional[str] = None


class DepartmentOut(BaseModel):
    department_id: int
    department_name: str
    floor: Optional[str] = None
    block_name: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Doctor Schemas
# ---------------------------------------------------------------------------

class DoctorCreate(BaseModel):
    user_id: int
    department_id: int
    doctor_name: str
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    room_number: Optional[str] = None
    status: Optional[DoctorStatus] = DoctorStatus.AVAILABLE


class DoctorOut(BaseModel):
    doctor_id: int
    user_id: int
    department_id: int
    doctor_name: str
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    room_number: Optional[str] = None
    status: Optional[DoctorStatus] = None
    department: Optional[DepartmentOut] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Receptionist Schemas
# ---------------------------------------------------------------------------

class ReceptionistOut(BaseModel):
    receptionist_id: int
    user_id: int
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Patient Schemas
# ---------------------------------------------------------------------------

class PatientCreate(BaseModel):
    full_name: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[Gender] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None


class PatientUpdate(PatientCreate):
    pass


class PatientOut(BaseModel):
    patient_id: int
    user_id: int
    full_name: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[Gender] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Doctor Availability Schemas
# ---------------------------------------------------------------------------

class DoctorAvailabilityOut(BaseModel):
    availability_id: int
    doctor_id: int
    day_of_week: Optional[DayOfWeek] = None
    available_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    max_tokens: Optional[int] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Appointment Schemas
# ---------------------------------------------------------------------------

class AppointmentOut(BaseModel):
    appointment_id: int
    patient_id: int
    doctor_id: int
    availability_id: int
    appointment_date: date
    appointment_time: time
    token_number: Optional[str] = None
    qr_value: Optional[str] = None
    queue_position: Optional[int] = None
    estimated_wait_minutes: Optional[int] = None
    arrival_time: Optional[datetime] = None
    consultation_start: Optional[datetime] = None
    consultation_end: Optional[datetime] = None
    status: Optional[AppointmentStatus] = None
    created_at: Optional[datetime] = None
    doctor: Optional[DoctorOut] = None
    patient: Optional[PatientOut] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Consultation Note Schemas
# ---------------------------------------------------------------------------

class ConsultationNoteOut(BaseModel):
    note_id: int
    appointment_id: int
    diagnosis: Optional[str] = None
    prescription: Optional[str] = None
    doctor_notes: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[date] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Notification Schemas
# ---------------------------------------------------------------------------

class NotificationOut(BaseModel):
    notification_id: int
    patient_id: int
    notification_type: Optional[NotificationType] = None
    title: Optional[str] = None
    message: Optional[str] = None
    is_read: Optional[bool] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Hospital Information Schemas
# ---------------------------------------------------------------------------

class HospitalInfoOut(BaseModel):
    info_id: int
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    floor: Optional[str] = None
    block_name: Optional[str] = None
    landmark: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Admin Dashboard Stats
# ---------------------------------------------------------------------------

class DashboardStats(BaseModel):
    total_patients: int
    total_doctors: int
    total_receptionists: int
    total_departments: int
    today_appointments: int


# ---------------------------------------------------------------------------
# QR Scan Schemas
# ---------------------------------------------------------------------------

class QRScanCreate(BaseModel):
    appointment_id: int


class QRScanOut(BaseModel):
    scan_id: int
    appointment_id: int
    receptionist_id: int
    scan_time: Optional[datetime] = None
    status: Optional[QRScanStatus] = None

    class Config:
        from_attributes = True


class AppointmentBook(BaseModel):
    doctor_id: int
    availability_id: int
    appointment_date: date
    appointment_time: time


class AppointmentReschedule(BaseModel):
    availability_id: int
    appointment_date: date
    appointment_time: time


class ConsultationEnd(BaseModel):
    diagnosis: str
    prescription: str
    doctor_notes: Optional[str] = None
    follow_up_required: bool = False
    follow_up_date: Optional[date] = None

