# API Documentation — HorizonCare AI Medical Center

## Authentication Endpoints

### 1. Register User
- **POST** `/api/auth/register`
- **Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "PATIENT",
  "full_name": "John Doe",
  "phone": "9876543210"
}
```
- **Response (200 OK):**
```json
{
  "message": "User registered successfully",
  "user_id": 12,
  "role": "PATIENT"
}
```

### 2. Login User
- **POST** `/api/auth/login`
- **Request Body:**
```json
{
  "username": "priya",
  "password": "admin123"
}
```
- **Response (200 OK):**
```json
{
  "access_token": "jwt_token_string",
  "token_type": "bearer",
  "role": "DOCTOR",
  "user_id": 4,
  "username": "priya"
}
```

---

## AI Assistant Endpoints

### 1. Send Chat Message
- **POST** `/api/ai/chat`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "message": "Where is the MRI room?"
}
```
- **Response (200 OK):**
```json
{
  "response": "The MRI room is located in Block B on the 2nd Floor (MRI Scan), near Lift 2."
}
```

---

## Doctor Endpoints

### 1. Fetch Upcoming Appointments
- **GET** `/api/doctors/upcoming-appointments`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
[
  {
    "appointment_id": 1,
    "patient_id": 3,
    "doctor_id": 1,
    "appointment_date": "2026-07-06",
    "appointment_time": "10:30:00",
    "token_number": "TKN-1-0607-1",
    "status": "BOOKED",
    "patient": {
      "patient_id": 3,
      "full_name": "Surya"
    }
  }
]
```
