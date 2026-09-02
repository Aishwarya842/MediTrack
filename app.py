"""
=============================================================================
MEDI TRACK – Integrated Patient Care Management System
Primary Flask Application & REST API Server
=============================================================================
"""

import os
import sqlite3
import json
import re
from datetime import datetime, date
from functools import wraps
from flask import Flask, request, jsonify, render_template, send_from_directory, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from config import Config

# Initialize Flask application
app = Flask(__name__, template_folder="templates", static_folder="static")
app.config.from_object(Config)
CORS(app)

# Ensure database directory exists
os.makedirs(os.path.join(os.path.dirname(__file__), "database"), exist_ok=True)

# ---------------------------------------------------------------------------
# Database Helper & Connection Management
# ---------------------------------------------------------------------------

def get_db():
    """Retrieve or create a database connection for the active request."""
    if "db" not in g:
        g.db = sqlite3.connect(Config.SQLITE_DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(error):
    """Close the database connection at the end of the request."""
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_sqlite_db():
    """Initialize SQLite database with schema and default seed data if empty."""
    conn = sqlite3.connect(Config.SQLITE_DB_PATH)
    cursor = conn.cursor()
    
    # Check if tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if not cursor.fetchone():
        cursor.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'PATIENT',
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            uhid TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            date_of_birth TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            blood_group TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            aadhar_no TEXT,
            address TEXT NOT NULL,
            city TEXT NOT NULL DEFAULT 'Chennai',
            state TEXT NOT NULL DEFAULT 'Tamil Nadu',
            pincode TEXT NOT NULL DEFAULT '600026',
            emergency_contact_name TEXT NOT NULL,
            emergency_contact_phone TEXT NOT NULL,
            allergies TEXT,
            medical_history TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            doc_reg_no TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            department TEXT NOT NULL,
            designation TEXT NOT NULL,
            qualification TEXT NOT NULL,
            experience_years INTEGER NOT NULL DEFAULT 5,
            consultation_fee REAL NOT NULL DEFAULT 700.00,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            room_no TEXT NOT NULL,
            available_days TEXT NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat',
            available_time_slots TEXT NOT NULL DEFAULT '09:00 AM - 01:00 PM, 05:00 PM - 08:30 PM',
            rating REAL NOT NULL DEFAULT 4.9,
            bio TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            appointment_no TEXT UNIQUE NOT NULL,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            department TEXT NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            appointment_type TEXT NOT NULL DEFAULT 'New Consultation',
            status TEXT NOT NULL DEFAULT 'Confirmed',
            symptoms TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id),
            UNIQUE(doctor_id, appointment_date, appointment_time)
        );

        CREATE TABLE IF NOT EXISTS consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            consultation_no TEXT UNIQUE NOT NULL,
            appointment_id INTEGER,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            consultation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            symptoms TEXT NOT NULL,
            observations TEXT,
            diagnosis TEXT NOT NULL,
            icd_code TEXT,
            bp TEXT,
            pulse INTEGER,
            temperature REAL,
            spo2 INTEGER,
            weight_kg REAL,
            treatment_plan TEXT NOT NULL,
            follow_up_date TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (appointment_id) REFERENCES appointments(id),
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        );

        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine_name TEXT NOT NULL,
            generic_name TEXT NOT NULL,
            brand_name TEXT NOT NULL,
            category TEXT NOT NULL,
            manufacturer TEXT NOT NULL,
            strength TEXT NOT NULL,
            form TEXT NOT NULL,
            unit_price REAL NOT NULL,
            stock_quantity INTEGER NOT NULL DEFAULT 100,
            reorder_level INTEGER NOT NULL DEFAULT 20,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prescription_no TEXT UNIQUE NOT NULL,
            consultation_id INTEGER,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            prescription_date TEXT NOT NULL,
            diagnosis_summary TEXT NOT NULL,
            advice TEXT,
            follow_up_days INTEGER DEFAULT 7,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (consultation_id) REFERENCES consultations(id),
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        );

        CREATE TABLE IF NOT EXISTS prescription_medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prescription_id INTEGER NOT NULL,
            medicine_id INTEGER NOT NULL,
            medicine_name TEXT NOT NULL,
            strength TEXT NOT NULL,
            form TEXT NOT NULL,
            dosage TEXT NOT NULL,
            frequency TEXT NOT NULL,
            duration TEXT NOT NULL,
            timing TEXT NOT NULL DEFAULT 'After Food',
            quantity INTEGER NOT NULL DEFAULT 10,
            instructions TEXT,
            FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
            FOREIGN KEY (medicine_id) REFERENCES medicines(id)
        );

        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_no TEXT UNIQUE NOT NULL,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER,
            consultation_id INTEGER,
            invoice_date TEXT NOT NULL,
            due_date TEXT NOT NULL,
            consultation_fee REAL NOT NULL DEFAULT 0.00,
            medicine_charges REAL NOT NULL DEFAULT 0.00,
            lab_charges REAL NOT NULL DEFAULT 0.00,
            additional_charges REAL NOT NULL DEFAULT 0.00,
            subtotal REAL NOT NULL DEFAULT 0.00,
            discount_percent REAL NOT NULL DEFAULT 0.00,
            discount_amount REAL NOT NULL DEFAULT 0.00,
            gst_percent REAL NOT NULL DEFAULT 5.00,
            tax_amount REAL NOT NULL DEFAULT 0.00,
            grand_total REAL NOT NULL DEFAULT 0.00,
            payment_status TEXT NOT NULL DEFAULT 'Pending',
            payment_mode TEXT NOT NULL DEFAULT 'Unpaid',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id),
            FOREIGN KEY (consultation_id) REFERENCES consultations(id)
        );

        CREATE TABLE IF NOT EXISTS invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            item_type TEXT NOT NULL,
            item_description TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price REAL NOT NULL,
            total_amount REAL NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payment_no TEXT UNIQUE NOT NULL,
            invoice_id INTEGER NOT NULL,
            patient_id INTEGER NOT NULL,
            amount_paid REAL NOT NULL,
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            payment_mode TEXT NOT NULL,
            transaction_reference TEXT,
            payment_status TEXT NOT NULL DEFAULT 'Success',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id),
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            notification_type TEXT NOT NULL DEFAULT 'System',
            is_read INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT NOT NULL,
            role TEXT NOT NULL,
            action TEXT NOT NULL,
            resource TEXT NOT NULL,
            details TEXT,
            ip_address TEXT NOT NULL DEFAULT '127.0.0.1',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        # Insert Initial Users with hashed password
        pwd_hash = generate_password_hash("Admin@123")
        doc_hash = generate_password_hash("Doctor@123")
        pat_hash = generate_password_hash("Patient@123")
        
        cursor.execute("INSERT INTO users (id, username, email, password_hash, role, full_name, phone) VALUES (1, 'admin', 'admin@meditrack.in', ?, 'ADMIN', 'Dr. Sundaramurthy Iyer (Medical Director)', '+91-98401-22334')", (pwd_hash,))
        cursor.execute("INSERT INTO users (id, username, email, password_hash, role, full_name, phone) VALUES (2, 'dr_kavitha', 'kavitha.cardio@meditrack.in', ?, 'DOCTOR', 'Dr. Kavitha Ramanathan, MD, DM (Cardiology)', '+91-98402-33445')", (doc_hash,))
        cursor.execute("INSERT INTO users (id, username, email, password_hash, role, full_name, phone) VALUES (3, 'dr_aravind', 'aravind.neuro@meditrack.in', ?, 'DOCTOR', 'Dr. Aravind Krishnan, M.Ch (Neuro)', '+91-98403-44556')", (doc_hash,))
        cursor.execute("INSERT INTO users (id, username, email, password_hash, role, full_name, phone) VALUES (4, 'dr_meenakshi', 'meenakshi.obgyn@meditrack.in', ?, 'DOCTOR', 'Dr. Meenakshi Sundaram, MS, DGO', '+91-98404-55667')", (doc_hash,))
        cursor.execute("INSERT INTO users (id, username, email, password_hash, role, full_name, phone) VALUES (5, 'patient_rajesh', 'rajesh.sharma@gmail.com', ?, 'PATIENT', 'Rajesh Kumar Sharma', '+91-94440-11223')", (pat_hash,))

        # Seed Doctors
        doctors_data = [
            (1, 2, 'TNMC-44829', 'Dr. Kavitha Ramanathan', 'Cardiology', 'Senior Consultant Interventional Cardiologist', 'MBBS, MD, DM (Cardiology), FACC', 16, 850.00, '+91-98402-33445', 'kavitha.cardio@meditrack.in', 'OPD Suite 101', 'Mon,Tue,Wed,Thu,Fri,Sat', '09:00 AM - 01:00 PM, 05:00 PM - 08:30 PM', 4.9, 'Expert in complex coronary angioplasty, heart failure management, and preventive cardiac rehabilitation.'),
            (2, 3, 'TNMC-38102', 'Dr. Aravind Krishnan', 'Neurology', 'Chief Neurosurgeon & Spine Specialist', 'MBBS, MS (Surgery), M.Ch (Neuro)', 18, 950.00, '+91-98403-44556', 'aravind.neuro@meditrack.in', 'OPD Suite 104', 'Mon,Tue,Thu,Fri', '10:00 AM - 02:00 PM, 06:00 PM - 08:30 PM', 4.9, 'Pioneer in minimally invasive spine surgery, brain tumour resection, and stroke intervention.'),
            (3, 4, 'TNMC-51928', 'Dr. Meenakshi Sundaram', 'Obstetrics & Gynaecology', 'Senior Consultant Obstetrician & Laparoscopic Surgeon', 'MBBS, MS (OBG), DGO, FICOG', 14, 750.00, '+91-98404-55667', 'meenakshi.obgyn@meditrack.in', 'OPD Suite 202', 'Mon,Wed,Thu,Fri,Sat', '09:30 AM - 01:30 PM, 04:30 PM - 07:30 PM', 4.8, 'High-risk pregnancy care, painless normal deliveries, and advanced gynaecologic laparoscopy.'),
            (4, None, 'TNMC-29401', 'Dr. Suresh Balaji', 'Orthopaedics', 'Senior Joint Replacement Surgeon', 'MBBS, MS (Ortho), DNB (Ortho), MCh', 20, 800.00, '+91-98405-66778', 'suresh.ortho@meditrack.in', 'OPD Suite 108', 'Mon,Tue,Wed,Fri,Sat', '09:00 AM - 01:00 PM', 4.9, 'Over 5,000 robotic knee and hip replacements and sports ligament reconstructions.'),
            (5, None, 'TNMC-60293', 'Dr. Preethi Venkatesh', 'Paediatrics', 'Consultant Paediatrician & Neonatologist', 'MBBS, MD (Paediatrics)', 11, 650.00, '+91-98406-77889', 'preethi.paed@meditrack.in', 'OPD Suite 205', 'Mon,Tue,Wed,Thu,Fri,Sat', '10:00 AM - 01:00 PM, 05:00 PM - 08:00 PM', 4.9, 'Paediatric critical care, child development assessments, and child immunization.'),
            (6, None, 'TNMC-41804', 'Dr. Karthik Narayanan', 'Nephrology & Urology', 'Senior Consultant Nephrologist', 'MBBS, MD (Med), DM (Nephro)', 15, 850.00, '+91-98407-88990', 'karthik.nephro@meditrack.in', 'OPD Suite 112', 'Tue,Thu,Sat', '09:00 AM - 02:00 PM', 4.8, 'Acute & chronic kidney disease, peritoneal dialysis, and live donor renal transplants.'),
            (7, None, 'TNMC-33719', 'Dr. Anandhi Rajasekar', 'Gastroenterology', 'Consultant Medical Gastroenterologist', 'MBBS, MD, DM (Gastro)', 13, 800.00, '+91-98408-99001', 'anandhi.gastro@meditrack.in', 'OPD Suite 115', 'Mon,Wed,Fri', '10:00 AM - 02:00 PM', 4.8, 'Therapeutic endoscopy, ERCP, fatty liver reversal, and IBD clinical management.'),
            (8, None, 'TNMC-55912', 'Dr. Vijay Anand', 'Pulmonology', 'Consultant Pulmonologist & Chest Physician', 'MBBS, DTCD, DNB', 12, 700.00, '+91-98409-00112', 'vijay.pulmo@meditrack.in', 'OPD Suite 118', 'Mon,Tue,Thu,Fri,Sat', '09:00 AM - 01:00 PM', 4.7, 'Bronchial asthma, allergic rhinitis, COPD, sleep apnea, and pulmonary fibrosis.')
        ]
        cursor.executemany("INSERT INTO doctors (id, user_id, doc_reg_no, full_name, department, designation, qualification, experience_years, consultation_fee, phone, email, room_no, available_days, available_time_slots, rating, bio) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", doctors_data)

        # Seed Patients
        patients_data = [
            (1, 5, 'MEDI-2026-0001', 'Rajesh Kumar Sharma', '1982-05-14', 44, 'Male', 'O+', '+91-94440-11223', 'rajesh.sharma@gmail.com', '7891-2345-6789', '42/1, 2nd Main Road, Anna Nagar West', 'Chennai', 'Tamil Nadu', '600040', 'Sunita Sharma (Spouse)', '+91-94440-11224', 'Penicillin, Sulfa drugs', 'Hypertension diagnosed 2021, Type 2 Diabetes Mellitus under Metformin control.'),
            (2, None, 'MEDI-2026-0002', 'Lakshmi Narayanan', '1968-11-23', 57, 'Female', 'B+', '+91-98840-55667', 'lakshmi.n68@yahoo.com', '4521-8932-1049', '18, G.N. Chetty Road, T. Nagar', 'Chennai', 'Tamil Nadu', '600017', 'Narayanan S. (Son)', '+91-98840-55668', 'No known drug allergies', 'Osteoarthritis bilateral knees, Mild Dyslipidemia.'),
            (3, None, 'MEDI-2026-0003', 'Mohamed Farooq', '1990-08-19', 35, 'Male', 'A+', '+91-97900-22331', 'farooq.eng@gmail.com', '6734-9012-3456', '88, Triplicane High Road', 'Chennai', 'Tamil Nadu', '600005', 'Ayesha Farooq (Sister)', '+91-97900-22332', 'NSAIDs (Causes Gastric Ulcers)', 'Acid Peptic Disease, Occasional Migraine.'),
            (4, None, 'MEDI-2026-0004', 'Ananya Deshmukh', '1998-02-10', 28, 'Female', 'AB+', '+91-96001-44552', 'ananya.d@outlook.com', '9012-3456-7890', '12/4, Velachery Bypass Road', 'Chennai', 'Tamil Nadu', '600042', 'Rohan Deshmukh (Husband)', '+91-96001-44553', 'None', 'First Trimester Antenatal Care (Gravida 1, Para 0).'),
            (5, None, 'MEDI-2026-0005', 'Master Harish Venkatesh', '2019-07-04', 7, 'Male', 'O+', '+91-94450-88991', 'venkatesh.k@gmail.com', '3345-6789-0123', '27, South Mada Street, Mylapore', 'Chennai', 'Tamil Nadu', '600004', 'Venkatesh K (Father)', '+91-94450-88991', 'Dust mite allergy', 'Childhood Allergic Bronchitis, Vaccinations up-to-date.'),
            (6, None, 'MEDI-2026-0006', 'Sivakumar Ramasamy', '1959-03-12', 67, 'Male', 'A-', '+91-98410-66778', 'siva.ramasamy@gmail.com', '8812-3490-5511', '55, 100 Feet Road, Vadapalani', 'Chennai', 'Tamil Nadu', '600026', 'Meena Sivakumar (Wife)', '+91-98410-66779', 'Aspirin allergy', 'Post Coronary Angioplasty (2023), Chronic Kidney Disease Stage 2.')
        ]
        cursor.executemany("INSERT INTO patients (id, user_id, uhid, full_name, date_of_birth, age, gender, blood_group, phone, email, aadhar_no, address, city, state, pincode, emergency_contact_name, emergency_contact_phone, allergies, medical_history) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", patients_data)

        # Seed Medicines
        medicines_data = [
            (1, 'Dolo 650 Tablet', 'Paracetamol / Acetaminophen', 'Dolo 650', 'Analgesics', 'Micro Labs Ltd', '650 mg', 'Tablet', 3.50, 1500, 200, 'Antipyretic and analgesic for fever, acute body aches, and post-viral myalgia.'),
            (2, 'Augmentin 625 Duo Tablet', 'Amoxicillin + Potassium Clavulanate', 'Augmentin 625 Duo', 'Antibiotics', 'GlaxoSmithKline Pharmaceuticals', '500mg + 125mg', 'Tablet', 24.50, 650, 80, 'Broad-spectrum beta-lactamase resistant antibiotic for respiratory, ENT, and soft tissue infections.'),
            (3, 'Pan-D Capsule', 'Pantoprazole + Domperidone SR', 'Pan-D', 'Antacids', 'Alkem Laboratories', '40mg + 30mg', 'Capsule', 18.00, 800, 100, 'Proton pump inhibitor with prokinetic agent for GERD, acid reflux, and hyperacidity.'),
            (4, 'Glycomet-GP 2 Tablet', 'Metformin HCl + Glimepiride', 'Glycomet-GP 2', 'Antidiabetics', 'USV Private Limited', '500mg + 2mg', 'Tablet', 12.00, 950, 150, 'Dual action oral hypoglycaemic agent for Type 2 Diabetes Mellitus control.'),
            (5, 'Telma 40 Tablet', 'Telmisartan', 'Telma 40', 'Antihypertensives', 'Glenmark Pharmaceuticals', '40 mg', 'Tablet', 11.50, 1100, 120, 'Angiotensin II receptor blocker (ARB) for essential hypertension and cardiac risk reduction.'),
            (6, 'Aztor 10 Tablet', 'Atorvastatin Calcium', 'Aztor 10', 'Cardiovascular', 'Sun Pharmaceutical Industries', '10 mg', 'Tablet', 14.00, 750, 100, 'HMG-CoA reductase inhibitor (statin) for hypercholesterolemia and plaque stabilization.'),
            (7, 'Montair-LC Tablet', 'Montelukast Sodium + Levocetirizine HCl', 'Montair-LC', 'Antihistamines', 'Cipla Ltd', '10mg + 5mg', 'Tablet', 19.50, 600, 80, 'Leukotriene receptor antagonist with antihistamine for allergic rhinitis and asthma.'),
            (8, 'Azithral 500 Tablet', 'Azithromycin', 'Azithral 500', 'Antibiotics', 'Alembic Pharmaceuticals', '500 mg', 'Tablet', 28.00, 500, 60, 'Macrolide antibiotic for atypical pneumonia, throat infections, and sinusitis.'),
            (9, 'Shelcal 500 Tablet', 'Calcium Carbonate + Vitamin D3', 'Shelcal 500', 'Supplements', 'Torrent Pharmaceuticals', '500mg + 250 IU', 'Tablet', 9.50, 1200, 150, 'Elemental calcium with cholecalciferol for bone mineralization, osteoporosis, and pregnancy.'),
            (10, 'Neurobion Forte Tablet', 'Vitamin B Complex + Vitamin B12', 'Neurobion Forte', 'Vitamins', 'Procter & Gamble Health', 'B1+B2+B3+B5+B6+B12', 'Tablet', 4.00, 1800, 200, 'High-potency vitamin B formulation for peripheral neuropathy and nerve health.'),
            (11, 'Ascoril-LS Syrup', 'Levosalbutamol + Ambroxol + Guaiphenesin', 'Ascoril-LS', 'Respiratory', 'Glenmark Pharmaceuticals', '1mg+30mg+50mg / 5ml', 'Syrup', 115.00, 240, 30, 'Bronchodilator with mucolytic and expectorant for productive wet cough.'),
            (12, 'Deriva-CMS Gel', 'Adapalene + Clindamycin Phosphate', 'Deriva-CMS', 'Dermatology', 'Glenmark Pharmaceuticals', '0.1% + 1.0%', 'Ointment', 320.00, 180, 25, 'Topical retinoid and antibacterial gel for moderate to severe acne vulgaris.'),
            (13, 'Ciplox 500 Tablet', 'Ciprofloxacin', 'Ciplox 500', 'Antibiotics', 'Cipla Ltd', '500 mg', 'Tablet', 8.50, 850, 100, 'Fluoroquinolone antibiotic for urinary tract and gastrointestinal bacterial infections.'),
            (14, 'Combiflam Tablet', 'Ibuprofen + Paracetamol', 'Combiflam', 'Analgesics', 'Sanofi India', '400mg + 325mg', 'Tablet', 5.20, 1400, 180, 'Non-steroidal anti-inflammatory and pain reliever for musculoskeletal sprains and toothaches.'),
            (15, 'Foracort 200 Inhaler', 'Budesonide + Formoterol Fumarate', 'Foracort 200', 'Respiratory', 'Cipla Ltd', '200 mcg + 6 mcg', 'Inhaler', 485.00, 150, 20, 'Maintenance meter-dose inhaler for bronchial asthma and chronic obstructive pulmonary disease.'),
            (16, 'Betadine 10% Solution', 'Povidone Iodine', 'Betadine', 'Dermatology', 'Win-Medicare', '10% w/v', 'Drops', 145.00, 300, 40, 'Topical microbicidal antiseptic for pre-operative skin disinfection and minor wound care.'),
            (17, 'Ciplox Eye/Ear Drops', 'Ciprofloxacin 0.3%', 'Ciplox Drops', 'Ophthalmic', 'Cipla Ltd', '0.3% w/v', 'Drops', 24.00, 450, 50, 'Sterile ophthalmic / otic antibacterial drops for conjunctivitis and external ear canal infection.'),
            (18, 'Inj. Tramadol 100mg', 'Tramadol Hydrochloride', 'Tramazac', 'Emergency', 'Zydus Cadila', '50 mg / ml (2ml)', 'Injection', 45.00, 120, 30, 'Centrally acting synthetic opioid analgesic for moderate to severe acute postoperative pain.'),
            (19, 'Inj. Ondansetron 4mg', 'Ondansetron HCl', 'Emeset 2ml', 'Emergency', 'Cipla Ltd', '2 mg / ml', 'Injection', 28.00, 180, 40, 'Serotonin 5-HT3 receptor antagonist for acute nausea & vomiting.'),
            (20, 'Livogen Adult Tonic', 'Ferrous Fumarate + Folic Acid', 'Livogen Tonic', 'Supplements', 'Merck / P&G', 'Ferrous 150mg + Folic 0.5mg', 'Syrup', 165.00, 200, 30, 'Hematinic tonic for iron deficiency anaemia, pregnancy nutrition, and general debility.')
        ]
        cursor.executemany("INSERT INTO medicines (id, medicine_name, generic_name, brand_name, category, manufacturer, strength, form, unit_price, stock_quantity, reorder_level, description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", medicines_data)

        # Seed Appointments
        appointments_data = [
            (1, 'APT-2026-1001', 1, 1, 'Cardiology', '2026-08-30', '10:00 AM', 'Routine Checkup', 'Completed', 'Routine hypertensive follow-up, occasional mild chest tightness on brisk walking.', 'ECG and Lipid profile reviewed. Advised stress test next visit.'),
            (2, 'APT-2026-1002', 2, 4, 'Orthopaedics', '2026-08-30', '11:00 AM', 'New Consultation', 'Completed', 'Severe right knee pain while climbing stairs, morning stiffness for 20 minutes.', 'X-Ray right knee AP/Lateral requested. Bilateral OA grade 2.'),
            (3, 'APT-2026-1003', 3, 7, 'Gastroenterology', '2026-08-31', '10:30 AM', 'New Consultation', 'Confirmed', 'Epigastric burning sensation after spicy meals, frequent sour belching.', 'Advised Upper GI Endoscopy if symptoms persist despite PPI therapy.'),
            (4, 'APT-2026-1004', 4, 3, 'Obstetrics & Gynaecology', '2026-08-31', '11:30 AM', 'Routine Checkup', 'Confirmed', 'First trimester routine antenatal checkup, mild morning sickness.', 'Prescribed Prenatal multivitamins and Folic acid.'),
            (5, 'APT-2026-1005', 5, 5, 'Paediatrics', '2026-09-01', '05:30 PM', 'New Consultation', 'Confirmed', 'Recurrent dry cough worse at night, mild wheezing post playground activity.', 'Suspected childhood cough-variant asthma.'),
            (6, 'APT-2026-1006', 6, 6, 'Nephrology & Urology', '2026-09-01', '11:00 AM', 'Follow-up', 'Confirmed', 'Routine Serum Creatinine and eGFR monitoring post stent placement.', 'Bring recent fasting blood sugar and renal function test reports.')
        ]
        cursor.executemany("INSERT INTO appointments (id, appointment_no, patient_id, doctor_id, department, appointment_date, appointment_time, appointment_type, status, symptoms, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)", appointments_data)

        # Seed Consultations
        consultations_data = [
            (1, 'CON-2026-5001', 1, 1, 1, '2026-08-30 10:30:00', 'Mild exertional dyspnea, occasional headache in occipital region.', 'S1, S2 heard normal. No murmurs. Bilateral clear air entry. Mild pedal edema absent.', 'Essential Primary Hypertension with Stable Angina risk', 'I10 / I20.9', '138/88', 76, 98.4, 99, 78.5, '1. Continue Telmisartan 40mg once daily in morning.\n2. Add Atorvastatin 10mg at bedtime for plaque stabilization.\n3. Low sodium DASH diet (<3g salt/day).\n4. 30 mins brisk morning walk 5 days/week.\n5. Review with Lipid profile after 4 weeks.', '2026-09-27', 'Patient counselled thoroughly on lifestyle modification and stress reduction.'),
            (2, 'CON-2026-5002', 2, 2, 4, '2026-08-30 11:30:00', 'Bilateral knee joint pain, crepitus on passive flexion, difficulty squatting.', 'Tenderness over medial joint line of right knee. Mild joint effusion, no local warmth.', 'Osteoarthritis of Knee, Bilateral (Grade II Kellgren-Lawrence)', 'M17.0', '130/80', 72, 98.2, 98, 66.0, '1. Tab Paracetamol 650mg SOS for acute pain (Max 2 tabs/day).\n2. Tab Shelcal 500mg once daily after lunch.\n3. Quadriceps strengthening exercises & hamstring stretches.\n4. Avoid cross-legged sitting and deep Indian squatting.\n5. Physiotherapy 5 sessions scheduled.', '2026-09-14', 'Advised weight management and knee support brace during prolonged standing.')
        ]
        cursor.executemany("INSERT INTO consultations (id, consultation_no, appointment_id, patient_id, doctor_id, consultation_date, symptoms, observations, diagnosis, icd_code, bp, pulse, temperature, spo2, weight_kg, treatment_plan, follow_up_date, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", consultations_data)

        # Seed Prescriptions & Prescription Medicines
        cursor.execute("INSERT INTO prescriptions (id, prescription_no, consultation_id, patient_id, doctor_id, prescription_date, diagnosis_summary, advice, follow_up_days) VALUES (1, 'RX-2026-9001', 1, 1, 1, '2026-08-30', 'Essential Primary Hypertension & Hyperlipidemia', 'Take blood pressure medications strictly on time. Avoid added salt, fried foods, and pickles. Measure BP at home twice weekly.', 30)")
        cursor.execute("INSERT INTO prescriptions (id, prescription_no, consultation_id, patient_id, doctor_id, prescription_date, diagnosis_summary, advice, follow_up_days) VALUES (2, 'RX-2026-9002', 2, 2, 4, '2026-08-30', 'Bilateral Osteoarthritis Knee (Grade II)', 'Apply hot water fomentation for 15 minutes twice daily. Regular knee isometric exercises. Do not skip calcium supplements.', 14)")

        rx_meds = [
            (1, 1, 5, 'Telma 40 Tablet', '40 mg', 'Tablet', '1 Tablet', '1-0-0 (Morning)', '30 Days', 'After Breakfast', 30, 'Take early morning with water. Do not skip doses.'),
            (2, 1, 6, 'Aztor 10 Tablet', '10 mg', 'Tablet', '1 Tablet', '0-0-1 (Night)', '30 Days', 'After Dinner', 30, 'Take at bedtime regularly for lipid control.'),
            (3, 1, 3, 'Pan-D Capsule', '40mg + 30mg', 'Capsule', '1 Capsule', '1-0-0 (Morning)', '15 Days', 'Before Food (Empty Stomach)', 15, 'Take 30 minutes before morning breakfast.'),
            (4, 2, 1, 'Dolo 650 Tablet', '650 mg', 'Tablet', '1 Tablet', 'SOS (When Needed)', '5 Days', 'After Food', 10, 'Take only when knee joint pain is severe. Max 2 tablets in 24 hours.'),
            (5, 2, 9, 'Shelcal 500 Tablet', '500mg + 250 IU', 'Tablet', '1 Tablet', '0-1-0 (Afternoon)', '30 Days', 'After Lunch', 30, 'Swallow with full glass of water or milk.')
        ]
        cursor.executemany("INSERT INTO prescription_medicines (id, prescription_id, medicine_id, medicine_name, strength, form, dosage, frequency, duration, timing, quantity, instructions) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", rx_meds)

        # Seed Invoices, Items & Payments
        cursor.execute("INSERT INTO invoices (id, invoice_no, patient_id, doctor_id, consultation_id, invoice_date, due_date, consultation_fee, medicine_charges, lab_charges, additional_charges, subtotal, discount_percent, discount_amount, gst_percent, tax_amount, grand_total, payment_status, payment_mode, notes) VALUES (1, 'INV-2026-7001', 1, 1, 1, '2026-08-30', '2026-08-30', 850.00, 845.00, 650.00, 0.00, 2345.00, 5.00, 117.25, 5.00, 111.39, 2339.14, 'Paid', 'UPI', 'Complete consultation, pharmacy dispense, and routine 12-lead ECG.')")
        cursor.execute("INSERT INTO invoices (id, invoice_no, patient_id, doctor_id, consultation_id, invoice_date, due_date, consultation_fee, medicine_charges, lab_charges, additional_charges, subtotal, discount_percent, discount_amount, gst_percent, tax_amount, grand_total, payment_status, payment_mode, notes) VALUES (2, 'INV-2026-7002', 2, 4, 2, '2026-08-30', '2026-08-30', 800.00, 320.00, 750.00, 100.00, 1970.00, 0.00, 0.00, 5.00, 98.50, 2068.50, 'Paid', 'Credit Card', 'Orthopaedic consultation, digital bilateral knee X-Ray, and knee brace fitting.')")
        cursor.execute("INSERT INTO invoices (id, invoice_no, patient_id, doctor_id, consultation_id, invoice_date, due_date, consultation_fee, medicine_charges, lab_charges, additional_charges, subtotal, discount_percent, discount_amount, gst_percent, tax_amount, grand_total, payment_status, payment_mode, notes) VALUES (3, 'INV-2026-7003', 3, 7, NULL, '2026-08-31', '2026-08-31', 800.00, 0.00, 0.00, 0.00, 800.00, 0.00, 0.00, 5.00, 40.00, 840.00, 'Pending', 'Unpaid', 'Gastroenterology advance OPD booking token.')")

        cursor.execute("INSERT INTO payments (id, payment_no, invoice_id, patient_id, amount_paid, payment_date, payment_mode, transaction_reference, payment_status, notes) VALUES (1, 'PAY-2026-3001', 1, 1, 2339.14, '2026-08-30 11:15:22', 'UPI', 'UPI/RAZORPAY/9444011223@okaxis/8920194829', 'Success', 'Instant payment received via UPI QR Scan (Google Pay).')")
        cursor.execute("INSERT INTO payments (id, payment_no, invoice_id, patient_id, amount_paid, payment_date, payment_mode, transaction_reference, payment_status, notes) VALUES (2, 'PAY-2026-3002', 2, 2, 2068.50, '2026-08-30 12:45:10', 'Credit Card', 'POS/HDFC/TXN-88492049182', 'Success', 'HDFC Visa Platinum Card swiped at OPD Billing Counter 3.')")

        # Seed Notifications & Audit Logs
        cursor.execute("INSERT INTO notifications (id, user_id, title, message, notification_type, is_read) VALUES (1, 1, 'Pharmacy Stock Alert', 'Low stock alert: Inj. Tramadol 100mg has reached 120 units (Reorder threshold: 30).', 'Inventory', 0)")
        cursor.execute("INSERT INTO notifications (id, user_id, title, message, notification_type, is_read) VALUES (2, 2, 'New Patient Appointment', 'Appointment Confirmed: Rajesh Kumar Sharma (UHID: MEDI-2026-0001) for Cardiology OPD at 10:00 AM.', 'Appointment', 1)")
        cursor.execute("INSERT INTO audit_logs (id, user_id, username, role, action, resource, details, ip_address) VALUES (1, 1, 'admin', 'ADMIN', 'SYSTEM_INITIALIZATION', 'DATABASE', 'MediTrack Database schema bootstrap and initial Indian hospital clinical seed data loaded.', '127.0.0.1')")

        conn.commit()
    conn.close()

