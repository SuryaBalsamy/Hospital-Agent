from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Patient, Doctor, Receptionist, UserRole
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from app.utils.hashing import hash_password, verify_password
from app.utils.auth import create_access_token, get_current_active_user

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # Check for duplicate username/email
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    new_user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(new_user)
    db.flush()  # Get user_id before committing

    # Create role-specific profile
    if payload.role == UserRole.PATIENT:
        profile = Patient(
            user_id=new_user.user_id,
            full_name=payload.full_name,
            phone=payload.phone,
            dob=payload.dob,
            gender=payload.gender,
            blood_group=payload.blood_group,
        )
        db.add(profile)

    elif payload.role == UserRole.DOCTOR:
        profile = Doctor(
            user_id=new_user.user_id,
            doctor_name=payload.full_name or payload.username,
            phone=payload.phone,
            email=payload.email,
            department_id=1,  # Default department; admin should update
        )
        db.add(profile)

    elif payload.role == UserRole.RECEPTIONIST:
        profile = Receptionist(
            user_id=new_user.user_id,
            full_name=payload.full_name or payload.username,
            phone=payload.phone,
            email=payload.email,
        )
        db.add(profile)

    # ADMIN: no profile table

    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.user_id,
        "role": new_user.role.value,
    }


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is inactive")

    token = create_access_token(data={"sub": user.username, "role": user.role.value})

    # Resolve full_name from role-specific profile
    full_name = None
    if user.role == UserRole.PATIENT and user.patient:
        full_name = user.patient.full_name
    elif user.role == UserRole.DOCTOR and user.doctor:
        full_name = user.doctor.doctor_name
    elif user.role == UserRole.RECEPTIONIST and user.receptionist:
        full_name = user.receptionist.full_name
    elif user.role == UserRole.ADMIN:
        full_name = "Administrator"

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role.value,
        user_id=user.user_id,
        username=user.username,
        full_name=full_name,
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
