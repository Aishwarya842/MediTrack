# MEDI TRACK – Integrated Patient Care Management System

An enterprise-grade, Indian multispeciality hospital web portal and integrated healthcare management system designed with inspiration from premier healthcare institutions (such as Sooriya Hospital, Chennai).

---

## Key Capabilities & Architecture

- **Public Multispeciality Hospital Portal**:
  - Emergency 24x7 Hotline (`1066`), NABH Accreditation highlights, OPD Timings.
  - Interactive Specialty Departments (Cardiology, Neurology, Orthopaedics, Nephrology, Paediatrics, OB/GYN, Gastroenterology, Pulmonology).
  - Specialist Doctor Roster with experience, qualifications, and live slot booking.
  - Comprehensive Preventive Health Checkup Packages (Cardiac, Diabetes, Senior Citizen, Executive Full Body).
  - Instant Appointment Booking Engine with doctor availability verification and double-booking prevention.

- **Role-Based Healthcare Management Dashboard (RBAC)**:
  - **ADMIN**: Complete hospital governance, patient directory, doctor management, appointments, pharmacy stock control, GST-compliant billing, payments, analytics, audit logging, and reporting.
  - **DOCTOR**: OPD consultation room, clinical vitals logging, symptoms, ICD-10 diagnosis, treatment protocols, and digital prescription creation with live medicine search.
  - **PATIENT**: Self-service portal for appointment booking, history, digital prescriptions with download/print, itemized GST hospital invoices, and UPI/Card payments.

- **Medicine Inventory & Clinical Catalog**:
  - Over 16 clinical categories (Analgesics, Antibiotics, Antivirals, Antifungals, Antihistamines, Antacids, Antidiabetics, Antihypertensives, Cardiovascular, Respiratory, Dermatology, Vitamins, Supplements, Neurological, Ophthalmic, Emergency).
  - Indian pharmaceutical formulations (Micro Labs, Sun Pharma, Cipla, Dr. Reddy's, GlaxoSmithKline, Glenmark, Torrent).
  - Dosage forms: Tablet, Capsule, Syrup, Injection, Drops, Cream, Ointment, Inhaler, Powder, Suspension.

- **Hospital Billing, GST Invoices & Payments**:
  - Automated calculations: Consultation fee + Medicine charges + Lab tests + Nursing/Procedures - Discounts + 5% GST = Grand Total.
  - Payment modes: Cash, Credit Card, Debit Card, UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking.

- **Analytics & Reporting (Chart.js & Export)**:
  - Monthly OPD trends, gender distribution, department workload, top prescribed medicines, monthly revenue breakdowns, and payment status distribution.
  - One-click CSV and PDF report generation.

---

## Technology Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS & Vanilla Design System), Modern JavaScript (ES6+ Fetch API, Chart.js, Lucide/Font Awesome icons).
- **Backend**: Python 3.10+ with Flask, Flask-JWT-Extended, Flask-CORS.
- **Database**: MySQL 8.0+ / MariaDB with structured DDL/DML script (`database/meditrack.sql`) and zero-config SQLite dual-mode support.
- **Security**: JWT Authentication, PBKDF2/SHA-256 password hashing, RBAC decorators, SQL Injection protection, Audit logging.

---

## Directory Structure

```text
MediTrack/
│
├── app.py                     # Primary Flask REST API Server & Web Controller
├── config.py                  # Environment & Hospital Configuration
├── requirements.txt           # Python Dependencies
├── README.md                  # Comprehensive Documentation
├── .gitignore
│
├── database/
│   └── meditrack.sql          # Complete MySQL 8.0+ Schema & Seed Script
│
├── templates/
│   ├── home.html              # Public Hospital Website
│   ├── login.html             # Multi-Role Secure Login Portal
│   ├── dashboard.html         # Management Dashboard
│   ├── patients.html          # Patient Management & UHID Directory
│   ├── doctors.html           # Doctor Directory & OPD Schedules
│   ├── appointments.html      # Slot Booking & Schedule Engine
│   ├── consultations.html     # Clinical Notes & Diagnosis Desk
│   ├── prescriptions.html     # Digital Prescription Generator & Print Engine
│   ├── medicines.html         # Pharmacy Catalog & Stock Management
│   ├── invoices.html          # Hospital Billing & GST Invoices
│   ├── payments.html          # Payment Management & UPI Gateways
│   ├── analytics.html         # Chart.js Healthcare Analytics
│   └── reports.html           # CSV & PDF Report Generators
│
└── static/
    ├── css/
    │   └── style.css          # Hospital Theme & Print Stylesheets
    └── js/
        ├── main.js            # UI Controllers & Routing
        └── api.js             # REST API Client & Autocomplete
```

---

## Quick Setup & Execution

### 1. Database Setup (MySQL)
Open MySQL Shell or phpMyAdmin and execute:
```bash
mysql -u root -p < database/meditrack.sql
```

### 2. Python Flask Server
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (optional)
export MYSQL_USER="root"
export MYSQL_PASSWORD="your_password"
export MYSQL_DB="meditrack_db"

# Start the Flask server
python3 app.py
```
Server will start at `http://localhost:3000` (or `http://localhost:5000`).

---

## Pre-configured Test Credentials

| Role | Username | Email | Default Password |
|---|---|---|---|
| **Admin** | `admin` | `admin@meditrack.in` | `Admin@123` |
| **Doctor** | `dr_kavitha` | `kavitha.cardio@meditrack.in` | `Doctor@123` |
| **Patient** | `patient_rajesh` | `rajesh.sharma@gmail.com` | `Patient@123` |

*(Quick 1-Click login buttons are also provided on the login page for instant testing).*
