from typing import List, Dict, Any, Optional
import datetime

# --- Tool Schemas for Gemini ---
# We define these as empty functions just for Gemini's schema extraction.
# The actual execution will be mapped to our database functions.

def find_department_by_symptoms(symptoms: str) -> str:
    """Finds the most suitable hospital department based on the patient's symptoms.
    Args:
        symptoms: A description of the patient's symptoms (e.g., 'skin allergy', 'chest pain').
    """
    pass

def find_doctors_by_department(department_name: str) -> str:
    """Finds available doctors in a specific hospital department.
    Args:
        department_name: The name of the department (e.g., 'Cardiology', 'Dermatology').
    """
    pass

def check_doctor_availability(doctor_name_or_id: str, preferred_date: str = "", preferred_time: str = "") -> str:
    """Checks the availability of a specific doctor.
    Args:
        doctor_name_or_id: The ID or name of the doctor.
        preferred_date: Optional. The preferred date (YYYY-MM-DD).
        preferred_time: Optional. The preferred time slot.
    """
    pass

def prepare_booking(doctor_id: int, availability_id: int) -> str:
    """Prepares an appointment booking and asks the user to confirm.
    Call this ONLY after finding a valid availability slot. Do NOT call book_appointment directly.
    Args:
        doctor_id: The ID of the doctor.
        availability_id: The ID of the specific availability slot to book.
    """
    pass

def cancel_appointment(appointment_id: int) -> str:
    """Cancels an existing appointment.
    Args:
        appointment_id: The ID of the appointment to cancel.
    """
    pass

def reschedule_appointment(appointment_id: int, new_date: str, new_time: str) -> str:
    """Reschedules an appointment to a new date and time.
    Args:
        appointment_id: The ID of the appointment.
        new_date: The new date (YYYY-MM-DD).
        new_time: The new time.
    """
    pass

def view_my_appointments() -> str:
    """Retrieves all upcoming appointments for the current user.
    """
    pass

def check_queue_position() -> str:
    """Checks the live queue position for the user's current appointment today.
    """
    pass

def get_token_number() -> str:
    """Retrieves the token number and QR code details for today's appointment.
    """
    pass

def get_hospital_navigation(location_name: str) -> str:
    """Finds the physical location of a hospital facility (e.g., MRI room, Pharmacy).
    Args:
        location_name: The name of the facility to find.
    """
    pass

def get_consultation_summary(appointment_id: int) -> str:
    """Retrieves the medical summary, diagnosis, and prescription from a past consultation.
    Args:
        appointment_id: The ID of the past appointment.
    """
    pass

def get_notifications() -> str:
    """Retrieves recent hospital notifications for the user.
    """
    pass

# List of tools to provide to Gemini
GEMINI_TOOLS = [
    find_department_by_symptoms,
    find_doctors_by_department,
    check_doctor_availability,
    prepare_booking,           # <-- Gemini proposes, backend confirms
    cancel_appointment,
    reschedule_appointment,
    view_my_appointments,
    check_queue_position,
    get_token_number,
    get_hospital_navigation,
    get_consultation_summary,
    get_notifications
]
