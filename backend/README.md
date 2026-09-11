# CareHub — Integrated Patient Care Management System

A full-stack enterprise hospital management portal for Indian multispeciality hospitals, covering the complete patient care lifecycle — from public-facing website and appointment booking to clinical consultations, prescriptions, GST billing, pharmacy inventory, and analytics.

---

## Features

### Public Hospital Portal
- 24x7 Emergency Hotline (`1066`), NABH accreditation highlights, OPD timings
- 9 interactive specialty departments (Cardiology, Neurology, Orthopaedics, Nephrology, Paediatrics, OB/GYN, Gastroenterology, Pulmonology)
- Specialist doctor roster with experience, qualifications, and live slot booking
- Preventive health checkup packages (Cardiac, Diabetes, Senior Citizen, Executive)

### Role-Based Access Control (RBAC)
| Role | Capabilities |
|------|-------------|
| **Admin** | Hospital governance, patient/doctor management, appointments, pharmacy stock, GST billing, payments, analytics, audit logs, reporting |
| **Doctor** | OPD consultation room, vitals logging, symptoms, ICD-10 diagnosis, treatment protocols, digital prescriptions with live medicine search |
| **Patient** | Self-service appointment booking, history, digital prescriptions (download/print), GST invoices, UPI/Card payments |

### Medicine Inventory & Pharmacy
- 20+ Indian pharmaceutical formulations across 16 clinical categories
- Brands: Micro Labs, Sun Pharma, Cipla, Dr. Reddy's, GSK, Glenmark, Torrent
- Dosage forms: Tablet, Capsule, Syrup, Injection, Drops, Cream, Ointment, Inhaler, Powder, Suspension
- Stock management with batch tracking, expiry dates, and auto-refill alerts

### Billing & Payments
- Automated formula: Consultation + Medicine + Lab + Nursing − Discount + 5% GST = Grand Total
- Payment modes: Cash, Credit/Debit Card, UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking
- GST-compliant invoices with HSN codes

### Analytics & Reporting
- Monthly OPD trends, gender distribution, department workload
- Top prescribed medicines, monthly revenue, payment status distribution
- One-click CSV and PDF export

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend (React SPA)** | React 19, TypeScript, Vite 6, Tailwind CSS 4, Chart.js, jsPDF, Lucide icons, Motion (animations) |
| **Frontend (Flask templates)** | HTML5, CSS3, Vanilla JS (ES6+ Fetch API), Jinja2, Chart.js, Font Awesome |
| **Backend (Flask)** | Python 3.10+, Flask 3.0+, Flask-JWT-Extended, Flask-CORS, Werkzeug |
| **Backend (FastAPI)** | Python 3.10+, FastAPI 0.110, SQLAlchemy 2.0, Pydantic v2, Uvicorn |
| **Database** | SQLite (zero-config default) or MySQL 8.0+ / MariaDB |


---

## Project Structure

```
CareHub/
├── app.py                        # Flask REST API server & web controller
├── config.py                     # Environment & hospital configuration
├── requirements.txt              # Python (Flask) dependencies
├── package.json                  # Node.js (React) dependencies
├── index.html                    # React SPA entry point
├── vite.config.ts                # Vite + Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Environment variable template
│
├── database/
│   ├── carehub.sql             # MySQL 8.0+ schema & seed data
│   └── carehub.sqlite          # Auto-generated SQLite database
│
├── templates/                    # Flask Jinja2 templates (13 pages)
│   ├── home.html
│   ├── login.html
│   ├── dashboard.html
│   ├── patients.html
│   ├── doctors.html
│   ├── appointments.html
│   ├── consultations.html
│   ├── prescriptions.html
│   ├── medicines.html
│   ├── invoices.html
│   ├── payments.html
│   ├── analytics.html
│   └── reports.html
│
├── static/
│   ├── css/style.css             # Hospital theme & print stylesheets
│   └── js/
│       ├── main.js               # UI controllers & routing
│       └── api.js                # REST API client
│
├── src/                          # React + TypeScript SPA
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Main application component
│   ├── index.css                 # Tailwind + custom styles
│   ├── components/               # 26 React components
│   ├── data/hospitalData.ts      # Clinical datasets & constants
│   ├── services/db.ts            # localStorage persistence service
│   └── assets/images/            # Hospital & doctor photos
│
└── backend/                      # FastAPI backend (v2.0.0)
    ├── main.py                   # FastAPI application
    ├── database.py               # SQLAlchemy engine/session
    ├── models.py                 # ORM models (13 tables)
    ├── schemas.py                # Pydantic v2 schemas
    ├── auth.py                   # JWT auth & RBAC
    ├── requirements.txt          # FastAPI dependencies
    ├── .env.example              # SMS gateway config template
    ├── routers/                  # API route modules
    └── services/sms_service.py   # Twilio/Fast2SMS integration
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ (or Bun)
- MySQL 8.0+ (optional — SQLite works with zero configuration)

### Option A: Flask App (Full-Stack Server-Rendered)

```bash
# Clone the repository
git clone https://github.com/your-username/CareHub.git
cd CareHub

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Set environment variables for MySQL
# set USE_SQLITE=false
# set MYSQL_USER=root
# set MYSQL_PASSWORD=your_password
# set MYSQL_DB=carehub_db

