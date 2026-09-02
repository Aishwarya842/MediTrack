# 🏥 MEDI TRACK — Full-Stack Hospital Information Management System (HIMS)

## 📌 Architecture Overview

This project implements a complete Enterprise Hospital Management System based on your mentor's requirements:

- **Frontend**: Modern React + TypeScript + Tailwind CSS with responsive Role-Based Portals (Admin, Doctor, Receptionist, Patient) & High-Impact Clinical UI.
- **Backend**: **Python 3.10+ with FastAPI** for high-performance async REST APIs, automatic OpenAPI/Swagger documentation, and JWT Authentication with RBAC middleware.
- **Database**: **MySQL Database** powered by `meditrack.sql` (also compatible with SQLite for zero-config testing), mapped via **SQLAlchemy 2.0 ORM** models and **Pydantic v2** validation.

---

## 🗄️ Database Mapping (`meditrack.sql` ⟷ Python ORM)

| SQL Table (`meditrack.sql`) | SQLAlchemy Model (`models.py`) | Description |
| :--- | :--- | :--- |
| `users` | `User` | Role-based accounts (`admin`, `doctor`, `receptionist`, `patient`) |
| `patients` | `Patient` | Master UHID patient registry, medical history, allergies, emergency contacts |
| `doctors` | `Doctor` | Doctor profiles, specializations, OPD consultation fees, experience |
| `receptionists` | `Receptionist`| Front-desk staff registry with shift schedules |
| `appointments` | `Appointment` | OPD slot booking, token queue, status workflow |
| `consultations` | `Consultation`| Clinical diagnosis, symptoms, examination observations, follow-up dates |
| `medicines` | `Medicine` | Pharmacy inventory, drug strength, form, category, unit price, stock |
| `prescriptions` | `Prescription` | Digital Rx headers, validity periods, doctor notes |
| `prescription_medicines` | `PrescriptionMedicine` | Rx drug line items with dosage, frequency, instructions, and duration |
| `invoices` | `Invoice` | Billing accounting: consultation fee, medicine, lab charges, tax, grand total |
| `payments` | `Payment` | Multi-mode settlement (UPI, Card, Cash) and digital receipts |
| `notifications` | `Notification`| Automated appointment reminders and report alerts |
| `audit_logs` | `AuditLog` | Clinical audit trail tracking user actions and IP addresses |

---

## 🚀 How to Run the Python Backend

### 1. Install Dependencies
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Database
By default, the backend connects to MySQL. You can configure your connection string via `.env` or environment variable:
```bash
# For MySQL (matching meditrack.sql):
export DATABASE_URL="mysql+pymysql://root:your_mysql_password@localhost:3306/meditrack_db"

# Or for local SQLite testing:
export DATABASE_URL="sqlite:///./meditrack.db"
```

### 3. Initialize Database Schema
If using MySQL, run the provided SQL script:
```bash
mysql -u root -p < meditrack.sql
```

### 4. Start the FastAPI Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📖 Interactive API Documentation (Swagger / OpenAPI)

Once the backend is running, open your browser:
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/api/health`

---

## 🔑 Default Login Credentials (from `meditrack.sql`)

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@meditrack.com` | `admin123` | Full hospital governance, financial audit, staff directory |
| **Doctor** | `dr.john@meditrack.com` | `doctor123` | Clinical OPD queue, electronic health records, Rx writer |
| **Receptionist** | `reception@meditrack.com` | `reception123` | Patient registration, UHID issuance, token booking, billing |
| **Patient** | `raj.kumar@email.com` | `patient123` | Personal EHR, prescription downloads, appointment schedule |