# Auto-initialize database on startup
init_sqlite_db()

# ---------------------------------------------------------------------------
# Authentication & RBAC Middleware Helpers
# ---------------------------------------------------------------------------

def log_audit(action, resource, details="", user_info=None):
    """Record an action into the system audit log."""
    try:
        db = get_db()
        user_id = user_info.get("id") if user_info else (g.user.get("id") if hasattr(g, "user") and g.user else None)
        username = user_info.get("username") if user_info else (g.user.get("username") if hasattr(g, "user") and g.user else "Anonymous")
        role = user_info.get("role") if user_info else (g.user.get("role") if hasattr(g, "user") and g.user else "PUBLIC")
        ip = request.remote_addr or "127.0.0.1"
        
        db.execute(
            "INSERT INTO audit_logs (user_id, username, role, action, resource, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, username, role, action, resource, str(details), ip)
        )
        db.commit()
    except Exception as e:
        print(f"Audit log error: {e}")

def create_token(user):
    """Generate a JWT token for authenticated user."""
    payload = {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "full_name": user["full_name"],
        "exp": datetime.utcnow() + Config.JWT_ACCESS_TOKEN_EXPIRES
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")

def token_required(f):
    """Decorator ensuring valid JWT token in Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401
        
        try:
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
            g.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Authentication token has expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid authentication token"}), 401
            
        return f(*args, **kwargs)
    return decorated

def role_required(allowed_roles):
    """Decorator restricting route access by user role."""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated_function(*args, **kwargs):
            if g.user.get("role") not in allowed_roles:
                return jsonify({"error": f"Unauthorized. Required role: {', '.join(allowed_roles)}"}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# ---------------------------------------------------------------------------
# Template Routes (HTML Rendering)
# ---------------------------------------------------------------------------

@app.route("/")
def home_page():
    return render_template("home.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/dashboard")
def dashboard_page():
    return render_template("dashboard.html")

@app.route("/patients")
def patients_page():
    return render_template("patients.html")

@app.route("/doctors")
def doctors_page():
    return render_template("doctors.html")

@app.route("/appointments")
def appointments_page():
    return render_template("appointments.html")

@app.route("/consultations")
def consultations_page():
    return render_template("consultations.html")

@app.route("/prescriptions")
def prescriptions_page():
    return render_template("prescriptions.html")

@app.route("/medicines")
def medicines_page():
    return render_template("medicines.html")

@app.route("/invoices")
def invoices_page():
    return render_template("invoices.html")

@app.route("/payments")
def payments_page():
    return render_template("payments.html")

@app.route("/analytics")
def analytics_page():
    return render_template("analytics.html")

@app.route("/reports")
def reports_page():
    return render_template("reports.html")

# ---------------------------------------------------------------------------
# Authentication REST APIs
# ---------------------------------------------------------------------------

@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
        
    db = get_db()
    cursor = db.execute("SELECT * FROM users WHERE username = ? OR email = ?", (username, username))
    user = cursor.fetchone()
    
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid username or password"}), 401
        
    user_dict = dict(user)
    token = create_token(user_dict)
    
    # If patient, find patient profile id
    patient_id = None
    if user_dict["role"] == "PATIENT":
        p_row = db.execute("SELECT id, uhid FROM patients WHERE user_id = ? OR email = ?", (user_dict["id"], user_dict["email"])).fetchone()
        if p_row:
            patient_id = p_row["id"]
            user_dict["uhid"] = p_row["uhid"]
            user_dict["patient_id"] = patient_id
            
    # If doctor, find doctor profile id
    doctor_id = None
    if user_dict["role"] == "DOCTOR":
        d_row = db.execute("SELECT id, department FROM doctors WHERE user_id = ? OR email = ?", (user_dict["id"], user_dict["email"])).fetchone()
        if d_row:
            doctor_id = d_row["id"]
            user_dict["doctor_id"] = doctor_id
            user_dict["department"] = d_row["department"]
            
    log_audit("USER_LOGIN", "AUTH", f"User {user_dict['username']} logged in successfully with role {user_dict['role']}", user_dict)
    
    # Remove password hash from response
    user_dict.pop("password_hash", None)
    
    return jsonify({
        "success": True,
        "token": token,
        "user": user_dict
    })

@app.route("/api/auth/register", methods=["POST"])
def api_register_patient():
    data = request.get_json() or {}
    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    password = data.get("password", "Patient@123")
    dob = data.get("date_of_birth", "1995-01-01")
    gender = data.get("gender", "Male")
    blood_group = data.get("blood_group", "O+")
    address = data.get("address", "Chennai, Tamil Nadu")
    emergency_contact = data.get("emergency_contact_name", "Family")
    emergency_phone = data.get("emergency_contact_phone", phone)
    
    if not full_name or not phone:
        return jsonify({"error": "Full Name and Phone Number are required"}), 400
        
    db = get_db()
    # Check if username/email exists
    username = phone.replace("+91", "").replace("-", "").strip()
    if email:
        exist = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if exist:
            return jsonify({"error": "An account with this email already exists"}), 400

    pwd_hash = generate_password_hash(password)
    
    # Create user
    cursor = db.execute(
        "INSERT INTO users (username, email, password_hash, role, full_name, phone) VALUES (?, ?, ?, 'PATIENT', ?, ?)",
        (f"pat_{username}", email or f"pat_{username}@meditrack.local", pwd_hash, full_name, phone)
    )
    user_id = cursor.lastrowid
    
    # Generate UHID
    uhid = f"MEDI-2026-{1000 + user_id}"
    
    # Calculate age
    try:
        birth_year = int(dob.split("-")[0])
        age = max(1, 2026 - birth_year)
    except Exception:
        age = 30
        
    db.execute(
        """INSERT INTO patients 
           (user_id, uhid, full_name, date_of_birth, age, gender, blood_group, phone, email, address, emergency_contact_name, emergency_contact_phone)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (user_id, uhid, full_name, dob, age, gender, blood_group, phone, email, address, emergency_contact, emergency_phone)
    )
    patient_id = cursor.lastrowid
    db.commit()
    
    log_audit("PATIENT_REGISTRATION", "PATIENT", f"New patient registered: {full_name} (UHID: {uhid})")
    
    return jsonify({
        "success": True,
        "message": "Patient registered successfully",
        "uhid": uhid,
        "patient_id": patient_id
    }), 201

