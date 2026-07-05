from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.models import HospitalInformation
from app.schemas.schemas import HospitalInfoOut

router = APIRouter()


@router.get("/info", response_model=list[HospitalInfoOut])
def get_hospital_info(db: Session = Depends(get_db)):
    return db.query(HospitalInformation).all()


@router.get("/info/category/{category}", response_model=list[HospitalInfoOut])
def get_hospital_info_by_category(category: str, db: Session = Depends(get_db)):
    return (
        db.query(HospitalInformation)
        .filter(HospitalInformation.category.ilike(f"%{category}%"))
        .all()
    )
