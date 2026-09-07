from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import uuid
from ..database import get_db
from .. import models, schemas, auth
from ..services.sms_service import send_appointment_sms

# Doctors Router
doctors_router = APIRouter(prefix="/api/doctors", tags=["Doctors"])

@doctors_router.get("/", response_model=List[schemas.DoctorOut])
def list_doctors(
    specialization: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Doctor)
    if specialization:
        query = query.filter(models.Doctor.specialization.ilike(f"%{specialization}%"))
    return query.all()

@doctors_router.get("/{doctor_id}", response_model=schemas.DoctorOut)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doc


# Appointments Router
appointments_router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@appointments_router.get("/", response_model=List[schemas.AppointmentOut])
def list_appointments(
    appointment_date: Optional[date] = None,
    doctor_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Appointment)
    if current_user.role.lower() == "patient":
        patient = db.query(models.Patient).filter(models.Patient.user_id == current_user.id).first()
        if patient:
            query = query.filter(models.Appointment.patient_id == patient.id)
    elif current_user.role.lower() == "doctor":
        doctor = db.query(models.Doctor).filter(models.Doctor.user_id == current_user.id).first()
        if doctor:
            query = query.filter(models.Appointment.doctor_id == doctor.id)
    else:
        if doctor_id:
            query = query.filter(models.Appointment.doctor_id == doctor_id)
        if patient_id:
            query = query.filter(models.Appointment.patient_id == patient_id)

    if appointment_date:
        query = query.filter(models.Appointment.appointment_date == appointment_date)
    return query.order_by(models.Appointment.appointment_date.desc(), models.Appointment.appointment_time.asc()).all()

@appointments_router.post("/", response_model=schemas.AppointmentOut)
def create_appointment(
    payload: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_app = models.Appointment(**payload.dict(), created_by=current_user.id)
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    # Attempt SMS notification if patient phone and doctor details exist
    try:
        patient = db.query(models.Patient).filter(models.Patient.id == new_app.patient_id).first()
        doctor = db.query(models.Doctor).filter(models.Doctor.id == new_app.doctor_id).first()
        if patient and patient.phone:
            doc_name = doctor.user.full_name if doctor and doctor.user else "Attending Specialist"
            send_appointment_sms(
                phone=patient.phone,
                token=new_app.appointment_no or f"APT-{new_app.id}",
                doctor_name=doc_name,
                date_str=str(new_app.appointment_date),
                time_str=str(new_app.appointment_time)
            )
    except Exception:
        pass

    return new_app


# Medicines Router
medicines_router = APIRouter(prefix="/api/medicines", tags=["Medicines / Formulary"])

@medicines_router.get("/", response_model=List[schemas.MedicineOut])
def list_medicines(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Medicine)
    if category:
        query = query.filter(models.Medicine.category == category)
    if search:
        query = query.filter(
            (models.Medicine.medicine_name.ilike(f"%{search}%")) |
            (models.Medicine.generic_name.ilike(f"%{search}%")) |
            (models.Medicine.brand_name.ilike(f"%{search}%"))
        )
    return query.all()


# Prescriptions Router
prescriptions_router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])

@prescriptions_router.get("/", response_model=List[schemas.PrescriptionOut])
def list_prescriptions(
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Prescription)
    if patient_id:
        query = query.filter(models.Prescription.patient_id == patient_id)
    return query.order_by(models.Prescription.prescription_date.desc()).all()

@prescriptions_router.post("/", response_model=schemas.PrescriptionOut)
def create_prescription(
    payload: schemas.PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "doctor"]))
):
    rx_number = f"RX-{uuid.uuid4().hex[:8].upper()}"
    prescription = models.Prescription(
        prescription_number=rx_number,
        patient_id=payload.patient_id,
        doctor_id=payload.doctor_id,
        consultation_id=payload.consultation_id,
        notes=payload.notes,
        valid_until=payload.valid_until,
        status="active"
    )
    db.add(prescription)
    db.flush()

    for item in payload.items:
        rx_item = models.PrescriptionMedicine(
            prescription_id=prescription.id,
            medicine_id=item.medicine_id,
            strength=item.strength,
            dosage=item.dosage,
            frequency=item.frequency,
            duration=item.duration,
            instructions=item.instructions,
            quantity=item.quantity
        )
        db.add(rx_item)

    db.commit()
    db.refresh(prescription)
    return prescription


# Invoices Router
invoices_router = APIRouter(prefix="/api/invoices", tags=["Billing & Invoices"])

@invoices_router.get("/", response_model=List[schemas.InvoiceOut])
def list_invoices(
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Invoice)
    if patient_id:
        query = query.filter(models.Invoice.patient_id == patient_id)
    return query.order_by(models.Invoice.invoice_date.desc()).all()

@invoices_router.post("/", response_model=schemas.InvoiceOut)
def create_invoice(
    payload: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin", "receptionist"]))
):
    subtotal = (
        payload.consultation_fee +
        payload.medicine_charges +
        payload.laboratory_charges +
        payload.additional_charges -
        payload.discount
    )
    grand_total = subtotal + payload.tax
    inv_number = f"INV-{uuid.uuid4().hex[:8].upper()}"

    invoice = models.Invoice(
        invoice_number=inv_number,
        patient_id=payload.patient_id,
        consultation_id=payload.consultation_id,
        appointment_id=payload.appointment_id,
        consultation_fee=payload.consultation_fee,
        medicine_charges=payload.medicine_charges,
        laboratory_charges=payload.laboratory_charges,
        additional_charges=payload.additional_charges,
        discount=payload.discount,
        tax=payload.tax,
        grand_total=grand_total,
        payment_status="pending",
        created_by=current_user.id
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice
