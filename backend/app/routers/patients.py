import uuid
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    User, Patient, Appointment, Notification, Department, Doctor,
    DoctorAvailability, AppointmentStatus, NotificationType, DayOfWeek
)
from app.schemas.schemas import (
    PatientOut, PatientUpdate, AppointmentOut, NotificationOut,
    DepartmentOut, DoctorOut, DoctorAvailabilityOut, AppointmentBook, AppointmentReschedule
)
from app.utils.auth import require_patient

router = APIRouter()


# ---------------------------------------------------------------------------
# Profile & Notifications
# ---------------------------------------------------------------------------

@router.get("/profile", response_model=PatientOut)
def get_patient_profile(
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return patient


@router.put("/profile", response_model=PatientOut)
def update_patient_profile(
    payload: PatientUpdate,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)
    return patient


@router.get("/notifications", response_model=list[NotificationOut])
def get_patient_notifications(
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    notifications = (
        db.query(Notification)
        .filter(Notification.patient_id == patient.patient_id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return notifications


@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.user_id).first()
    notif = db.query(Notification).filter(
        Notification.notification_id == notification_id,
        Notification.patient_id == patient.patient_id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


# ---------------------------------------------------------------------------
# Department & Doctor Discovery
# ---------------------------------------------------------------------------

@router.get("/departments", response_model=list[DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()


@router.get("/departments/{department_id}/doctors", response_model=list[DoctorOut])
def get_doctors_by_department(department_id: int, db: Session = Depends(get_db)):
    return db.query(Doctor).filter(Doctor.department_id == department_id).all()


@router.get("/doctors/{doctor_id}/availabilities", response_model=list[DoctorAvailabilityOut])
def get_doctor_availabilities(doctor_id: int, db: Session = Depends(get_db)):
    # Load availability for doctor
    return db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == doctor_id).all()


# ---------------------------------------------------------------------------
# Appointments Booking & Management
# ---------------------------------------------------------------------------

@router.get("/appointments", response_model=list[AppointmentOut])
def get_patient_appointments(
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient.patient_id)
        .order_by(Appointment.appointment_date.desc())
        .all()
    )
    return appointments


@router.post("/appointments/book", response_model=AppointmentOut, status_code=201)
def book_appointment(
    payload: AppointmentBook,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Validate availability slot
    availability = db.query(DoctorAvailability).filter(
        DoctorAvailability.availability_id == payload.availability_id,
        DoctorAvailability.doctor_id == payload.doctor_id
    ).first()
    if not availability:
        raise HTTPException(status_code=400, detail="Selected availability slot does not exist")

    # Check day of week
    day_name = payload.appointment_date.strftime("%A").upper()
    if availability.day_of_week and availability.day_of_week.value != day_name:
        raise HTTPException(status_code=400, detail="Appointment date day-of-week does not match doctor availability")

    # Check available date range if specific
    if availability.available_date and availability.available_date != payload.appointment_date:
        raise HTTPException(status_code=400, detail="Doctor is not available on this specific date")

    # Check time range
    if payload.appointment_time < availability.start_time or payload.appointment_time > availability.end_time:
        raise HTTPException(status_code=400, detail="Appointment time is outside doctor's available window")

    # Prevent double-booking (duplicate slot for same doctor)
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == payload.doctor_id,
        Appointment.appointment_date == payload.appointment_date,
        Appointment.appointment_time == payload.appointment_time,
        Appointment.status != AppointmentStatus.CANCELLED
    ).first()
    if conflict:
        raise HTTPException(status_code=400, detail="This doctor is already booked at the selected time slot")

    # Calculate queue details
    existing_count = db.query(Appointment).filter(
        Appointment.doctor_id == payload.doctor_id,
        Appointment.appointment_date == payload.appointment_date,
        Appointment.status != AppointmentStatus.CANCELLED
    ).count()

    queue_pos = existing_count + 1
    est_wait = existing_count * 15 # estimate 15 minutes per patient

    # Generate token
    token = f"TKN-{payload.doctor_id}-{payload.appointment_date.strftime('%d%m')}-{queue_pos}"

    # Generate QR value
    qr_val = str(uuid.uuid4())

    new_app = Appointment(
        patient_id=patient.patient_id,
        doctor_id=payload.doctor_id,
        availability_id=payload.availability_id,
        appointment_date=payload.appointment_date,
        appointment_time=payload.appointment_time,
        token_number=token,
        qr_value=qr_val,
        queue_position=queue_pos,
        estimated_wait_minutes=est_wait,
        status=AppointmentStatus.BOOKED
    )
    db.add(new_app)

    # Dispatch notification
    notification = Notification(
        patient_id=patient.patient_id,
        notification_type=NotificationType.APPOINTMENT,
        title="Appointment Confirmed",
        message=f"Your appointment with Doctor ID {payload.doctor_id} is booked for {payload.appointment_date} at {payload.appointment_time}."
    )
    db.add(notification)

    db.commit()
    db.refresh(new_app)
    return new_app


@router.post("/appointments/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    appointment = db.query(Appointment).filter(
        Appointment.appointment_id == appointment_id,
        Appointment.patient_id == patient.patient_id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status not in [AppointmentStatus.BOOKED, AppointmentStatus.CHECKED_IN, AppointmentStatus.WAITING]:
        raise HTTPException(status_code=400, detail="Cannot cancel appointment in its current state")

    appointment.status = AppointmentStatus.CANCELLED
    
    # Notify
    notification = Notification(
        patient_id=patient.patient_id,
        notification_type=NotificationType.APPOINTMENT,
        title="Appointment Cancelled",
        message=f"Your appointment on {appointment.appointment_date} has been cancelled successfully."
    )
    db.add(notification)

    db.commit()
    return {"message": "Appointment cancelled successfully"}


@router.patch("/appointments/{appointment_id}/reschedule", response_model=AppointmentOut)
def reschedule_appointment(
    appointment_id: int,
    payload: AppointmentReschedule,
    current_user: User = Depends(require_patient),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    appointment = db.query(Appointment).filter(
        Appointment.appointment_id == appointment_id,
        Appointment.patient_id == patient.patient_id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status != AppointmentStatus.BOOKED:
        raise HTTPException(status_code=400, detail="Can only reschedule booked appointments")

    # Validate availability slot
    availability = db.query(DoctorAvailability).filter(
        DoctorAvailability.availability_id == payload.availability_id,
        DoctorAvailability.doctor_id == appointment.doctor_id
    ).first()
    if not availability:
        raise HTTPException(status_code=400, detail="Selected availability slot does not exist")

    # Check day of week
    day_name = payload.appointment_date.strftime("%A").upper()
    if availability.day_of_week and availability.day_of_week.value != day_name:
        raise HTTPException(status_code=400, detail="Appointment date day-of-week does not match doctor availability")

    # Check time range
    if payload.appointment_time < availability.start_time or payload.appointment_time > availability.end_time:
        raise HTTPException(status_code=400, detail="Appointment time is outside doctor's available window")

    # Prevent double-booking (duplicate slot for same doctor, excluding current appointment)
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == appointment.doctor_id,
        Appointment.appointment_date == payload.appointment_date,
        Appointment.appointment_time == payload.appointment_time,
        Appointment.appointment_id != appointment_id,
        Appointment.status != AppointmentStatus.CANCELLED
    ).first()
    if conflict:
        raise HTTPException(status_code=400, detail="This doctor is already booked at the selected time slot")

    # Update details
    appointment.availability_id = payload.availability_id
    appointment.appointment_date = payload.appointment_date
    appointment.appointment_time = payload.appointment_time

    # Notify
    notification = Notification(
        patient_id=patient.patient_id,
        notification_type=NotificationType.APPOINTMENT,
        title="Appointment Rescheduled",
        message=f"Your appointment was rescheduled to {payload.appointment_date} at {payload.appointment_time}."
    )
    db.add(notification)

    db.commit()
    db.refresh(appointment)
    return appointment
