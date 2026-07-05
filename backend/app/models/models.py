import enum
from sqlalchemy import (
    Column, Integer, String, Boolean, Text, Date, Time, DateTime,
    ForeignKey, Enum as SAEnum, TIMESTAMP
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


# ---------------------------------------------------------------------------
# Enum Definitions
# ---------------------------------------------------------------------------

class UserRole(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    RECEPTIONIST = "RECEPTIONIST"
    ADMIN = "ADMIN"


class DoctorStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_LEAVE = "ON_LEAVE"


class Gender(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class DayOfWeek(str, enum.Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"


class AppointmentStatus(str, enum.Enum):
    BOOKED = "BOOKED"
    CHECKED_IN = "CHECKED_IN"
    WAITING = "WAITING"
    IN_CONSULTATION = "IN_CONSULTATION"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class NotificationType(str, enum.Enum):
    APPOINTMENT = "APPOINTMENT"
    REMINDER = "REMINDER"
    COMPLETED = "COMPLETED"
    FOLLOW_UP = "FOLLOW_UP"
    GENERAL = "GENERAL"


class QRScanStatus(str, enum.Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    doctor = relationship("Doctor", back_populates="user", uselist=False)
    receptionist = relationship("Receptionist", back_populates="user", uselist=False)
    patient = relationship("Patient", back_populates="user", uselist=False)
    chat_history = relationship("ChatHistory", back_populates="user")


class Department(Base):
    __tablename__ = "departments"

    department_id = Column(Integer, primary_key=True, autoincrement=True)
    department_name = Column(String(100), unique=True, nullable=False)
    floor = Column(String(20))
    block_name = Column(String(20))
    description = Column(Text)

    # Relationships
    doctors = relationship("Doctor", back_populates="department")


class Doctor(Base):
    __tablename__ = "doctors"

    doctor_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id"), nullable=False)
    doctor_name = Column(String(100), nullable=False)
    qualification = Column(String(150))
    specialization = Column(String(100))
    experience = Column(Integer)
    phone = Column(String(15))
    email = Column(String(100))
    room_number = Column(String(20))
    status = Column(SAEnum(DoctorStatus), default=DoctorStatus.AVAILABLE)

    # Relationships
    user = relationship("User", back_populates="doctor")
    department = relationship("Department", back_populates="doctors")
    availabilities = relationship("DoctorAvailability", back_populates="doctor")
    appointments = relationship("Appointment", back_populates="doctor")


class Receptionist(Base):
    __tablename__ = "receptionists"

    receptionist_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(100))
    phone = Column(String(15))
    email = Column(String(100))

    # Relationships
    user = relationship("User", back_populates="receptionist")
    qr_scan_logs = relationship("QRScanLog", back_populates="receptionist")


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(100))
    dob = Column(Date)
    gender = Column(SAEnum(Gender))
    phone = Column(String(15))
    address = Column(Text)
    blood_group = Column(String(5))
    emergency_contact = Column(String(15))
    allergies = Column(Text)
    medical_history = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    notifications = relationship("Notification", back_populates="patient")


class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"

    availability_id = Column(Integer, primary_key=True, autoincrement=True)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(SAEnum(DayOfWeek))
    available_date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    max_tokens = Column(Integer, default=20)

    # Relationships
    doctor = relationship("Doctor", back_populates="availabilities")
    appointments = relationship("Appointment", back_populates="availability")


class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=False)
    availability_id = Column(Integer, ForeignKey("doctor_availability.availability_id"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    token_number = Column(String(20), unique=True)
    qr_value = Column(String(255), unique=True)
    queue_position = Column(Integer)
    estimated_wait_minutes = Column(Integer)
    arrival_time = Column(DateTime)
    consultation_start = Column(DateTime)
    consultation_end = Column(DateTime)
    status = Column(SAEnum(AppointmentStatus), default=AppointmentStatus.BOOKED)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    availability = relationship("DoctorAvailability", back_populates="appointments")
    consultation_note = relationship("ConsultationNote", back_populates="appointment", uselist=False)
    feedback = relationship("Feedback", back_populates="appointment", uselist=False)
    qr_scan_logs = relationship("QRScanLog", back_populates="appointment")


class ConsultationNote(Base):
    __tablename__ = "consultation_notes"

    note_id = Column(Integer, primary_key=True, autoincrement=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id", ondelete="CASCADE"), unique=True, nullable=False)
    diagnosis = Column(Text)
    prescription = Column(Text)
    doctor_notes = Column(Text)
    follow_up_required = Column(Boolean, default=False)
    follow_up_date = Column(Date)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    appointment = relationship("Appointment", back_populates="consultation_note")


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    notification_type = Column(SAEnum(NotificationType))
    title = Column(String(150))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="notifications")


class HospitalInformation(Base):
    __tablename__ = "hospital_information"

    info_id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(50))
    title = Column(String(100))
    description = Column(Text)
    floor = Column(String(20))
    block_name = Column(String(20))
    landmark = Column(String(100))


class ChatHistory(Base):
    __tablename__ = "chat_history"

    chat_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    user_message = Column(Text)
    ai_response = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="chat_history")


class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(Integer, primary_key=True, autoincrement=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id", ondelete="CASCADE"), unique=True, nullable=False)
    rating = Column(Integer)
    comments = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    appointment = relationship("Appointment", back_populates="feedback")


class QRScanLog(Base):
    __tablename__ = "qr_scan_logs"

    scan_id = Column(Integer, primary_key=True, autoincrement=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), nullable=False)
    receptionist_id = Column(Integer, ForeignKey("receptionists.receptionist_id"), nullable=False)
    scan_time = Column(TIMESTAMP, server_default=func.now())
    status = Column(SAEnum(QRScanStatus), default=QRScanStatus.SUCCESS)

    # Relationships
    appointment = relationship("Appointment", back_populates="qr_scan_logs")
    receptionist = relationship("Receptionist", back_populates="qr_scan_logs")
