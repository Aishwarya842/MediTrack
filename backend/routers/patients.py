from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("/", response_model=List[schemas.PatientOut])
def list_patients(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "doctor", "receptionist"]))
):
    query = db.query(models.Patient)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Patient.first_name.ilike(search_pattern)) |
            (models.Patient.last_name.ilike(search_pattern)) |
            (models.Patient.email.ilike(search_pattern)) |
            (models.Patient.phone.ilike(search_pattern))
        )
    return query.offset(skip).limit(limit).all()

@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Patient can only view their own profile unless staff
    if current_user.role.lower() == "patient":
        patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
        if not patient or patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Unauthorized patient record access")
        return patient

    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")
    return patient

@router.post("/", response_model=schemas.PatientOut)
def create_patient(
    payload: schemas.PatientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "receptionist"]))
):
    existing = db.query(models.Patient).filter(models.Patient.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patient with this email already exists")

    new_patient = models.Patient(**payload.dict())
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient
