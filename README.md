# CareHub – Integrated Patient Care & Multispeciality Hospital Management System

An enterprise-grade, Indian multispeciality healthcare web portal and hospital management system built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**. Inspired by leading multispeciality healthcare institutions, CareHub seamlessly bridges public patient discovery, front-desk reception, clinical OPD consultations, digital prescriptions, cashless protocols, and administrative governance.

---

## 🔐 Login Credentials & Authentication Flow

CareHub features an intuitive, role-based authentication model tailored for rapid hospital workflows:

| Role | Login Method / Password | Details |
|---|---|---|
| 👨‍⚕️ **Doctor** | **No Password (Passwordless 1-Click Login)** | Doctors simply select their name from the dropdown list and click **"Login as Doctor"**. Instantly loads their personalized OPD chamber, assigned patient queue, and clinical notes. |
| 👩‍💼 **Receptionist** | **`reception`** *(or `reception123` / `1234`)* | Unlocks the Front Desk OPD station for walk-in patient registration, ₹945 fee collection, vitals recording, queue token generation, and doctor dispatch alerts. |
| 🛡️ **Admin** | **`admin`** *(or `admin123` / `carehub`)* | Unlocks hospital-wide administrative control, doctor & staff management, medicine inventory & stock control, revenue analytics, and clinical audit trail logs. |
| 🏥 **Patient** | **Registered 10-Digit Mobile Number** *(or Token / UHID)* | **No password required.** Patients can track their live queue status, token progress, and download/print verified digital prescriptions simply by entering their registered mobile number. |

---

## 🏗️ Architecture: Frontend & Backend Details

### 1. Frontend Architecture
- **Core Framework**: **React 19** with strict **TypeScript** for type safety and modular component development.
- **Build & Development Tooling**: **Vite 6** providing rapid HMR and optimized production bundling.
- **Styling & Design System**: **Tailwind CSS (v4)** utilizing custom utility classes, accessible color palettes, and responsive design patterns.
- **Icons & UI Typography**: Paired icons from **Font Awesome 6** and **Lucide React** for clinical and administrative interfaces.
- **Component Hierarchy**:
  - `PublicHome.tsx`: Public patient-facing hospital portal, specialty directory, and doctor booking.
  - `DashboardView.tsx`: Adaptive operational hub displaying live queues, metrics, and role-specific shortcuts.
  - `AppointmentsView.tsx`: Appointment booking engine with 7-day slot availability.
  - `ConsultationsView.tsx`: Clinical OPD chamber for reviewing vitals, entering chief complaints, and recording diagnoses.
  - `PrescriptionsView.tsx`: Digital prescription generator (Rx) with auto-formatted ₹945 reception vouchers and NABH print sheets.
  - `InvoicesView.tsx`: OPD billing and GST invoice generator.
  - `PaymentsView.tsx`: Multi-mode payment settlement and receipts.
  - `RemindersView.tsx`: Follow-up reminder engine (SMS/Call).
  - `MedicinesView.tsx`, `AnalyticsView.tsx` & `ReportsView.tsx`: Pharmacy inventory formulary, Chart.js hospital analytics, and CSV/PDF reporting.
- **PDF & Print Engine**: Client-side document generation using **jsPDF** and **jsPDF-AutoTable**, combined with dedicated CSS `@media print` rules for browser printing.

### 2. Backend & Persistence Architecture
- **Data Service Engine (`src/services/db.ts`)**:
  - Implements a structured, indexed client-side database layer managing individual collections: `patients`, `doctors`, `appointments`, `consultations`, `prescriptions`, `invoices`, `payments`, and `audit_logs`.
  - Guarantees data durability across sessions using browser `localStorage` with automated serialization, deserialization, and schema integrity validation.
  - Seeds rich initial baseline data from `src/data/hospitalData.ts` on first load.
- **Doctor Availability & Scheduling Engine**:
  - Built-in scheduling algorithm (`dbService.isDoctorAvailable`) validating OPD dates. Configured so that **all doctors are available on all days (Mon–Sun, 7 days a week, no leave)**.
- **Bi-Directional Event & Notification Engine**:
  - Manages internal hospital dispatches in memory and local storage (`InternalNotification`).
  - Automatically pushes dispatch alerts to doctors when receptionists register patients.
  - Automatically notifies the Receptionist desk when a doctor completes a consultation and issues a prescription.
- **Server Runtime**:
  - Powered by Node.js and tsx/Vite, bound to port `3000` (`0.0.0.0`) for seamless container ingress routing.

---

## 🌟 Key Features & Hospital Protocols

### 1. 7-Day Uninterrupted Doctor OPD Schedules
- **All Days Active (Mon – Sun, 7 Days a week)**: All specialist doctors across all clinical departments (Cardiology, Neurology, Orthopaedics, Nephrology, Paediatrics, Obstetrics & Gynaecology, Gastroenterology, General Medicine) are available every day of the week with no leave restrictions.
- **Dynamic Slot Booking**: Patients can schedule consultations on any day of the week without schedule blockages.

### 2. Front-Desk Reception & Cashless Doctor Protocol
- **Reception-Centric Fee Collection**:
  - Outpatient consultation fee is collected exclusively at the **Front Desk Reception** upon patient arrival/walk-in registration.
  - Receptionist records biological vitals (Height, Weight, BP, Pulse, SpO2, Temperature, Blood Group) and issues a Unique Hospital ID (UHID) and Queue Token.
