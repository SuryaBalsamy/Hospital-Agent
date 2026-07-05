from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    User, Doctor, Appointment, AppointmentStatus, ConsultationNote,
    Notification, NotificationType
)
from app.schemas.schemas import DoctorOut, AppointmentOut, ConsultationEnd, ConsultationNoteOut
from app.utils.auth import require_doctor

router = APIRouter()


@router.get("/", response_model=list[DoctorOut])
def list_all_doctors(db: Session = Depends(get_db)):
    """Public endpoint — list all doctors."""
    return db.query(Doctor).all()


@router.get("/profile", response_model=DoctorOut)
def get_doctor_profile(
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.user_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor


@router.get("/today-appointments", response_model=list[AppointmentOut])
def get_today_appointments(
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.user_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    today = date.today()
    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == doctor.doctor_id,
            Appointment.appointment_date == today,
        )
        .order_by(Appointment.appointment_time)
        .all()
    )
    return appointments


@router.get("/upcoming-appointments", response_model=list[AppointmentOut])
def get_upcoming_appointments(
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.user_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    today = date.today()
    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == doctor.doctor_id,
            Appointment.appointment_date >= today,
            Appointment.status != AppointmentStatus.CANCELLED
        )
        .order_by(Appointment.appointment_date, Appointment.appointment_time)
        .all()
    )
    return appointments


@router.get("/waiting-queue", response_model=list[AppointmentOut])
def get_waiting_queue(
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.user_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    today = date.today()
    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == doctor.doctor_id,
            Appointment.appointment_date == today,
            Appointment.status.in_([AppointmentStatus.WAITING, AppointmentStatus.IN_CONSULTATION])
        )
        .order_by(Appointment.queue_position)
        .all()
    )
    return appointments


@router.post("/appointments/{appointment_id}/start-consultation", response_model=AppointmentOut)
def start_consultation(
    appointment_id: int,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.user_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    appointment = db.query(Appointment).filter(
        Appointment.appointment_id == appointment_id,
        Appointment.doctor_id == doctor.doctor_id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status != AppointmentStatus.WAITING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot start consultation. Patient status must be WAITING, current is '{appointment.status.value}'."
        )

    # Check if doctor has another active consultation
    active = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.doctor_id,
        Appointment.status == AppointmentStatus.IN_CONSULTATION
    ).first()
    if active:
        raise HTTPException(
            status_code=400,
            detail=f"You already have an active consultation in progress (Patient: {active.patient.full_name}). Complete it first."
        )

    appointment.status = AppointmentStatus.IN_CONSULTATION
    appointment.consultation_start = datetime.now()
    db.commit()
    db.refresh(appointment)
    return appointment


@router.post("/appointments/{appointment_id}/end-consultation", response_model=ConsultationNoteOut)
def end_consultation(
    appointment_id: int,
    payload: ConsultationEnd,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.user_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    appointment = db.query(Appointment).filter(
        Appointment.appointment_id == appointment_id,
        Appointment.doctor_id == doctor.doctor_id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status != AppointmentStatus.IN_CONSULTATION:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot end consultation. Appointment status must be IN_CONSULTATION, current is '{appointment.status.value}'."
        )

    # Create ConsultationNote
    note = ConsultationNote(
        appointment_id=appointment.appointment_id,
        diagnosis=payload.diagnosis,
        prescription=payload.prescription,
        doctor_notes=payload.doctor_notes,
        follow_up_required=payload.follow_up_required,
        follow_up_date=payload.follow_up_date
    )
    db.add(note)

    # Complete the appointment
    appointment.status = AppointmentStatus.COMPLETED
    appointment.consultation_end = datetime.now()

    # Create notification for patient
    notification = Notification(
        patient_id=appointment.patient_id,
        notification_type=NotificationType.COMPLETED,
        title="Consultation Completed",
        message=f"Your consultation with Dr. {doctor.doctor_name} is complete. View your prescription in your history."
    )
    db.add(notification)

    db.commit()
    db.refresh(note)
    return note


@router.get("/{doctor_id}", response_model=DoctorOut)
def get_doctor_by_id(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor
