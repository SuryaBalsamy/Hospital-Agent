# Database Architecture — HorizonCare AI Medical Center

## Database Schema Model
The database is built on a highly normalized relational schema in MySQL:

### 1. `users` Table
Stores login accounts.
- `user_id`: Primary Key (Autoincrement)
- `username`: Unique username (used for login)
- `email`: Unique email
- `password_hash`: Bcrypt hashed password
- `role`: ENUM ('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN')

### 2. `departments` Table
- `department_id`: Primary Key
- `department_name`: Unique name (e.g. Cardiology, Dermatology)
- `floor`: Floor placement
- `block_name`: Block name
- `description`: Text detail

### 3. `doctors` Table
- `doctor_id`: Primary Key
- `user_id`: Foreign Key (`users.user_id`)
- `department_id`: Foreign Key (`departments.department_id`)
- `doctor_name`: Doctor's display name
- `specialization`: Specialized medical area
- `room_number`: Display ward/room
- `status`: ENUM ('AVAILABLE', 'ON_LEAVE')

### 4. `doctor_availability` Table
- `availability_id`: Primary Key
- `doctor_id`: Foreign Key (`doctors.doctor_id`)
- `day_of_week`: ENUM ('MONDAY', 'TUESDAY', ...)
- `start_time` / `end_time`: Service durations
- `max_tokens`: Daily slot threshold limit (Default: 20)

### 5. `appointments` Table
Tracks patient reservations.
- `appointment_id`: Primary Key
- `patient_id`: Foreign Key (`patients.patient_id`)
- `doctor_id`: Foreign Key (`doctors.doctor_id`)
- `availability_id`: Foreign Key (`doctor_availability.availability_id`)
- `appointment_date`: Reserved date
- `appointment_time`: Reserved time
- `token_number`: Unique printable token
- `status`: ENUM ('BOOKED', 'CHECKED_IN', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED')

### 6. `hospital_information` Table
Stores pre-defined locations mapping hospital wards.
- `info_id`: Primary Key
- `category`: Navigation category
- `title`: Wards/Specialty rooms (e.g., MRI Room, Pharmacy)
- `description`: Ward directions
- `floor` / `block_name` / `landmark`: Visual mapping properties