# Start the server
python app.py
```

Server starts at **http://localhost:3000**. SQLite database is auto-created on first run with full schema and seed data.

### Option B: React SPA (Client-Side with localStorage)

```bash
# Install Node dependencies
npm install
# or: bun install

# Start development server
npm run dev
```

React dev server starts at **http://localhost:3000**. All data persists in browser localStorage.

### Option C: FastAPI Backend (REST API Only)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# (Optional) Configure .env for database and SMS
# copy .env.example .env

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API docs (Swagger): **http://localhost:8000/docs**
- ReDoc: **http://localhost:8000/redoc**
- Health check: **http://localhost:8000/api/health**

---

## Database

### SQLite (Default — Zero Config)
The Flask app automatically creates `database/carehub.sqlite` on startup with all 13 tables and seed data. No setup required.

### MySQL (Production)
```bash
mysql -u root -p < database/carehub.sql
```

Then set environment variables:
```
USE_SQLITE=false
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=carehub_db
```

### Database Schema (13 Tables)
`users` → `patients` → `doctors` → `appointments` → `consultations` → `medicines` → `prescriptions` → `prescription_medicines` → `invoices` → `invoice_items` → `payments` → `notifications` → `audit_logs`

---

## Environment Variables

### Flask App (`config.py`)
| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `carehub-super-secret-production-key-2026` | Flask session secret |
| `JWT_SECRET_KEY` | `carehub-jwt-token-signing-secret-2026` | JWT token signing key |
| `USE_SQLITE` | `true` | Use SQLite (`true`) or MySQL (`false`) |
| `MYSQL_HOST` | `localhost` | MySQL host |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_USER` | `root` | MySQL username |
| `MYSQL_PASSWORD` | `""` | MySQL password |
| `MYSQL_DB` | `carehub_db` | MySQL database name |

### FastAPI Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Database connection string |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio sender number |
| `FAST2SMS_API_KEY` | Fast2SMS API key (India) |

### Gemini AI (`.env`)
| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `APP_URL` | Application URL |

---

## API Endpoints (Flask — `localhost:3000`)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (username/email + password → JWT) |
| POST | `/api/auth/register` | Patient self-registration |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List all (optional `?search=`) |
| GET | `/api/patients/<id>` | Get patient by ID |
| POST | `/api/patients` | Create patient |
| PUT | `/api/patients/<id>` | Update patient |
| DELETE | `/api/patients/<id>` | Delete patient |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List all (optional `?department=`) |
| GET | `/api/doctors/<id>` | Get doctor by ID |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments/check-availability` | Check slot availability |
| GET | `/api/appointments` | List (filters: `patient_id`, `doctor_id`, `status`) |
| POST | `/api/appointments` | Book appointment (double-booking prevention) |
| PUT | `/api/appointments/<id>/status` | Update appointment status |

### Consultations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/consultations` | List (optional `?patient_id=`) |
| POST | `/api/consultations` | Create consultation with vitals & ICD-10 diagnosis |

### Medicines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | List (filters: `search`, `category`) |
| POST | `/api/medicines` | Add medicine to catalog |
| PUT | `/api/medicines/<id>` | Update stock, batch, pricing |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prescriptions` | List (filters: `patient_id`, `doctor_id`) |
| POST | `/api/prescriptions` | Create prescription (auto-deducts stock) |

### Invoices & Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List (optional `?patient_id=`) |
| POST | `/api/invoices` | Create GST invoice (auto-calculates totals) |
| GET | `/api/payments` | List all payments |
| POST | `/api/payments` | Record payment (updates invoice status) |

### Analytics & System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Dashboard metrics & trends |
| GET | `/api/audit-logs` | Last 50 audit entries |
| GET | `/api/notifications` | Last 20 notifications |

---

## Test Credentials

### Flask App
| Role  | Password |
|------|----------|
| Admin | `admin` | 
| Doctor | `through name` | 
| Patient | `mobile number`|

### FastAPI Backend
| Role | Email | Password |
|------|-------|----------|
| Admin |`admin123` |
| Doctor | `through selecting their name`|
| Receptionist  | `reception` |
| Patient | `mobile number`|

> Quick-login buttons are available on the login page for instant testing.

---

## OPD Fee Structure

| Item | Amount |
|------|--------|
| Consultation Fee | ₹700 |
| Nursing / Registration | ₹200 |
| GST (5%) | ₹45 |
| **Total** | **₹945** |

---

## Hospital Identity

- **Name**: CareHub Multispeciality Hospital
- **Location**: Chennai, Tamil Nadu, India
- **Accreditation**: NABH Accredited
- **GSTIN**: `33AAACM1234F1Z8`
- **Emergency**: `1066` (24x7)

---

