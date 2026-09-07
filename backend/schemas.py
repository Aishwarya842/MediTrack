from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date, time
from decimal import Decimal

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "patient"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    email: str

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Patient Schemas ---
class PatientBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientOut(PatientBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Doctor Schemas ---
class DoctorBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    specialization: str
    qualification: Optional[str] = None
    experience: Optional[int] = 0
    availability: Optional[str] = "available"
    consultation_fee: Optional[Decimal] = Decimal("0.00")
    about: Optional[str] = None

class DoctorCreate(DoctorBase):
    pass

class DoctorOut(DoctorBase):
    id: int
    user_id: Optional[int] = None

    class Config:
        from_attributes = True

# --- Appointment Schemas ---
class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    receptionist_id: Optional[int] = None
    appointment_date: date
    appointment_time: time
    status: Optional[str] = "scheduled"
    reason: Optional[str] = None
    type: Optional[str] = "in-person"
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentOut(AppointmentBase):
    id: int
    created_at: datetime
    patient: Optional[PatientOut] = None
    doctor: Optional[DoctorOut] = None

    class Config:
        from_attributes = True

# --- Consultation Schemas ---
class ConsultationBase(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    symptoms: Optional[str] = None
    observations: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up_date: Optional[date] = None
    status: Optional[str] = "completed"
    notes: Optional[str] = None

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationOut(ConsultationBase):
    id: int
    consultation_date: datetime

    class Config:
        from_attributes = True

# --- Medicine Schemas ---
class MedicineBase(BaseModel):
    medicine_name: str
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    category: str
    manufacturer: Optional[str] = None
    strength: Optional[str] = None
    form: str
    unit_price: Decimal = Decimal("0.00")
    stock_quantity: int = 0
    description: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineOut(MedicineBase):
    id: int

    class Config:
        from_attributes = True

# --- Prescription Schemas ---
class PrescriptionItemCreate(BaseModel):
    medicine_id: int
    strength: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    quantity: int = 1

class PrescriptionItemOut(PrescriptionItemCreate):
    id: int
    medicine: Optional[MedicineOut] = None

    class Config:
        from_attributes = True

class PrescriptionCreate(BaseModel):
    patient_id: int
    doctor_id: int
    consultation_id: Optional[int] = None
    notes: Optional[str] = None
    valid_until: Optional[date] = None
    items: List[PrescriptionItemCreate] = []

class PrescriptionOut(BaseModel):
    id: int
    prescription_number: str
    patient_id: int
    doctor_id: int
    prescription_date: datetime
    notes: Optional[str] = None
    valid_until: Optional[date] = None
    status: str
    items: List[PrescriptionItemOut] = []

    class Config:
        from_attributes = True

# --- Invoice & Payment Schemas ---
class InvoiceCreate(BaseModel):
    patient_id: int
    consultation_id: Optional[int] = None
    appointment_id: Optional[int] = None
    consultation_fee: Decimal = Decimal("0.00")
    medicine_charges: Decimal = Decimal("0.00")
    laboratory_charges: Decimal = Decimal("0.00")
    additional_charges: Decimal = Decimal("0.00")
    discount: Decimal = Decimal("0.00")
    tax: Decimal = Decimal("0.00")

class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    patient_id: int
    consultation_fee: Decimal
    medicine_charges: Decimal
    laboratory_charges: Decimal
    grand_total: Decimal
    payment_status: str
    invoice_date: datetime

    class Config:
        from_attributes = True
