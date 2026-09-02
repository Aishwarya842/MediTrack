-- =============================================
-- MEDI TRACK - Complete Database Setup with RBAC
-- =============================================

-- Step 1: Create Database
CREATE DATABASE IF NOT EXISTS meditrack_db;
USE meditrack_db;

-- =============================================
-- Step 2: Create All Tables
-- =============================================

-- Users table (with role-based access)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'patient',
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Patients table (linked to users)
CREATE TABLE IF NOT EXISTS patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(20),
    emergency_phone VARCHAR(20),
    medical_history TEXT,
    allergies TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_name (first_name, last_name)
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(200),
    experience INT DEFAULT 0,
    availability VARCHAR(20) DEFAULT 'available',
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    about TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_specialization (specialization)
);

-- Receptionists table
CREATE TABLE IF NOT EXISTS receptionists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    employee_id VARCHAR(20) UNIQUE,
    shift VARCHAR(20) DEFAULT 'morning',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_employee (employee_id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    receptionist_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled',
    reason TEXT,
    type VARCHAR(20) DEFAULT 'in-person',
    notes TEXT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (receptionist_id) REFERENCES receptionists(id) ON DELETE SET NULL,
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
);

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    consultation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    symptoms TEXT,
    observations TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    follow_up_date DATE,
    status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id)
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    medicine_name VARCHAR(100) NOT NULL,
    generic_name VARCHAR(100),
    brand_name VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(100),
    strength VARCHAR(50),
    form VARCHAR(30) NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (medicine_name),
    INDEX idx_generic (generic_name),
    INDEX idx_category (category)
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_number VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    consultation_id INT,
    prescription_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL,
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_number (prescription_number)
);

-- Prescription Medicines table
CREATE TABLE IF NOT EXISTS prescription_medicines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id INT NOT NULL,
    medicine_id INT NOT NULL,
    strength VARCHAR(50),
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    instructions TEXT,
    quantity INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    INDEX idx_prescription (prescription_id),
    INDEX idx_medicine (medicine_id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    consultation_id INT,
    appointment_id INT,
    invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    medicine_charges DECIMAL(10,2) DEFAULT 0,
    laboratory_charges DECIMAL(10,2) DEFAULT 0,
    additional_charges DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    grand_total DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    INDEX idx_patient (patient_id),
    INDEX idx_number (invoice_number),
    INDEX idx_status (payment_status)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    patient_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(30) NOT NULL,
    transaction_id VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'completed',
    receipt_number VARCHAR(20) UNIQUE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_invoice (invoice_id),
    INDEX idx_patient (patient_id),
    INDEX idx_transaction (transaction_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30),
    reference_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id)
);

-- =============================================
-- Step 3: Insert Sample Data with All Roles
-- =============================================
INSERT IGNORE INTO users (email, password_hash, role, full_name, phone) VALUES 
('admin@meditrack.com', '$2b$12$r8xS5lNXuR9kGc5M5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5', 'admin', 'System Administrator', '9876543200'),
('dr.john@meditrack.com', '$2b$12$r8xS5lNXuR9kGc5M5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5', 'doctor', 'Dr. John Smith', '9876543201'),
('dr.sarah@meditrack.com', '$2b$12$r8xS5lNXuR9kGc5M5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5', 'doctor', 'Dr. Sarah Johnson', '9876543202'),
('dr.michael@meditrack.com', '$2b$12$r8xS5lNXuR9kGc5M5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5', 'doctor', 'Dr. Michael Brown', '9876543203'),
('dr.emily@meditrack.com', '$2b$12$r8xS5lNXuR9kGc5M5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5', 'doctor', 'Dr. Emily Davis', '9876543204'),
('reception@meditrack.com', '$2b$12$r8xS5lNXuR9kGc5M5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5', 'receptionist', 'Priya Reception', '9876543205'),
('raj.kumar@email.com', '$2b$12$r8xS5lNXuR9kGc5M5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5', 'patient', 'Raj Kumar', '9876543210'),
('priya.sharma@email.com', '$2b$12$r8xS5lNXuR9kGc5M5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5', 'patient', 'Priya Sharma', '9876543211'),
('amit.patel@email.com', '$2b$12$r8xS5lNXuR9kGc5M5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5R5OqO5', 'patient', 'Amit Patel', '9876543212');

INSERT IGNORE INTO doctors (user_id, first_name, last_name, email, phone, specialization, qualification, experience, consultation_fee) VALUES
((SELECT id FROM users WHERE email = 'dr.john@meditrack.com'), 'John', 'Smith', 'dr.john@meditrack.com', '9876543201', 'Cardiology', 'MD, FACC', 15, 200.00),
((SELECT id FROM users WHERE email = 'dr.sarah@meditrack.com'), 'Sarah', 'Johnson', 'dr.sarah@meditrack.com', '9876543202', 'Neurology', 'MD, PhD', 12, 180.00),
((SELECT id FROM users WHERE email = 'dr.michael@meditrack.com'), 'Michael', 'Brown', 'dr.michael@meditrack.com', '9876543203', 'Pediatrics', 'MD', 8, 150.00),
((SELECT id FROM users WHERE email = 'dr.emily@meditrack.com'), 'Emily', 'Davis', 'dr.emily@meditrack.com', '9876543204', 'Dermatology', 'MD, FAAD', 10, 160.00);

INSERT IGNORE INTO receptionists (user_id, first_name, last_name, email, phone, employee_id, shift) VALUES
((SELECT id FROM users WHERE email = 'reception@meditrack.com'), 'Priya', 'Reception', 'reception@meditrack.com', '9876543205', 'EMP001', 'morning');

INSERT IGNORE INTO patients (user_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group) VALUES
((SELECT id FROM users WHERE email = 'raj.kumar@email.com'), 'Raj', 'Kumar', 'raj.kumar@email.com', '9876543210', '1985-05-15', 'Male', 'A+'),
((SELECT id FROM users WHERE email = 'priya.sharma@email.com'), 'Priya', 'Sharma', 'priya.sharma@email.com', '9876543211', '1990-08-20', 'Female', 'B+'),
((SELECT id FROM users WHERE email = 'amit.patel@email.com'), 'Amit', 'Patel', 'amit.patel@email.com', '9876543212', '1978-12-10', 'Male', 'O+');
