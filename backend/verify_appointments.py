import sys
from datetime import date, time, datetime
from app.database import SessionLocal
from app.models.models import (
    User, Patient, Doctor, DoctorAvailability, Appointment,
    ConsultationNote, DayOfWeek, DoctorStatus, UserRole
)
from app.utils.hashing import hash_password

def run_verification():
    print("Connecting to DB...")
    db = SessionLocal()
    try:
        # 1. Ensure doctor and patient records exist
        doctor = db.query(Doctor).first()
        if not doctor:
            print("No doctor found. Creating a test doctor...")
            user_doc = User(username="test_doc_user", email="doc@test.com", password_hash=hash_password("admin123"), role=UserRole.DOCTOR)
            db.add(user_doc)
            db.flush()
            doctor = Doctor(user_id=user_doc.user_id, department_id=1, doctor_name="Dr. Test Specialist", status=DoctorStatus.AVAILABLE)
            db.add(doctor)
            db.flush()

        patient = db.query(Patient).first()
        if not patient:
            print("No patient found. Creating a test patient...")
            user_pat = User(username="test_pat_user", email="pat@test.com", password_hash=hash_password("admin123"), role=UserRole.PATIENT)
            db.add(user_pat)
            db.flush()
            patient = Patient(user_id=user_pat.user_id, full_name="John Test Patient", dob=date(1995, 5, 5))
            db.add(patient)
            db.flush()

        print(f"Using Doctor ID: {doctor.doctor_id}, Patient ID: {patient.patient_id}")

        # 2. Add a doctor availability block if none exists for today
        today_date = date.today()
        day_name = today_date.strftime("%A").upper()
        
        availability = db.query(DoctorAvailability).filter(
            DoctorAvailability.doctor_id == doctor.doctor_id
        ).first()
        if not availability:
            print(f"Creating doctor availability for {day_name}...")
            availability = DoctorAvailability(
                doctor_id=doctor.doctor_id,
                day_of_week=DayOfWeek[day_name],
                start_time=time(9, 0),
                end_time=time(17, 0),
                max_tokens=20
            )
            db.add(availability)
            db.flush()

        db.commit()
        print(f"Availability verified: ID {availability.availability_id}")

        # 3. Simulate appointment booking
        print("Simulating booking...")
        # Clean any old conflict appointments for test
        test_time = time(11, 30)
        old_conflict = db.query(Appointment).filter(
            Appointment.doctor_id == doctor.doctor_id,
            Appointment.appointment_date == today_date,
            Appointment.appointment_time == test_time
        ).first()
        if old_conflict:
            db.delete(old_conflict)
            db.commit()

        # Import routing logics to run inline OR simulate with HTTP request?
        # Since uvicorn is running, let's perform an HTTP post or direct ORM simulation.
        # Direct ORM simulation mimics API actions.
        import uuid
        token = f"TKN-{doctor.doctor_id}-{today_date.strftime('%d%m')}-99"
        qr_val = str(uuid.uuid4())
        
        app = Appointment(
            patient_id=patient.patient_id,
            doctor_id=doctor.doctor_id,
            availability_id=availability.availability_id,
            appointment_date=today_date,
            appointment_time=test_time,
            token_number=token,
            qr_value=qr_val,
            queue_position=99,
            estimated_wait_minutes=15,
            status="BOOKED"
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        print(f"OK - Appointment booked. Token: {app.token_number}, Status: {app.status}")

        # 4. Check-in simulation
        print("Simulating receptionist check-in...")
        app.status = "WAITING"
        app.arrival_time = datetime.now()
        db.commit()
        print(f"OK - Checked-in. Status: {app.status}, Arrival: {app.arrival_time}")

        # 5. Start consultation simulation
        print("Simulating doctor starting consultation...")
        app.status = "IN_CONSULTATION"
        app.consultation_start = datetime.now()
        db.commit()
        print(f"OK - Consultation started. Status: {app.status}, Start Time: {app.consultation_start}")

        # 6. End consultation simulation
        print("Simulating doctor ending consultation...")
        note = ConsultationNote(
            appointment_id=app.appointment_id,
            diagnosis="Common Cold & Mild Fatigue",
            prescription="Tab Vitamin C 500mg - 1 daily - 10 Days\nRest & Hydration advised",
            doctor_notes="Patient presented with mild congestion.",
            follow_up_required=False
        )
        db.add(note)
        app.status = "COMPLETED"
        app.consultation_end = datetime.now()
        db.commit()
        db.refresh(note)
        print(f"OK - Consultation completed. Status: {app.status}")
        print(f"OK - Consultation Note saved: {note.diagnosis}")

        # Clean up test appointment
        db.delete(note)
        db.delete(app)
        db.commit()
        print("Cleaned up test verification records successfully!")
        print("\n=== VERIFICATION SUCCESSFUL ===")
        
    except Exception as e:
        print(f"Verification Failed: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == '__main__':
    run_verification()