# ---------------------------------------------------------------------------
# Patient REST APIs (CRUD)
# ---------------------------------------------------------------------------

@app.route("/api/patients", methods=["GET"])
def api_get_patients():
    search = request.args.get("search", "").strip()
    db = get_db()
    if search:
        query = """SELECT * FROM patients WHERE full_name LIKE ? OR uhid LIKE ? OR phone LIKE ? ORDER BY id DESC"""
        params = (f"%{search}%", f"%{search}%", f"%{search}%")
    else:
        query = "SELECT * FROM patients ORDER BY id DESC"
        params = ()
    rows = db.execute(query, params).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/patients/<int:patient_id>", methods=["GET"])
def api_get_patient(patient_id):
    db = get_db()
    row = db.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    if not row:
        return jsonify({"error": "Patient not found"}), 404
    return jsonify(dict(row))

@app.route("/api/patients", methods=["POST"])
def api_create_patient():
    data = request.get_json() or {}
    db = get_db()
    
    # Calculate age
    dob = data.get("date_of_birth", "1990-01-01")
    try:
        age = max(1, 2026 - int(dob.split("-")[0]))
    except Exception:
        age = int(data.get("age", 30))
        
    count_row = db.execute("SELECT COUNT(*) as cnt FROM patients").fetchone()
    uhid = f"MEDI-2026-{str(count_row['cnt'] + 1).zfill(4)}"
    
    cursor = db.execute("""
        INSERT INTO patients (
            uhid, full_name, date_of_birth, age, gender, blood_group, phone, email,
            aadhar_no, address, city, state, pincode, emergency_contact_name, emergency_contact_phone,
            allergies, medical_history
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        uhid, data.get("full_name"), dob, age, data.get("gender", "Male"),
        data.get("blood_group", "O+"), data.get("phone"), data.get("email"),
        data.get("aadhar_no"), data.get("address", "Chennai"), data.get("city", "Chennai"),
        data.get("state", "Tamil Nadu"), data.get("pincode", "600026"),
        data.get("emergency_contact_name", "Family"), data.get("emergency_contact_phone", data.get("phone")),
        data.get("allergies", ""), data.get("medical_history", "")
    ))
    db.commit()
    patient_id = cursor.lastrowid
    
    log_audit("CREATE_PATIENT", "PATIENT", f"Created patient profile {data.get('full_name')} with UHID {uhid}")
    return jsonify({"success": True, "id": patient_id, "uhid": uhid, "message": "Patient created successfully"}), 201

@app.route("/api/patients/<int:patient_id>", methods=["PUT"])
def api_update_patient(patient_id):
    data = request.get_json() or {}
    db = get_db()
    db.execute("""
        UPDATE patients SET
            full_name = ?, date_of_birth = ?, age = ?, gender = ?, blood_group = ?,
            phone = ?, email = ?, aadhar_no = ?, address = ?, city = ?, state = ?,
            pincode = ?, emergency_contact_name = ?, emergency_contact_phone = ?,
            allergies = ?, medical_history = ?
        WHERE id = ?
    """, (
        data.get("full_name"), data.get("date_of_birth"), data.get("age"), data.get("gender"),
        data.get("blood_group"), data.get("phone"), data.get("email"), data.get("aadhar_no"),
        data.get("address"), data.get("city"), data.get("state"), data.get("pincode"),
        data.get("emergency_contact_name"), data.get("emergency_contact_phone"),
        data.get("allergies"), data.get("medical_history"), patient_id
    ))
    db.commit()
    log_audit("UPDATE_PATIENT", "PATIENT", f"Updated patient record ID {patient_id}")
    return jsonify({"success": True, "message": "Patient updated successfully"})

@app.route("/api/patients/<int:patient_id>", methods=["DELETE"])
def api_delete_patient(patient_id):
    db = get_db()
    db.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    db.commit()
    log_audit("DELETE_PATIENT", "PATIENT", f"Deleted patient ID {patient_id}")
    return jsonify({"success": True, "message": "Patient deleted successfully"})

# ---------------------------------------------------------------------------
# Doctors REST APIs
# ---------------------------------------------------------------------------

@app.route("/api/doctors", methods=["GET"])
def api_get_doctors():
    department = request.args.get("department", "").strip()
    db = get_db()
    if department:
        rows = db.execute("SELECT * FROM doctors WHERE department = ? ORDER BY id ASC", (department,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM doctors ORDER BY id ASC").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/doctors/<int:doctor_id>", methods=["GET"])
def api_get_doctor(doctor_id):
    db = get_db()
    row = db.execute("SELECT * FROM doctors WHERE id = ?", (doctor_id,)).fetchone()
    if not row:
        return jsonify({"error": "Doctor not found"}), 404
    return jsonify(dict(row))

# ---------------------------------------------------------------------------
# Appointments REST APIs & Double Booking Prevention
# ---------------------------------------------------------------------------

@app.route("/api/appointments/check-availability", methods=["GET"])
def api_check_slot():
    doctor_id = request.args.get("doctor_id")
    date_val = request.args.get("date")
    time_val = request.args.get("time")
    
    if not doctor_id or not date_val or not time_val:
        return jsonify({"available": True})
        
    db = get_db()
    row = db.execute(
        "SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'Cancelled'",
        (doctor_id, date_val, time_val)
    ).fetchone()
    
    return jsonify({"available": row is None})

@app.route("/api/appointments", methods=["GET"])
def api_get_appointments():
    db = get_db()
    patient_id = request.args.get("patient_id")
    doctor_id = request.args.get("doctor_id")
    status = request.args.get("status")
    
    query = """
        SELECT a.*, p.full_name as patient_name, p.uhid as patient_uhid, p.phone as patient_phone,
               d.full_name as doctor_name, d.department, d.consultation_fee, d.room_no
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE 1=1
    """
    params = []
    if patient_id:
        query += " AND a.patient_id = ?"
        params.append(patient_id)
    if doctor_id:
        query += " AND a.doctor_id = ?"
        params.append(doctor_id)
    if status:
        query += " AND a.status = ?"
        params.append(status)
        
    query += " ORDER BY a.appointment_date DESC, a.appointment_time ASC"
    rows = db.execute(query, params).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/appointments", methods=["POST"])
def api_create_appointment():
    data = request.get_json() or {}
    patient_id = data.get("patient_id")
    doctor_id = data.get("doctor_id")
    appt_date = data.get("appointment_date")
    appt_time = data.get("appointment_time")
    
    if not patient_id or not doctor_id or not appt_date or not appt_time:
        return jsonify({"error": "Patient, Doctor, Date, and Time are required"}), 400
        
    db = get_db()
    
    # 1. Check double booking
    conflict = db.execute(
        "SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'Cancelled'",
        (doctor_id, appt_date, appt_time)
    ).fetchone()
    
    if conflict:
        return jsonify({
            "error": "Double Booking Prevented! The selected doctor already has a confirmed appointment at this specific date and time slot. Please select another slot."
        }), 409
        
    # Generate appointment number
    count_row = db.execute("SELECT COUNT(*) as cnt FROM appointments").fetchone()
    appt_no = f"APT-2026-{1000 + count_row['cnt'] + 1}"
    
    # Doctor info
    doc = db.execute("SELECT department, consultation_fee FROM doctors WHERE id = ?", (doctor_id,)).fetchone()
    department = doc["department"] if doc else data.get("department", "General")
    
    cursor = db.execute("""
        INSERT INTO appointments (
            appointment_no, patient_id, doctor_id, department, appointment_date,
            appointment_time, appointment_type, status, symptoms, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, ?)
    """, (
        appt_no, patient_id, doctor_id, department, appt_date,
        appt_time, data.get("appointment_type", "New Consultation"),
        data.get("symptoms", ""), data.get("notes", "")
    ))
    appt_id = cursor.lastrowid
    
    # Also create notification for doctor/patient
    db.execute(
        "INSERT INTO notifications (title, message, notification_type) VALUES (?, ?, 'Appointment')",
        (f"New Appointment {appt_no}", f"Appointment booked for {appt_date} at {appt_time}.")
    )
    db.commit()
    
    log_audit("BOOK_APPOINTMENT", "APPOINTMENTS", f"Booked appointment {appt_no} with Doctor ID {doctor_id} for Patient ID {patient_id}")
    return jsonify({
        "success": True,
        "id": appt_id,
        "appointment_no": appt_no,
        "message": "Appointment scheduled successfully!"
    }), 201

@app.route("/api/appointments/<int:appt_id>/status", methods=["PUT"])
def api_update_appointment_status(appt_id):
    data = request.get_json() or {}
    new_status = data.get("status", "Confirmed")
    db = get_db()
    db.execute("UPDATE appointments SET status = ? WHERE id = ?", (new_status, appt_id))
    db.commit()
    log_audit("UPDATE_APPOINTMENT_STATUS", "APPOINTMENTS", f"Updated appointment ID {appt_id} status to {new_status}")
    return jsonify({"success": True, "message": f"Appointment status updated to {new_status}"})

# ---------------------------------------------------------------------------
# Consultations REST APIs
# ---------------------------------------------------------------------------

@app.route("/api/consultations", methods=["GET"])
def api_get_consultations():
    db = get_db()
    patient_id = request.args.get("patient_id")
    query = """
        SELECT c.*, p.full_name as patient_name, p.uhid as patient_uhid, p.gender, p.age,
               d.full_name as doctor_name, d.department, d.qualification
        FROM consultations c
        JOIN patients p ON c.patient_id = p.id
        JOIN doctors d ON c.doctor_id = d.id
    """
    params = []
    if patient_id:
        query += " WHERE c.patient_id = ?"
        params.append(patient_id)
        
    query += " ORDER BY c.id DESC"
    rows = db.execute(query, params).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/consultations", methods=["POST"])
def api_create_consultation():
    data = request.get_json() or {}
    patient_id = data.get("patient_id")
    doctor_id = data.get("doctor_id")
    
    if not patient_id or not doctor_id:
        return jsonify({"error": "Patient and Doctor are required"}), 400
        
    db = get_db()
    count_row = db.execute("SELECT COUNT(*) as cnt FROM consultations").fetchone()
    con_no = f"CON-2026-{5000 + count_row['cnt'] + 1}"
    
    cursor = db.execute("""
        INSERT INTO consultations (
            consultation_no, appointment_id, patient_id, doctor_id, symptoms,
            observations, diagnosis, icd_code, bp, pulse, temperature, spo2,
            weight_kg, treatment_plan, follow_up_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        con_no, data.get("appointment_id"), patient_id, doctor_id,
        data.get("symptoms", ""), data.get("observations", ""),
        data.get("diagnosis", ""), data.get("icd_code", ""),
        data.get("bp", ""), data.get("pulse"), data.get("temperature"),
        data.get("spo2"), data.get("weight_kg"), data.get("treatment_plan", ""),
        data.get("follow_up_date"), data.get("notes", "")
    ))
    con_id = cursor.lastrowid
    
    # If linked to appointment, mark appointment completed
    if data.get("appointment_id"):
        db.execute("UPDATE appointments SET status = 'Completed' WHERE id = ?", (data.get("appointment_id"),))
        
    db.commit()
    log_audit("CREATE_CONSULTATION", "CONSULTATIONS", f"Logged consultation {con_no} for Patient ID {patient_id}")
    return jsonify({"success": True, "id": con_id, "consultation_no": con_no}), 201

