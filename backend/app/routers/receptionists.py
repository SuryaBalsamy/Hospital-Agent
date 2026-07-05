from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Receptionist, Appointment, QRScanLog, AppointmentStatus, QRScanStatus
from app.schemas.schemas import ReceptionistOut, AppointmentOut, QRScanCreate, QRScanOut
from app.utils.auth import require_receptionist

router = APIRouter()


@router.get("/profile", response_model=ReceptionistOut)
def get_receptionist_profile(
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db)
):
    receptionist = db.query(Receptionist).filter(
        Receptionist.user_id == current_user.user_id
    ).first()
    if not receptionist:
        raise HTTPException(status_code=404, detail="Receptionist profile not found")
    return receptionist


@router.get("/today-queue", response_model=list[AppointmentOut])
def get_today_queue(
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db)
):
    today = date.today()
    appointments = (
        db.query(Appointment)
        .filter(Appointment.appointment_date == today)
        .order_by(Appointment.appointment_time)
        .all()
    )
    return appointments


@router.get("/appointments/by-token/{token}", response_model=AppointmentOut)
def get_appointment_by_token(
    token: str,
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db)
):
    appointment = db.query(Appointment).filter(
        (Appointment.token_number == token) | (Appointment.qr_value == token)
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@router.patch("/appointments/{appointment_id}/check-in", response_model=AppointmentOut)
def check_in_patient(
    appointment_id: int,
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db)
):
    receptionist = db.query(Receptionist).filter(
        Receptionist.user_id == current_user.user_id
    ).first()
    if not receptionist:
        raise HTTPException(status_code=404, detail="Receptionist profile not found")

    appointment = db.query(Appointment).filter(
        Appointment.appointment_id == appointment_id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status != AppointmentStatus.BOOKED:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot check in patient. Appointment is in '{appointment.status.value}' state."
        )

    # Change status to WAITING (moved to doctor's waiting queue)
    appointment.status = AppointmentStatus.WAITING
    appointment.arrival_time = datetime.now()

    # Log QR scan / check-in
    scan_log = QRScanLog(
        appointment_id=appointment.appointment_id,
        receptionist_id=receptionist.receptionist_id,
        status=QRScanStatus.SUCCESS,
    )
    db.add(scan_log)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.post("/qr-scan", response_model=QRScanOut, status_code=201)
def log_qr_scan(
    payload: QRScanCreate,
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db)
):
    receptionist = db.query(Receptionist).filter(
        Receptionist.user_id == current_user.user_id
    ).first()
    if not receptionist:
        raise HTTPException(status_code=404, detail="Receptionist profile not found")

    appointment = db.query(Appointment).filter(
        Appointment.appointment_id == payload.appointment_id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    scan_log = QRScanLog(
        appointment_id=payload.appointment_id,
        receptionist_id=receptionist.receptionist_id,
        status=QRScanStatus.SUCCESS,
    )
    db.add(scan_log)

    # Update appointment status to WAITING
    appointment.status = AppointmentStatus.WAITING
    appointment.arrival_time = datetime.now()
    db.commit()
    db.refresh(scan_log)
    return scan_log


@router.get("/search-patients")
def search_patients(
    query: str = "",
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db)
):
    from app.models.models import Patient
    patients = (
        db.query(Patient)
        .filter(Patient.full_name.ilike(f"%{query}%"))
        .limit(20)
        .all()
    )
    return [
        {
            "patient_id": p.patient_id,
            "full_name": p.full_name,
            "phone": p.phone,
            "blood_group": p.blood_group,
            "gender": p.gender.value if p.gender else None,
        }
        for p in patients
    ]
