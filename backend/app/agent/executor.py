import json
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import date, time
from app.models.models import Department, Doctor, DoctorAvailability, Appointment, Patient, HospitalInformation, ConsultationNote, Notification, User
from app.agent import pending_store

class ToolExecutor:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        
        # Get patient_id for the user
        self.patient = self.db.query(Patient).filter(Patient.user_id == self.user_id).first()
        self.patient_id = self.patient.patient_id if self.patient else None

    def execute_tool(self, tool_name: str, args: dict) -> str:
        """Dispatches the tool call to the corresponding method."""
        method_name = f"execute_{tool_name}"
        if hasattr(self, method_name):
            try:
                method = getattr(self, method_name)
                return method(**args)
            except Exception as e:
                return json.dumps({"error": f"Failed to execute {tool_name}: {str(e)}"})
        return json.dumps({"error": f"Tool {tool_name} not found."})

    def execute_find_department_by_symptoms(self, symptoms: str) -> str:
        # Simple keyword matching for demo purposes
        symptoms = symptoms.lower()
        if any(w in symptoms for w in ["heart", "chest", "blood pressure", "cardio"]):
            dept = "Cardiology"
        elif any(w in symptoms for w in ["skin", "rash", "allergy", "itching", "acne"]):
            dept = "Dermatology"
        elif any(w in symptoms for w in ["bone", "fracture", "joint", "knee"]):
            dept = "Orthopedics"
        elif any(w in symptoms for w in ["child", "baby", "fever", "pediatric"]):
            dept = "Pediatrics"
        elif any(w in symptoms for w in ["brain", "nerve", "headache", "seizure"]):
            dept = "Neurology"
        else:
            dept = "General Medicine"
            
        department = self.db.query(Department).filter(Department.department_name.ilike(f"%{dept}%")).first()
        if department:
            return json.dumps({"department_id": department.department_id, "department_name": department.department_name, "description": department.description})
        return json.dumps({"message": f"Based on the symptoms, recommended department is {dept}, but it was not found in the database. Please try General Medicine."})

    def execute_find_doctors_by_department(self, department_name: str) -> str:
        department = self.db.query(Department).filter(Department.department_name.ilike(f"%{department_name}%")).first()
        if not department:
            return json.dumps({"error": "Department not found."})
            
        doctors = self.db.query(Doctor).filter(Doctor.department_id == department.department_id).all()
        result = [{"doctor_id": d.doctor_id, "name": d.doctor_name, "specialization": d.specialization, "experience": d.experience, "room": d.room_number} for d in doctors]
        return json.dumps({"department": department.department_name, "doctors": result})

    def execute_check_doctor_availability(self, doctor_name_or_id: str, preferred_date: str = "", preferred_time: str = "") -> str:
        doctor = None
        if str(doctor_name_or_id).isdigit():
            doctor = self.db.query(Doctor).filter(Doctor.doctor_id == int(doctor_name_or_id)).first()
        else:
            doctor = self.db.query(Doctor).filter(Doctor.doctor_name.ilike(f"%{doctor_name_or_id}%")).first()
            
        if not doctor:
            return json.dumps({"error": "Doctor not found."})
            
        query = self.db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == doctor.doctor_id)
        if preferred_date:
            query = query.filter(DoctorAvailability.available_date == preferred_date)
            
        availabilities = query.all()
        result = [{"availability_id": a.availability_id, "date": str(a.available_date), "day": a.day_of_week.value, "start_time": str(a.start_time), "end_time": str(a.end_time)} for a in availabilities]
        
        return json.dumps({"doctor_id": doctor.doctor_id, "doctor_name": doctor.doctor_name, "availabilities": result})

    def execute_prepare_booking(self, doctor_id: int, availability_id: int) -> str:
        """Called by Gemini. Validates the slot and stores a pending action — does NOT book yet."""
        if not self.patient_id:
            return json.dumps({"error": "User is not a registered patient."})

        availability = self.db.query(DoctorAvailability).filter(
            DoctorAvailability.availability_id == availability_id,
            DoctorAvailability.doctor_id == doctor_id
        ).first()
        if not availability:
            return json.dumps({"error": "Availability slot not found for this doctor."})

        existing = self.db.query(Appointment).filter(
            Appointment.patient_id == self.patient_id,
            Appointment.appointment_date == availability.available_date,
            Appointment.status != "CANCELLED"
        ).first()
        if existing:
            return json.dumps({"error": "You already have an appointment on this date."})

        current_bookings = self.db.query(Appointment).filter(
            Appointment.availability_id == availability_id
        ).count()
        if current_bookings >= availability.max_tokens:
            return json.dumps({"error": "This slot is fully booked. Please choose another slot."})

        doctor = self.db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()

        # Store the pending action — no DB write yet
        pending_store.set_pending(self.user_id, {
            "type": "booking",
            "doctor_id": doctor_id,
            "availability_id": availability_id,
            "doctor_name": doctor.doctor_name if doctor else "Unknown",
            "date": str(availability.available_date),
            "start_time": str(availability.start_time),
            "end_time": str(availability.end_time),
            "queue_position": current_bookings + 1
        })

        return json.dumps({
            "status": "pending_confirmation",
            "doctor": doctor.doctor_name if doctor else "Unknown",
            "date": str(availability.available_date),
            "time": str(availability.start_time),
            "queue_position": current_bookings + 1
        })

    def execute_book_appointment_confirmed(self) -> str:
        """Called directly by the router when the user confirms. Executes the stored pending booking."""
        if not self.patient_id:
            return json.dumps({"error": "User is not a registered patient."})

        pending = pending_store.get_pending(self.user_id)
        if not pending or pending.get("type") != "booking":
            return json.dumps({"error": "No pending booking found. Please start a new booking."})

        doctor_id = pending["doctor_id"]
        availability_id = pending["availability_id"]

        availability = self.db.query(DoctorAvailability).filter(
            DoctorAvailability.availability_id == availability_id
        ).first()
        if not availability:
            pending_store.clear_pending(self.user_id)
            return json.dumps({"error": "Availability slot no longer exists."})

        # Re-check conflicts (slot may have filled since pending was set)
        existing = self.db.query(Appointment).filter(
            Appointment.patient_id == self.patient_id,
            Appointment.appointment_date == availability.available_date,
            Appointment.status != "CANCELLED"
        ).first()
        if existing:
            pending_store.clear_pending(self.user_id)
            return json.dumps({"error": "You already have an appointment on this date."})

        current_bookings = self.db.query(Appointment).filter(
            Appointment.availability_id == availability_id
        ).count()
        if current_bookings >= availability.max_tokens:
            pending_store.clear_pending(self.user_id)
            return json.dumps({"error": "Sorry, this slot just got fully booked. Please choose another slot."})

        queue_pos = current_bookings + 1

        import uuid
        try:
            token = f"TKN-{doctor_id}-{availability.available_date.strftime('%d%m')}-{queue_pos}"
            qr_val = str(uuid.uuid4())
            est_wait = (queue_pos - 1) * 15

            new_app = Appointment(
                patient_id=self.patient_id,
                doctor_id=doctor_id,
                availability_id=availability_id,
                appointment_date=availability.available_date,
                appointment_time=availability.start_time,
                token_number=token,
                qr_value=qr_val,
                queue_position=queue_pos,
                estimated_wait_minutes=est_wait,
                status="BOOKED"
            )
            self.db.add(new_app)
            self.db.flush()

            # Dispatch notification
            notification = Notification(
                patient_id=self.patient_id,
                notification_type="APPOINTMENT",
                title="Appointment Confirmed",
                message=f"Your appointment with Doctor ID {doctor_id} is booked for {availability.available_date} at {availability.start_time}."
            )
            self.db.add(notification)
            
            self.db.commit()
            pending_store.clear_pending(self.user_id)

            doctor = self.db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
            return json.dumps({
                "success": True,
                "appointment_id": new_app.appointment_id,
                "doctor": doctor.doctor_name if doctor else "Unknown",
                "date": str(new_app.appointment_date),
                "time": str(new_app.appointment_time),
                "token_number": token,
                "queue_position": queue_pos,
                "qr_value": qr_val
            })
        except Exception as e:
            self.db.rollback()
            pending_store.clear_pending(self.user_id)
            return json.dumps({"error": f"Booking failed: {str(e)}"})

    def execute_cancel_appointment(self, appointment_id: int) -> str:
        if not self.patient_id:
            return json.dumps({"error": "Not a patient."})
            
        app = self.db.query(Appointment).filter(Appointment.appointment_id == appointment_id, Appointment.patient_id == self.patient_id).first()
        if not app:
            return json.dumps({"error": "Appointment not found."})
            
        if app.status in ["CANCELLED", "COMPLETED"]:
            return json.dumps({"error": f"Appointment is already {app.status}."})
            
        app.status = "CANCELLED"
        self.db.commit()
        return json.dumps({"success": True, "message": "Appointment cancelled successfully."})

    def execute_reschedule_appointment(self, appointment_id: int, new_date: str, new_time: str = "") -> str:
        if not self.patient_id:
            return json.dumps({"error": "Not a patient."})
            
        app = self.db.query(Appointment).filter(
            Appointment.appointment_id == appointment_id,
            Appointment.patient_id == self.patient_id
        ).first()
        if not app:
            return json.dumps({"error": "Appointment not found."})
            
        if app.status in ["CANCELLED", "COMPLETED"]:
            return json.dumps({"error": f"Cannot reschedule an appointment that is already {app.status}."})
            
        from datetime import datetime
        # Parse new date
        try:
            target_date = datetime.strptime(new_date, "%Y-%m-%d").date()
        except ValueError:
            return json.dumps({"error": "Invalid date format. Please use YYYY-MM-DD."})
            
        # Query DoctorAvailability for the doctor on target_date
        query = self.db.query(DoctorAvailability).filter(
            DoctorAvailability.doctor_id == app.doctor_id,
            DoctorAvailability.available_date == target_date
        )
        
        # If new_time is provided, filter by it too
        if new_time:
            try:
                if len(new_time.split(":")) == 2:
                    target_time = datetime.strptime(new_time, "%H:%M").time()
                else:
                    target_time = datetime.strptime(new_time, "%H:%M:%S").time()
                query = query.filter(DoctorAvailability.start_time == target_time)
            except ValueError:
                pass
                
        availability = query.first()
        if not availability:
            return json.dumps({"error": f"Doctor is not available on {new_date} at the specified time."})
            
        # Check if the slot is full
        current_bookings = self.db.query(Appointment).filter(
            Appointment.availability_id == availability.availability_id,
            Appointment.status != "CANCELLED"
        ).count()
        if current_bookings >= availability.max_tokens:
            return json.dumps({"error": "The selected slot is fully booked."})
            
        # Reschedule the appointment
        queue_pos = current_bookings + 1
        est_wait = (queue_pos - 1) * 15
        
        # Generate new token
        token = f"TKN-{app.doctor_id}-{target_date.strftime('%d%m')}-{queue_pos}"
        
        app.appointment_date = target_date
        app.appointment_time = availability.start_time
        app.availability_id = availability.availability_id
        app.queue_position = queue_pos
        app.estimated_wait_minutes = est_wait
        app.token_number = token
        
        # Dispatch notification
        notification = Notification(
            patient_id=self.patient_id,
            notification_type="APPOINTMENT",
            title="Appointment Rescheduled",
            message=f"Your appointment with Doctor ID {app.doctor_id} has been rescheduled to {target_date} at {availability.start_time}."
        )
        self.db.add(notification)
        
        self.db.commit()
        
        doctor = self.db.query(Doctor).filter(Doctor.doctor_id == app.doctor_id).first()
        return json.dumps({
            "success": True,
            "message": "Appointment rescheduled successfully.",
            "appointment_id": app.appointment_id,
            "doctor": doctor.doctor_name if doctor else "Unknown",
            "date": str(app.appointment_date),
            "time": str(app.appointment_time),
            "token_number": token,
            "queue_position": queue_pos
        })

    def execute_view_my_appointments(self) -> str:
        if not self.patient_id:
            return json.dumps({"error": "Not a patient."})
            
        apps = self.db.query(Appointment).filter(
            Appointment.patient_id == self.patient_id,
            Appointment.status != "CANCELLED"
        ).order_by(Appointment.appointment_date.desc()).limit(5).all()
        
        result = []
        for a in apps:
            doc = self.db.query(Doctor).filter(Doctor.doctor_id == a.doctor_id).first()
            result.append({
                "appointment_id": a.appointment_id,
                "doctor": doc.doctor_name,
                "date": str(a.appointment_date),
                "time": str(a.appointment_time),
                "status": a.status.value
            })
        return json.dumps({"appointments": result})

    def execute_check_queue_position(self) -> str:
        if not self.patient_id:
            return json.dumps({"error": "Not a patient."})
            
        today = date.today()
        app = self.db.query(Appointment).filter(
            Appointment.patient_id == self.patient_id,
            Appointment.appointment_date == today,
            Appointment.status.in_(["BOOKED", "CHECKED_IN", "WAITING"])
        ).first()
        
        if not app:
            return json.dumps({"message": "You have no active appointments today."})
            
        # Find current running token for that doctor's availability
        in_consult = self.db.query(Appointment).filter(
            Appointment.availability_id == app.availability_id,
            Appointment.status == "IN_CONSULTATION"
        ).first()
        
        current_serving = in_consult.queue_position if in_consult else "Unknown"
        
        return json.dumps({
            "appointment_id": app.appointment_id,
            "your_queue_position": app.queue_position,
            "currently_serving": current_serving,
            "estimated_wait_minutes": (app.queue_position - (in_consult.queue_position if in_consult else 0)) * 15 if type(current_serving) == int else 30
        })

    def execute_get_token_number(self) -> str:
        if not self.patient_id:
            return json.dumps({"error": "Not a patient."})
            
        app = self.db.query(Appointment).filter(
            Appointment.patient_id == self.patient_id,
            Appointment.status.in_(["BOOKED", "CHECKED_IN"])
        ).order_by(Appointment.appointment_date).first()
        
        if not app:
            return json.dumps({"error": "No upcoming booked appointments found."})
            
        return json.dumps({
            "appointment_id": app.appointment_id,
            "date": str(app.appointment_date),
            "token_number": app.token_number,
            "qr_value": app.qr_value
        })

    def execute_get_hospital_navigation(self, location_name: str) -> str:
        # Normalize and split into keywords (ignore short words like "the", "room", "floor")
        keywords = [k.strip() for k in location_name.lower().split() if len(k.strip()) > 2 and k.strip() not in ["the", "room", "floor", "area", "counter"]]
        if not keywords:
            keywords = [location_name.lower().strip()]
            
        # Try exact/substring match first
        info = self.db.query(HospitalInformation).filter(HospitalInformation.title.ilike(f"%{location_name}%")).first()
        if not info:
            # Try to match by any of the extracted keywords
            for kw in keywords:
                info = self.db.query(HospitalInformation).filter(HospitalInformation.title.ilike(f"%{kw}%")).first()
                if info:
                    break
                    
        if info:
            return json.dumps({
                "location": info.title,
                "floor": info.floor,
                "block": info.block_name,
                "description": info.description,
                "landmark": info.landmark
            })
        return json.dumps({"error": f"Could not find information for {location_name} in the hospital navigation directory."})

    def execute_get_consultation_summary(self, appointment_id: int) -> str:
        if not self.patient_id:
            return json.dumps({"error": "Not a patient."})
            
        note = self.db.query(ConsultationNote).filter(ConsultationNote.appointment_id == appointment_id).first()
        if not note:
            return json.dumps({"error": "No consultation summary found for this appointment."})
            
        return json.dumps({
            "diagnosis": note.diagnosis,
            "prescription": note.prescription,
            "doctor_notes": note.doctor_notes,
            "follow_up_required": note.follow_up_required,
            "follow_up_date": str(note.follow_up_date) if note.follow_up_date else None
        })

    def execute_get_notifications(self) -> str:
        if not self.patient_id:
            return json.dumps({"error": "Not a patient."})
            
        notifs = self.db.query(Notification).filter(Notification.patient_id == self.patient_id).order_by(Notification.created_at.desc()).limit(5).all()
        result = [{"title": n.title, "message": n.message, "type": n.notification_type.value, "read": n.is_read} for n in notifs]
        return json.dumps({"notifications": result})