# ---------------------------------------------------------------------------
# Medicine Dynamic Search & Management REST APIs
# ---------------------------------------------------------------------------

@app.route("/api/medicines", methods=["GET"])
def api_get_medicines():
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    db = get_db()
    
    query = "SELECT * FROM medicines WHERE 1=1"
    params = []
    
    if search:
        query += " AND (medicine_name LIKE ? OR generic_name LIKE ? OR brand_name LIKE ? OR category LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])
        
    if category:
        query += " AND category = ?"
        params.append(category)
        
    query += " ORDER BY medicine_name ASC"
    rows = db.execute(query, params).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/medicines", methods=["POST"])
def api_create_medicine():
    data = request.get_json() or {}
    db = get_db()
    cursor = db.execute("""
        INSERT INTO medicines (
            medicine_name, generic_name, brand_name, category, manufacturer,
            strength, form, unit_price, stock_quantity, reorder_level, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("medicine_name"), data.get("generic_name"), data.get("brand_name"),
        data.get("category", "Analgesics"), data.get("manufacturer", "Indian Pharma Ltd"),
        data.get("strength", "500 mg"), data.get("form", "Tablet"),
        float(data.get("unit_price", 10.0)), int(data.get("stock_quantity", 100)),
        int(data.get("reorder_level", 20)), data.get("description", "")
    ))
    db.commit()
    med_id = cursor.lastrowid
    log_audit("ADD_MEDICINE", "INVENTORY", f"Added medicine {data.get('medicine_name')} to catalog")
    return jsonify({"success": True, "id": med_id, "message": "Medicine added successfully"}), 201

# ---------------------------------------------------------------------------
# Digital Prescriptions REST APIs
# ---------------------------------------------------------------------------

@app.route("/api/prescriptions", methods=["GET"])
def api_get_prescriptions():
    db = get_db()
    patient_id = request.args.get("patient_id")
    doctor_id = request.args.get("doctor_id")
    
    query = """
        SELECT rx.*, p.full_name as patient_name, p.uhid as patient_uhid, p.age, p.gender, p.blood_group,
               d.full_name as doctor_name, d.department, d.doc_reg_no, d.qualification
        FROM prescriptions rx
        JOIN patients p ON rx.patient_id = p.id
        JOIN doctors d ON rx.doctor_id = d.id
        WHERE 1=1
    """
    params = []
    if patient_id:
        query += " AND rx.patient_id = ?"
        params.append(patient_id)
    if doctor_id:
        query += " AND rx.doctor_id = ?"
        params.append(doctor_id)
        
    query += " ORDER BY rx.id DESC"
    rows = db.execute(query, params).fetchall()
    
    results = []
    for r in rows:
        rx_dict = dict(r)
        # Fetch items
        items = db.execute("SELECT * FROM prescription_medicines WHERE prescription_id = ?", (r["id"],)).fetchall()
        rx_dict["medicines"] = [dict(it) for it in items]
        results.append(rx_dict)
        
    return jsonify(results)

@app.route("/api/prescriptions", methods=["POST"])
def api_create_prescription():
    data = request.get_json() or {}
    patient_id = data.get("patient_id")
    doctor_id = data.get("doctor_id")
    medicines = data.get("medicines", [])
    
    if not patient_id or not doctor_id or not medicines:
        return jsonify({"error": "Patient, Doctor, and at least one medicine are required"}), 400
        
    db = get_db()
    count_row = db.execute("SELECT COUNT(*) as cnt FROM prescriptions").fetchone()
    rx_no = f"RX-2026-{9000 + count_row['cnt'] + 1}"
    today = date.today().strftime("%Y-%m-%d")
    
    cursor = db.execute("""
        INSERT INTO prescriptions (
            prescription_no, consultation_id, patient_id, doctor_id, prescription_date,
            diagnosis_summary, advice, follow_up_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rx_no, data.get("consultation_id"), patient_id, doctor_id, today,
        data.get("diagnosis_summary", "Clinical Consultation"),
        data.get("advice", "Take medications as prescribed"),
        int(data.get("follow_up_days", 7))
    ))
    rx_id = cursor.lastrowid
    
    for med in medicines:
        db.execute("""
            INSERT INTO prescription_medicines (
                prescription_id, medicine_id, medicine_name, strength, form,
                dosage, frequency, duration, timing, quantity, instructions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rx_id, med.get("medicine_id", 1), med.get("medicine_name"),
            med.get("strength", "-"), med.get("form", "Tablet"),
            med.get("dosage", "1 Tablet"), med.get("frequency", "1-0-1"),
            med.get("duration", "5 Days"), med.get("timing", "After Food"),
            int(med.get("quantity", 10)), med.get("instructions", "")
        ))
        
        # Deduct stock if valid
        if med.get("medicine_id"):
            db.execute("UPDATE medicines SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?", (int(med.get("quantity", 10)), med.get("medicine_id")))
            
    db.commit()
    log_audit("CREATE_PRESCRIPTION", "PRESCRIPTIONS", f"Issued prescription {rx_no} with {len(medicines)} medicines for Patient ID {patient_id}")
    return jsonify({"success": True, "id": rx_id, "prescription_no": rx_no, "message": "Digital Prescription generated successfully!"}), 201

# ---------------------------------------------------------------------------
# Invoices & Billing REST APIs
# ---------------------------------------------------------------------------

@app.route("/api/invoices", methods=["GET"])
def api_get_invoices():
    db = get_db()
    patient_id = request.args.get("patient_id")
    query = """
        SELECT i.*, p.full_name as patient_name, p.uhid as patient_uhid, p.phone as patient_phone,
               d.full_name as doctor_name, d.department
        FROM invoices i
        JOIN patients p ON i.patient_id = p.id
        LEFT JOIN doctors d ON i.doctor_id = d.id
        WHERE 1=1
    """
    params = []
    if patient_id:
        query += " AND i.patient_id = ?"
        params.append(patient_id)
        
    query += " ORDER BY i.id DESC"
    rows = db.execute(query, params).fetchall()
    
    invoices = []
    for r in rows:
        inv_dict = dict(r)
        items = db.execute("SELECT * FROM invoice_items WHERE invoice_id = ?", (r["id"],)).fetchall()
        inv_dict["items"] = [dict(it) for it in items]
        invoices.append(inv_dict)
        
    return jsonify(invoices)

@app.route("/api/invoices", methods=["POST"])
def api_create_invoice():
    data = request.get_json() or {}
    patient_id = data.get("patient_id")
    if not patient_id:
        return jsonify({"error": "Patient is required for billing"}), 400
        
    db = get_db()
    count_row = db.execute("SELECT COUNT(*) as cnt FROM invoices").fetchone()
    inv_no = f"INV-2026-{7000 + count_row['cnt'] + 1}"
    today = date.today().strftime("%Y-%m-%d")
    
    # Calculate amounts
    con_fee = float(data.get("consultation_fee", 0))
    med_fee = float(data.get("medicine_charges", 0))
    lab_fee = float(data.get("lab_charges", 0))
    add_fee = float(data.get("additional_charges", 0))
    
    subtotal = con_fee + med_fee + lab_fee + add_fee
    discount_pct = float(data.get("discount_percent", 0))
    discount_amt = round((subtotal * discount_pct) / 100.0, 2)
    after_discount = subtotal - discount_amt
    gst_pct = float(data.get("gst_percent", 5.0))
    tax_amt = round((after_discount * gst_pct) / 100.0, 2)
    grand_total = round(after_discount + tax_amt, 2)
    
    cursor = db.execute("""
        INSERT INTO invoices (
            invoice_no, patient_id, doctor_id, consultation_id, invoice_date, due_date,
            consultation_fee, medicine_charges, lab_charges, additional_charges,
            subtotal, discount_percent, discount_amount, gst_percent, tax_amount,
            grand_total, payment_status, payment_mode, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        inv_no, patient_id, data.get("doctor_id"), data.get("consultation_id"),
        today, data.get("due_date", today), con_fee, med_fee, lab_fee, add_fee,
        subtotal, discount_pct, discount_amt, gst_pct, tax_amt, grand_total,
        data.get("payment_status", "Pending"), data.get("payment_mode", "Unpaid"),
        data.get("notes", "")
    ))
    inv_id = cursor.lastrowid
    
    # Add items if provided
    items = data.get("items", [])
    if items:
        for it in items:
            db.execute("""
                INSERT INTO invoice_items (invoice_id, item_type, item_description, quantity, unit_price, total_amount)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (inv_id, it.get("item_type", "Procedure"), it.get("item_description", "Hospital Service"), it.get("quantity", 1), it.get("unit_price", 0), it.get("total_amount", 0)))
            
    db.commit()
    log_audit("GENERATE_INVOICE", "BILLING", f"Generated invoice {inv_no} of grand total ₹{grand_total} for Patient ID {patient_id}")
    return jsonify({"success": True, "id": inv_id, "invoice_no": inv_no, "grand_total": grand_total}), 201

# ---------------------------------------------------------------------------
# Payments REST APIs
# ---------------------------------------------------------------------------

@app.route("/api/payments", methods=["GET"])
def api_get_payments():
    db = get_db()
    rows = db.execute("""
        SELECT py.*, i.invoice_no, i.grand_total, p.full_name as patient_name, p.uhid as patient_uhid
        FROM payments py
        JOIN invoices i ON py.invoice_id = i.id
        JOIN patients p ON py.patient_id = p.id
        ORDER BY py.id DESC
    """).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/payments", methods=["POST"])
def api_create_payment():
    data = request.get_json() or {}
    invoice_id = data.get("invoice_id")
    amount = float(data.get("amount_paid", 0))
    mode = data.get("payment_mode", "UPI")
    
    if not invoice_id or amount <= 0:
        return jsonify({"error": "Valid Invoice and amount are required"}), 400
        
    db = get_db()
    inv = db.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,)).fetchone()
    if not inv:
        return jsonify({"error": "Invoice not found"}), 404
        
    count_row = db.execute("SELECT COUNT(*) as cnt FROM payments").fetchone()
    pay_no = f"PAY-2026-{3000 + count_row['cnt'] + 1}"
    ref = data.get("transaction_reference") or f"TXN/UPI/{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    cursor = db.execute("""
        INSERT INTO payments (
            payment_no, invoice_id, patient_id, amount_paid, payment_mode,
            transaction_reference, payment_status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, 'Success', ?)
    """, (
        pay_no, invoice_id, inv["patient_id"], amount, mode, ref, data.get("notes", "")
    ))
    pay_id = cursor.lastrowid
    
    # Update invoice payment status
    db.execute("UPDATE invoices SET payment_status = 'Paid', payment_mode = ? WHERE id = ?", (mode, invoice_id))
    db.commit()
    
    log_audit("PROCESS_PAYMENT", "PAYMENTS", f"Processed payment {pay_no} of ₹{amount} via {mode} for Invoice {inv['invoice_no']}")
    return jsonify({"success": True, "id": pay_id, "payment_no": pay_no, "reference": ref, "message": "Payment recorded successfully!"}), 201

# ---------------------------------------------------------------------------
# Analytics & Reporting REST APIs
# ---------------------------------------------------------------------------

@app.route("/api/analytics", methods=["GET"])
def api_get_analytics():
    db = get_db()
    
    # Counts
    total_patients = db.execute("SELECT COUNT(*) as cnt FROM patients").fetchone()["cnt"]
    total_doctors = db.execute("SELECT COUNT(*) as cnt FROM doctors").fetchone()["cnt"]
    total_appointments = db.execute("SELECT COUNT(*) as cnt FROM appointments").fetchone()["cnt"]
    total_consultations = db.execute("SELECT COUNT(*) as cnt FROM consultations").fetchone()["cnt"]
    
    # Revenue
    rev_row = db.execute("SELECT SUM(amount_paid) as total_rev FROM payments WHERE payment_status = 'Success'").fetchone()
    total_revenue = rev_row["total_rev"] if rev_row["total_rev"] else 0.0
    
    # Gender Distribution
    gender_rows = db.execute("SELECT gender, COUNT(*) as count FROM patients GROUP BY gender").fetchall()
    gender_distribution = {r["gender"]: r["count"] for r in gender_rows}
    
    # Department workload
    dept_rows = db.execute("SELECT department, COUNT(*) as count FROM appointments GROUP BY department ORDER BY count DESC LIMIT 8").fetchall()
    dept_distribution = {r["department"]: r["count"] for r in dept_rows}
    
    # Payment modes
    pay_rows = db.execute("SELECT payment_mode, COUNT(*) as count, SUM(amount_paid) as sum_amt FROM payments GROUP BY payment_mode").fetchall()
    payment_breakdown = [dict(r) for r in pay_rows]
    
    # Medicine Categories
    med_rows = db.execute("SELECT category, COUNT(*) as count, SUM(stock_quantity) as total_stock FROM medicines GROUP BY category LIMIT 10").fetchall()
    med_distribution = [dict(r) for r in med_rows]
    
    return jsonify({
        "summary": {
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "total_appointments": total_appointments,
            "total_consultations": total_consultations,
            "total_revenue": total_revenue
        },
        "gender_distribution": gender_distribution,
        "department_workload": dept_distribution,
        "payment_breakdown": payment_breakdown,
        "medicine_categories": med_distribution,
        "monthly_trends": {
            "labels": ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
            "patients": [120, 145, 180, 210, 260, 290],
            "revenue_inr": [340000, 410000, 520000, 680000, 840000, 920000]
        }
    })

@app.route("/api/audit-logs", methods=["GET"])
def api_get_audit_logs():
    db = get_db()
    rows = db.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/notifications", methods=["GET"])
def api_get_notifications():
    db = get_db()
    rows = db.execute("SELECT * FROM notifications ORDER BY id DESC LIMIT 20").fetchall()
    return jsonify([dict(r) for r in rows])

# ---------------------------------------------------------------------------
# Application Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