- **Strict Cashless Protocol for Doctors**:
  - Doctors do **not** collect cash, take fees, or sell medications in consultation chambers.
  - Consultations and digital prescriptions clearly reflect: **"Paid at Reception Desk"** with verified receipt vouchers.
- **Patient Medication Directive**:
  - Prescribed drugs are to be purchased directly by the patient from their chosen outside pharmacy.
  - Doctors solely specify active clinical formulations, dosages, timings, food instructions, and durations.

### 3. Healthcare Billing & GST Compliance
- **OPD Billing Breakdown**:
  - Consultation fee **₹700.00** + Clinical Nursing / Registration / Sanitization (SAC 999319) **₹200.00** + **5% Healthcare GST (₹45.00)** = **Grand Total ₹945.00**.
  - Printed bills display an itemized subtotal, the applicable 5% GST (CGST + SGST), and the grand total, with a verified receipt number.

### 4. Real-Time Bi-Directional Notification Loop
- **Receptionist ➔ Doctor**:
  - When a receptionist books a walk-in patient or dispatches a token, an automated dispatch notification is routed immediately to the attending doctor’s dashboard showing patient UHID, vitals, and fee clearance.
- **Doctor ➔ Receptionist (Consultation Completion)**:
  - Upon completing clinical notes and authorizing the digital prescription (Rx), an instant high-priority notification is dispatched to the Receptionist confirming the fee is now collectable.

### 5. Multi-Role Healthcare Management (RBAC)

| Role | Core Capabilities |
|---|---|
| **Receptionist** | Fast walk-in registration, token dispatching, OPD fee collection at reception, real-time doctor assignment, patient UHID creation, consultation completion alerts. |
| **Doctor** | Dedicated OPD consultation chamber, patient queue inspection, vitals review, clinical diagnosis & notes, digital prescription generator (Rx) with auto-printed reception voucher, instant print & export. |
| **Admin** | Hospital-wide governance, doctor & staff management, medicine inventory & stock control, revenue analytics, audit trail logging, patient master directory. |
| **Patient** | Online appointment booking, live queue/token status tracker, mobile number search, download & print authorized digital prescriptions, payment receipt history. |

### 6. Clinical OPD & Digital Prescription Studio
- **Indian Pharmaceutical Drug Catalog**:
  - Generic and brand formulations across 16 therapeutic classes (Analgesics, Antibiotics, Antihypertensives, Antidiabetics, Cardiac, etc.) from leading Indian manufacturers.
  - Dosage formats: Tablets, Syrups, Inhalers, Drops, Injections, Ointments with predefined schedules (1-0-1, 1-0-0, 0-0-1 after food).
- **Print & PDF Engine**:
  - High-resolution, NABH-standard prescription sheet layout complete with hospital header, emergency hotline, doctor registration number, Rx symbol, dosage table, dietary advice, follow-up date, and verified reception clearance watermark.

---

## 📁 Project Structure

```text
├── index.html                     # Application entry point & meta tags
├── metadata.json                  # AI Studio applet specifications
├── package.json                   # Dependencies & npm scripts
├── vite.config.ts                 # Vite & Tailwind configuration
├── README.md                      # Project documentation
│
├── src/
│   ├── main.tsx                   # React root entry point
│   ├── App.tsx                    # Root state coordinator, routing & notification loop
│   ├── index.css                  # Global Tailwind CSS styles & print media rules
│   │
│   ├── data/
│   │   └── hospitalData.ts        # Seed data (doctors, medicines, departments, packages)
│   │
│   ├── services/
│   │   └── db.ts                  # Local database service, availability rules & CRUD operations
│   │
│   └── components/
│       ├── Navbar.tsx             # Responsive navigation with role switcher & active alerts
│       ├── DashboardView.tsx      # Multi-role operational dashboard & quick registration
│       ├── PublicHome.tsx         # Public patient hospital portal & specialty discovery
│       ├── AppointmentsView.tsx   # Appointment booking engine & slot manager
│       ├── ConsultationsView.tsx  # Clinical OPD consultation room & notes
│       ├── PrescriptionsView.tsx  # Digital prescription generator (Rx) & print engine
│       ├── InvoicesView.tsx       # Hospital billing & GST invoicing
│       ├── PaymentsView.tsx       # Multi-mode payment settlement & receipts
│       ├── DoctorsView.tsx        # Doctor directory & 7-day OPD schedule roster
│       ├── PatientsView.tsx       # Patient directory & electronic medical records (EMR)
│       ├── MedicinesView.tsx      # Pharmacy formulary & drug inventory management
│       ├── AnalyticsView.tsx      # Hospital performance metrics & Chart.js visualizers
│       ├── RemindersView.tsx      # Follow-up reminder engine (SMS/Call)
│       ├── ReportsView.tsx        # CSV/PDF report generators
│       ├── PortalSidebar.tsx      # Role-based portal navigation sidebar
│       └── LoginModal.tsx         # Role-based login dialog (passwordless doctors, receptionist, admin)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Production Build
```bash
npm run build
```