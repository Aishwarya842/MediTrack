-- ==========================================================
-- MEDI TRACK – Integrated Patient Care Management System
-- Database: meditrack_db
-- Standard: MySQL 8.0+ / MariaDB 10.4+
-- Location Context: Chennai, Tamil Nadu, India
-- ==========================================================

DROP DATABASE IF EXISTS `meditrack_db`;
CREATE DATABASE `meditrack_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `meditrack_db`;

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'DOCTOR', 'PATIENT') NOT NULL DEFAULT 'PATIENT',
  `full_name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. PATIENTS TABLE
-- ----------------------------------------------------------
CREATE TABLE `patients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `uhid` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Unique Hospital Identification Number (e.g. MEDI-2026-0001)',
  `full_name` VARCHAR(120) NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `age` INT NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `email` VARCHAR(120) NULL,
  `aadhar_no` VARCHAR(16) NULL COMMENT 'Optional 12-digit Indian Aadhar identifier',
  `address` TEXT NOT NULL,
  `city` VARCHAR(60) NOT NULL DEFAULT 'Chennai',
  `state` VARCHAR(60) NOT NULL DEFAULT 'Tamil Nadu',
  `pincode` VARCHAR(10) NOT NULL DEFAULT '600026',
  `emergency_contact_name` VARCHAR(120) NOT NULL,
  `emergency_contact_phone` VARCHAR(15) NOT NULL,
  `allergies` TEXT NULL,
  `medical_history` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_patients_uhid` (`uhid`),
  INDEX `idx_patients_phone` (`phone`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. DOCTORS TABLE
-- ----------------------------------------------------------
CREATE TABLE `doctors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `doc_reg_no` VARCHAR(30) NOT NULL UNIQUE COMMENT 'Medical Council of India Registration Number',
  `full_name` VARCHAR(120) NOT NULL,
  `department` VARCHAR(80) NOT NULL,
  `designation` VARCHAR(100) NOT NULL,
  `qualification` VARCHAR(120) NOT NULL,
  `experience_years` INT NOT NULL DEFAULT 5,
  `consultation_fee` DECIMAL(10,2) NOT NULL DEFAULT 700.00,
  `phone` VARCHAR(15) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `room_no` VARCHAR(20) NOT NULL,
  `available_days` VARCHAR(100) NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat',
  `available_time_slots` VARCHAR(255) NOT NULL DEFAULT '09:00 AM - 01:00 PM, 04:30 PM - 08:30 PM',
  `rating` DECIMAL(3,1) NOT NULL DEFAULT 4.9,
  `bio` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_doctors_dept` (`department`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. APPOINTMENTS TABLE
-- ----------------------------------------------------------
CREATE TABLE `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `appointment_no` VARCHAR(25) NOT NULL UNIQUE,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `department` VARCHAR(80) NOT NULL,
  `appointment_date` DATE NOT NULL,
  `appointment_time` VARCHAR(20) NOT NULL,
  `appointment_type` ENUM('New Consultation', 'Follow-up', 'Emergency', 'Routine Checkup') NOT NULL DEFAULT 'New Consultation',
  `status` ENUM('Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  `symptoms` TEXT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE RESTRICT,
  UNIQUE KEY `uk_doctor_slot` (`doctor_id`, `appointment_date`, `appointment_time`),
  INDEX `idx_appt_date` (`appointment_date`),
  INDEX `idx_appt_status` (`status`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. CONSULTATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE `consultations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `consultation_no` VARCHAR(25) NOT NULL UNIQUE,
  `appointment_id` INT NULL,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `consultation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `symptoms` TEXT NOT NULL,
  `observations` TEXT NULL,
  `diagnosis` VARCHAR(255) NOT NULL,
  `icd_code` VARCHAR(20) NULL,
  `bp` VARCHAR(20) NULL COMMENT 'Blood Pressure e.g. 120/80 mmHg',
  `pulse` INT NULL COMMENT 'Pulse in bpm',
  `temperature` DECIMAL(4,1) NULL COMMENT 'Temperature in F',
  `spo2` INT NULL COMMENT 'Oxygen Saturation %',
  `weight_kg` DECIMAL(5,1) NULL,
  `treatment_plan` TEXT NOT NULL,
  `follow_up_date` DATE NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. MEDICINES TABLE
-- ----------------------------------------------------------
CREATE TABLE `medicines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `medicine_name` VARCHAR(150) NOT NULL,
  `generic_name` VARCHAR(150) NOT NULL,
  `brand_name` VARCHAR(120) NOT NULL,
  `category` ENUM(
    'Analgesics', 'Antibiotics', 'Antivirals', 'Antifungals',
    'Antihistamines', 'Antacids', 'Antidiabetics', 'Antihypertensives',
    'Cardiovascular', 'Respiratory', 'Dermatology', 'Vitamins',
    'Supplements', 'Neurological', 'Ophthalmic', 'Emergency'
  ) NOT NULL,
  `manufacturer` VARCHAR(120) NOT NULL,
  `strength` VARCHAR(50) NOT NULL,
  `form` ENUM(
    'Tablet', 'Capsule', 'Syrup', 'Injection',
    'Drops', 'Cream', 'Ointment', 'Inhaler',
    'Powder', 'Suspension'
  ) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 100,
  `reorder_level` INT NOT NULL DEFAULT 20,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_med_name` (`medicine_name`),
  INDEX `idx_med_cat` (`category`),
  INDEX `idx_med_brand` (`brand_name`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. PRESCRIPTIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE `prescriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prescription_no` VARCHAR(25) NOT NULL UNIQUE,
  `consultation_id` INT NULL,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `prescription_date` DATE NOT NULL,
  `diagnosis_summary` VARCHAR(255) NOT NULL,
  `advice` TEXT NULL,
  `follow_up_days` INT DEFAULT 7,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE RESTRICT,
  INDEX `idx_rx_date` (`prescription_date`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 8. PRESCRIPTION_MEDICINES TABLE
-- ----------------------------------------------------------
CREATE TABLE `prescription_medicines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prescription_id` INT NOT NULL,
  `medicine_id` INT NOT NULL,
  `medicine_name` VARCHAR(150) NOT NULL,
  `strength` VARCHAR(50) NOT NULL,
  `form` VARCHAR(30) NOT NULL,
  `dosage` VARCHAR(50) NOT NULL COMMENT 'e.g. 1 Tablet or 5ml',
  `frequency` VARCHAR(50) NOT NULL COMMENT 'e.g. 1-0-1 (Morning-Night) or TDS',
  `duration` VARCHAR(30) NOT NULL COMMENT 'e.g. 5 Days',
  `timing` VARCHAR(50) NOT NULL DEFAULT 'After Food' COMMENT 'Before Food / After Food / With Meals',
  `quantity` INT NOT NULL DEFAULT 10,
  `instructions` TEXT NULL,
  FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 9. INVOICES TABLE
-- ----------------------------------------------------------
CREATE TABLE `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_no` VARCHAR(25) NOT NULL UNIQUE,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NULL,
  `consultation_id` INT NULL,
  `invoice_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `consultation_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `medicine_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `lab_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `additional_charges` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `gst_percent` DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `grand_total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_status` ENUM('Paid', 'Pending', 'Partially Paid', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `payment_mode` ENUM('Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Unpaid') NOT NULL DEFAULT 'Unpaid',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE SET NULL,
  INDEX `idx_inv_status` (`payment_status`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 10. INVOICE_ITEMS TABLE
-- ----------------------------------------------------------
CREATE TABLE `invoice_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT NOT NULL,
  `item_type` ENUM('Consultation', 'Medicine', 'Laboratory', 'Nursing', 'Procedure', 'Room') NOT NULL,
  `item_description` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 11. PAYMENTS TABLE
-- ----------------------------------------------------------
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_no` VARCHAR(25) NOT NULL UNIQUE,
  `invoice_id` INT NOT NULL,
  `patient_id` INT NOT NULL,
  `amount_paid` DECIMAL(10,2) NOT NULL,
  `payment_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_mode` ENUM('Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking') NOT NULL,
  `transaction_reference` VARCHAR(80) NULL,
  `payment_status` ENUM('Success', 'Pending', 'Failed') NOT NULL DEFAULT 'Success',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 12. NOTIFICATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `notification_type` ENUM('Appointment', 'Consultation', 'Prescription', 'Invoice', 'Inventory', 'System') NOT NULL DEFAULT 'System',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 13. AUDIT_LOGS TABLE
-- ----------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `username` VARCHAR(60) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `action` VARCHAR(80) NOT NULL,
  `resource` VARCHAR(80) NOT NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_user` (`username`),
  INDEX `idx_audit_action` (`action`)
) ENGINE=InnoDB;

-- ==========================================================
-- SEED DATA (Realistic Indian Healthcare Ecosystem)
-- ==========================================================

-- 1. SEED USERS
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `full_name`, `phone`, `status`) VALUES
(1, 'admin', 'admin@meditrack.in', 'pbkdf2:sha256:600000$meditrack$9e34e56598c8c5c7d5c95a05b38d3ad48e9c60e5cfbe673b1856cf0998f451f7', 'ADMIN', 'Dr. Sundaramurthy Iyer (Medical Director)', '+91-98401-22334', 'ACTIVE'),
(2, 'dr_kavitha', 'kavitha.cardio@meditrack.in', 'pbkdf2:sha256:600000$meditrack$9e34e56598c8c5c7d5c95a05b38d3ad48e9c60e5cfbe673b1856cf0998f451f7', 'DOCTOR', 'Dr. Kavitha Ramanathan, MD, DM (Cardiology)', '+91-98402-33445', 'ACTIVE'),
(3, 'dr_aravind', 'aravind.neuro@meditrack.in', 'pbkdf2:sha256:600000$meditrack$9e34e56598c8c5c7d5c95a05b38d3ad48e9c60e5cfbe673b1856cf0998f451f7', 'DOCTOR', 'Dr. Aravind Krishnan, M.Ch (Neuro Surgery)', '+91-98403-44556', 'ACTIVE'),
(4, 'dr_meenakshi', 'meenakshi.obgyn@meditrack.in', 'pbkdf2:sha256:600000$meditrack$9e34e56598c8c5c7d5c95a05b38d3ad48e9c60e5cfbe673b1856cf0998f451f7', 'DOCTOR', 'Dr. Meenakshi Sundaram, MS, DGO (OB/GYN)', '+91-98404-55667', 'ACTIVE'),
(5, 'patient_rajesh', 'rajesh.sharma@gmail.com', 'pbkdf2:sha256:600000$meditrack$9e34e56598c8c5c7d5c95a05b38d3ad48e9c60e5cfbe673b1856cf0998f451f7', 'PATIENT', 'Rajesh Kumar Sharma', '+91-94440-11223', 'ACTIVE');

-- 2. SEED DOCTORS
INSERT INTO `doctors` (`id`, `user_id`, `doc_reg_no`, `full_name`, `department`, `designation`, `qualification`, `experience_years`, `consultation_fee`, `phone`, `email`, `room_no`, `available_days`, `available_time_slots`, `rating`, `bio`) VALUES
(1, 2, 'TNMC-44829', 'Dr. Kavitha Ramanathan', 'Cardiology', 'Senior Consultant Interventional Cardiologist', 'MBBS, MD (Gen Med), DM (Cardiology), FACC', 16, 850.00, '+91-98402-33445', 'kavitha.cardio@meditrack.in', 'OPD Suite 101', 'Mon,Tue,Wed,Thu,Fri,Sat', '09:00 AM - 01:00 PM, 05:00 PM - 08:30 PM', 4.9, 'Expert in complex coronary angioplasty, heart failure management, and preventive cardiac rehabilitation.'),
(2, 3, 'TNMC-38102', 'Dr. Aravind Krishnan', 'Neurology', 'Chief Neurosurgeon & Spine Specialist', 'MBBS, MS (General Surgery), M.Ch (Neuro)', 18, 950.00, '+91-98403-44556', 'aravind.neuro@meditrack.in', 'OPD Suite 104', 'Mon,Tue,Thu,Fri', '10:00 AM - 02:00 PM, 06:00 PM - 08:30 PM', 4.9, 'Pioneer in minimally invasive spine surgery, brain tumour resection, and stroke critical intervention.'),
(3, 4, 'TNMC-51928', 'Dr. Meenakshi Sundaram', 'Obstetrics & Gynaecology', 'Senior Consultant Obstetrician & Laparoscopic Surgeon', 'MBBS, MS (OBG), DGO, FICOG', 14, 750.00, '+91-98404-55667', 'meenakshi.obgyn@meditrack.in', 'OPD Suite 202', 'Mon,Wed,Thu,Fri,Sat', '09:30 AM - 01:30 PM, 04:30 PM - 07:30 PM', 4.8, 'Specialized in high-risk pregnancy care, painless normal deliveries, and advanced gynaecologic laparoscopy.'),
(4, NULL, 'TNMC-29401', 'Dr. Suresh Balaji', 'Orthopaedics', 'Senior Joint Replacement & Arthroscopy Surgeon', 'MBBS, MS (Ortho), DNB (Ortho), MCh', 20, 800.00, '+91-98405-66778', 'suresh.ortho@meditrack.in', 'OPD Suite 108', 'Mon,Tue,Wed,Fri,Sat', '09:00 AM - 01:00 PM', 4.9, 'Over 5,000 successful robotic knee and hip replacements and sports ligament reconstructions.'),
(5, NULL, 'TNMC-60293', 'Dr. Preethi Venkatesh', 'Paediatrics', 'Consultant Paediatrician & Neonatologist', 'MBBS, MD (Paediatrics), Fellowship in Neonatology', 11, 650.00, '+91-98406-77889', 'preethi.paed@meditrack.in', 'OPD Suite 205', 'Mon,Tue,Wed,Thu,Fri,Sat', '10:00 AM - 01:00 PM, 05:00 PM - 08:00 PM', 4.9, 'Dedicated paediatric critical care, developmental assessments, and comprehensive child immunization.'),
(6, NULL, 'TNMC-41804', 'Dr. Karthik Narayanan', 'Nephrology & Urology', 'Senior Consultant Nephrologist & Renal Transplant Specialist', 'MBBS, MD (Med), DM (Nephro)', 15, 850.00, '+91-98407-88990', 'karthik.nephro@meditrack.in', 'OPD Suite 112', 'Tue,Thu,Sat', '09:00 AM - 02:00 PM', 4.8, 'Expert in acute & chronic kidney disease, automated peritoneal dialysis, and live donor renal transplants.'),
(7, NULL, 'TNMC-33719', 'Dr. Anandhi Rajasekar', 'Gastroenterology', 'Consultant Medical Gastroenterologist', 'MBBS, MD, DM (Gastro)', 13, 800.00, '+91-98408-99001', 'anandhi.gastro@meditrack.in', 'OPD Suite 115', 'Mon,Wed,Fri', '10:00 AM - 02:00 PM', 4.8, 'Advanced therapeutic endoscopy, ERCP, fatty liver reversal protocols, and IBD clinical management.'),
(8, NULL, 'TNMC-55912', 'Dr. Vijay Anand', 'Pulmonology', 'Consultant Pulmonologist & Chest Physician', 'MBBS, DTCD, DNB (Resp Diseases)', 12, 700.00, '+91-98409-00112', 'vijay.pulmo@meditrack.in', 'OPD Suite 118', 'Mon,Tue,Thu,Fri,Sat', '09:00 AM - 01:00 PM', 4.7, 'Specialist in bronchial asthma, allergic rhinitis, COPD, sleep apnea studies, and post-viral pulmonary fibrosis.');

-- 3. SEED PATIENTS
INSERT INTO `patients` (`id`, `user_id`, `uhid`, `full_name`, `date_of_birth`, `age`, `gender`, `blood_group`, `phone`, `email`, `aadhar_no`, `address`, `city`, `state`, `pincode`, `emergency_contact_name`, `emergency_contact_phone`, `allergies`, `medical_history`) VALUES
(1, 5, 'MEDI-2026-0001', 'Rajesh Kumar Sharma', '1982-05-14', 44, 'Male', 'O+', '+91-94440-11223', 'rajesh.sharma@gmail.com', '7891-2345-6789', '42/1, 2nd Main Road, Anna Nagar West', 'Chennai', 'Tamil Nadu', '600040', 'Sunita Sharma (Spouse)', '+91-94440-11224', 'Penicillin, Sulfa drugs', 'Hypertension diagnosed 2021, Type 2 Diabetes Mellitus under Metformin control.'),
(2, NULL, 'MEDI-2026-0002', 'Lakshmi Narayanan', '1968-11-23', 57, 'Female', 'B+', '+91-98840-55667', 'lakshmi.n68@yahoo.com', '4521-8932-1049', '18, G.N. Chetty Road, T. Nagar', 'Chennai', 'Tamil Nadu', '600017', 'Narayanan S. (Son)', '+91-98840-55668', 'No known drug allergies', 'Osteoarthritis bilateral knees, Mild Dyslipidemia.'),
(3, NULL, 'MEDI-2026-0003', 'Mohamed Farooq', '1990-08-19', 35, 'Male', 'A+', '+91-97900-22331', 'farooq.eng@gmail.com', '6734-9012-3456', '88, Triplicane High Road', 'Chennai', 'Tamil Nadu', '600005', 'Ayesha Farooq (Sister)', '+91-97900-22332', 'NSAIDs (Causes Gastric Ulceration)', 'Acid Peptic Disease, Occasional Migraine.'),
(4, NULL, 'MEDI-2026-0004', 'Ananya Deshmukh', '1998-02-10', 28, 'Female', 'AB+', '+91-96001-44552', 'ananya.d@outlook.com', '9012-3456-7890', '12/4, Velachery Bypass Road', 'Chennai', 'Tamil Nadu', '600042', 'Rohan Deshmukh (Husband)', '+91-96001-44553', 'None', 'First Trimester Antenatal Care (Gravida 1, Para 0).'),
(5, NULL, 'MEDI-2026-0005', 'Master Harish Venkatesh', '2019-07-04', 7, 'Male', 'O+', '+91-94450-88991', 'venkatesh.k@gmail.com', '3345-6789-0123', '27, South Mada Street, Mylapore', 'Chennai', 'Tamil Nadu', '600004', 'Venkatesh K (Father)', '+91-94450-88991', 'Dust mite allergy', 'Childhood Allergic Bronchitis, Vaccinations up-to-date.'),
(6, NULL, 'MEDI-2026-0006', 'Sivakumar Ramasamy', '1959-03-12', 67, 'Male', 'A-', '+91-98410-66778', 'siva.ramasamy@gmail.com', '8812-3490-5511', '55, 100 Feet Road, Vadapalani', 'Chennai', 'Tamil Nadu', '600026', 'Meena Sivakumar (Wife)', '+91-98410-66779', 'Aspirin allergy', 'Post Coronary Angioplasty (2023), Chronic Kidney Disease Stage 2.');

-- 4. SEED MEDICINES (Indian Pharma Formulations with full spectrum)
INSERT INTO `medicines` (`id`, `medicine_name`, `generic_name`, `brand_name`, `category`, `manufacturer`, `strength`, `form`, `unit_price`, `stock_quantity`, `reorder_level`, `description`) VALUES
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
(19, 'Inj. Ondansetron 4mg', 'Ondansetron HCl', 'Emeset 2ml', 'Emergency', 'Cipla Ltd', '2 mg / ml', 'Injection', 28.00, 180, 40, 'Serotonin 5-HT3 receptor antagonist for acute post-chemotherapy / postoperative nausea & vomiting.'),
(20, 'Livogen Adult Tonic', 'Ferrous Fumarate + Folic Acid', 'Livogen Tonic', 'Supplements', 'Merck / P&G', 'Ferrous 150mg + Folic 0.5mg', 'Syrup', 165.00, 200, 30, 'Hematinic tonic for iron deficiency anaemia, pregnancy nutrition, and general debility.');

-- 5. SEED APPOINTMENTS
INSERT INTO `appointments` (`id`, `appointment_no`, `patient_id`, `doctor_id`, `department`, `appointment_date`, `appointment_time`, `appointment_type`, `status`, `symptoms`, `notes`) VALUES
(1, 'APT-2026-1001', 1, 1, 'Cardiology', '2026-08-30', '10:00 AM', 'Routine Checkup', 'Completed', 'Routine hypertensive follow-up, occasional mild chest tightness on brisk walking.', 'ECG and Lipid profile reviewed. Advised stress test next visit.'),
(2, 'APT-2026-1002', 2, 4, 'Orthopaedics', '2026-08-30', '11:00 AM', 'New Consultation', 'Completed', 'Severe right knee pain while climbing stairs, morning stiffness for 20 minutes.', 'X-Ray right knee AP/Lateral requested. Bilateral OA grade 2.'),
(3, 'APT-2026-1003', 3, 7, 'Gastroenterology', '2026-08-31', '10:30 AM', 'New Consultation', 'Confirmed', 'Epigastric burning sensation after spicy meals, frequent sour belching.', 'Advised Upper GI Endoscopy if symptoms persist despite PPI therapy.'),
(4, 'APT-2026-1004', 4, 3, 'Obstetrics & Gynaecology', '2026-08-31', '11:30 AM', 'Routine Checkup', 'Confirmed', 'First trimester routine antenatal checkup, mild morning sickness.', 'Prescribed Prenatal multivitamins and Folic acid.'),
(5, 'APT-2026-1005', 5, 5, 'Paediatrics', '2026-09-01', '05:30 PM', 'New Consultation', 'Confirmed', 'Recurrent dry cough worse at night, mild wheezing post playground activity.', 'Suspected childhood cough-variant asthma.'),
(6, 'APT-2026-1006', 6, 6, 'Nephrology & Urology', '2026-09-01', '11:00 AM', 'Follow-up', 'Confirmed', 'Routine Serum Creatinine and eGFR monitoring post stent placement.', 'Bring recent fasting blood sugar and renal function test reports.');

-- 6. SEED CONSULTATIONS
INSERT INTO `consultations` (`id`, `consultation_no`, `appointment_id`, `patient_id`, `doctor_id`, `consultation_date`, `symptoms`, `observations`, `diagnosis`, `icd_code`, `bp`, `pulse`, `temperature`, `spo2`, `weight_kg`, `treatment_plan`, `follow_up_date`, `notes`) VALUES
(1, 'CON-2026-5001', 1, 1, 1, '2026-08-30 10:30:00', 'Mild exertional dyspnea, occasional headache in occipital region.', 'S1, S2 heard normal. No murmurs. Bilateral clear air entry. Mild pedal edema absent.', 'Essential Primary Hypertension with Stable Angina risk', 'I10 / I20.9', '138/88', 76, 98.4, 99, 78.5, '1. Continue Telmisartan 40mg once daily in morning.\n2. Add Atorvastatin 10mg at bedtime for plaque stabilization.\n3. Low sodium DASH diet (<3g salt/day).\n4. 30 mins brisk morning walk 5 days/week.\n5. Review with Lipid profile after 4 weeks.', '2026-09-27', 'Patient counselled thoroughly on lifestyle modification and stress reduction.'),
(2, 'CON-2026-5002', 2, 2, 4, '2026-08-30 11:30:00', 'Bilateral knee joint pain, crepitus on passive flexion, difficulty squatting.', 'Tenderness over medial joint line of right knee. Mild joint effusion, no local warmth.', 'Osteoarthritis of Knee, Bilateral (Grade II Kellgren-Lawrence)', 'M17.0', '130/80', 72, 98.2, 98, 66.0, '1. Tab Paracetamol 650mg SOS for acute pain (Max 2 tabs/day).\n2. Tab Shelcal 500mg once daily after lunch.\n3. Quadriceps strengthening exercises & hamstring stretches.\n4. Avoid cross-legged sitting and deep Indian squatting.\n5. Physiotherapy 5 sessions scheduled.', '2026-09-14', 'Advised weight management and knee support brace during prolonged standing.');

-- 7. SEED PRESCRIPTIONS
INSERT INTO `prescriptions` (`id`, `prescription_no`, `consultation_id`, `patient_id`, `doctor_id`, `prescription_date`, `diagnosis_summary`, `advice`, `follow_up_days`) VALUES
(1, 'RX-2026-9001', 1, 1, 1, '2026-08-30', 'Essential Primary Hypertension & Hyperlipidemia', 'Take blood pressure medications strictly on time. Avoid added salt, fried foods, and pickles. Measure BP at home twice weekly.', 30),
(2, 'RX-2026-9002', 2, 2, 4, '2026-08-30', 'Bilateral Osteoarthritis Knee (Grade II)', 'Apply hot water fomentation for 15 minutes twice daily. Regular knee isometric exercises. Do not skip calcium supplements.', 14);

-- 8. SEED PRESCRIPTION MEDICINES
INSERT INTO `prescription_medicines` (`id`, `prescription_id`, `medicine_id`, `medicine_name`, `strength`, `form`, `dosage`, `frequency`, `duration`, `timing`, `quantity`, `instructions`) VALUES
(1, 1, 5, 'Telma 40 Tablet', '40 mg', 'Tablet', '1 Tablet', '1-0-0 (Morning)', '30 Days', 'After Breakfast', 30, 'Take early morning with water. Do not skip doses.'),
(2, 1, 6, 'Aztor 10 Tablet', '10 mg', 'Tablet', '1 Tablet', '0-0-1 (Night)', '30 Days', 'After Dinner', 30, 'Take at bedtime regularly for lipid control.'),
(3, 1, 3, 'Pan-D Capsule', '40mg + 30mg', 'Capsule', '1 Capsule', '1-0-0 (Morning)', '15 Days', 'Before Food (Empty Stomach)', 15, 'Take 30 minutes before morning breakfast.'),
(4, 2, 1, 'Dolo 650 Tablet', '650 mg', 'Tablet', '1 Tablet', 'SOS (When Needed)', '5 Days', 'After Food', 10, 'Take only when knee joint pain is severe. Max 2 tablets in 24 hours.'),
(5, 2, 9, 'Shelcal 500 Tablet', '500mg + 250 IU', 'Tablet', '1 Tablet', '0-1-0 (Afternoon)', '30 Days', 'After Lunch', 30, 'Swallow with full glass of water or milk.');

-- 9. SEED INVOICES
INSERT INTO `invoices` (`id`, `invoice_no`, `patient_id`, `doctor_id`, `consultation_id`, `invoice_date`, `due_date`, `consultation_fee`, `medicine_charges`, `lab_charges`, `additional_charges`, `subtotal`, `discount_percent`, `discount_amount`, `gst_percent`, `tax_amount`, `grand_total`, `payment_status`, `payment_mode`, `notes`) VALUES
(1, 'INV-2026-7001', 1, 1, 1, '2026-08-30', '2026-08-30', 850.00, 845.00, 650.00, 0.00, 2345.00, 5.00, 117.25, 5.00, 111.39, 2339.14, 'Paid', 'UPI', 'Complete consultation, pharmacy dispense, and routine 12-lead ECG.'),
(2, 'INV-2026-7002', 2, 4, 2, '2026-08-30', '2026-08-30', 800.00, 320.00, 750.00, 100.00, 1970.00, 0.00, 0.00, 5.00, 98.50, 2068.50, 'Paid', 'Credit Card', 'Orthopaedic consultation, digital bilateral knee X-Ray, and knee brace fitting.'),
(3, 'INV-2026-7003', 3, 7, NULL, '2026-08-31', '2026-08-31', 800.00, 0.00, 0.00, 0.00, 800.00, 0.00, 0.00, 5.00, 40.00, 840.00, 'Pending', 'Unpaid', 'Gastroenterology advance OPD booking token.');

-- 10. SEED INVOICE ITEMS
INSERT INTO `invoice_items` (`id`, `invoice_id`, `item_type`, `item_description`, `quantity`, `unit_price`, `total_amount`) VALUES
(1, 1, 'Consultation', 'Senior Consultant Cardiology Consultation Fee', 1, 850.00, 850.00),
(2, 1, 'Laboratory', '12-Lead Resting Digital Electrocardiogram (ECG)', 1, 650.00, 650.00),
(3, 1, 'Medicine', 'Prescribed Pharmacy Medicines (Telma 40, Aztor 10, Pan-D)', 1, 845.00, 845.00),
(4, 2, 'Consultation', 'Senior Consultant Orthopaedic Specialist Consultation', 1, 800.00, 800.00),
(5, 2, 'Laboratory', 'Digital High-Resolution X-Ray Bilateral Knees (Standing AP & Lat)', 1, 750.00, 750.00),
(6, 2, 'Procedure', 'Clinical Nursing Assessment & Orthotic Knee Support Application', 1, 100.00, 100.00),
(7, 2, 'Medicine', 'Shelcal 500 & Dolo 650 Starter Dispensation', 1, 320.00, 320.00),
(8, 3, 'Consultation', 'Gastroenterology Specialist Consultation Token', 1, 800.00, 800.00);

-- 11. SEED PAYMENTS
INSERT INTO `payments` (`id`, `payment_no`, `invoice_id`, `patient_id`, `amount_paid`, `payment_date`, `payment_mode`, `transaction_reference`, `payment_status`, `notes`) VALUES
(1, 'PAY-2026-3001', 1, 1, 2339.14, '2026-08-30 11:15:22', 'UPI', 'UPI/RAZORPAY/9444011223@okaxis/8920194829', 'Success', 'Instant payment received via UPI QR Scan (Google Pay).'),
(2, 'PAY-2026-3002', 2, 2, 2068.50, '2026-08-30 12:45:10', 'Credit Card', 'POS/HDFC/TXN-88492049182', 'Success', 'HDFC Visa Platinum Card swiped at OPD Billing Counter 3.');

-- 12. SEED NOTIFICATIONS
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `notification_type`, `is_read`) VALUES
(1, 1, 'Pharmacy Stock Alert', 'Low stock alert: Inj. Tramadol 100mg has reached 120 units (Reorder threshold: 30).', 'Inventory', FALSE),
(2, 2, 'New Patient Appointment', 'Appointment Confirmed: Rajesh Kumar Sharma (UHID: MEDI-2026-0001) for Cardiology OPD at 10:00 AM.', 'Appointment', TRUE),
(3, 5, 'Prescription Ready for Download', 'Dr. Kavitha Ramanathan has issued your digital prescription (RX-2026-9001). You can view and download the PDF in your portal.', 'Prescription', FALSE),
(4, 5, 'Payment Receipt Generated', 'Payment of ₹2,339.14 for Invoice INV-2026-7001 was successful. Reference: UPI/RAZORPAY/9444011223@okaxis.', 'Invoice', TRUE);

-- 13. SEED AUDIT LOGS
INSERT INTO `audit_logs` (`id`, `user_id`, `username`, `role`, `action`, `resource`, `details`, `ip_address`) VALUES
(1, 1, 'admin', 'ADMIN', 'SYSTEM_INITIALIZATION', 'DATABASE', 'MediTrack Database schema bootstrap and initial Indian hospital clinical seed data loaded.', '127.0.0.1'),
(2, 2, 'dr_kavitha', 'DOCTOR', 'CREATE_CONSULTATION', 'CONSULTATION', 'Created clinical consultation record CON-2026-5001 for Patient UHID MEDI-2026-0001.', '192.168.1.101'),
(3, 2, 'dr_kavitha', 'DOCTOR', 'GENERATE_PRESCRIPTION', 'PRESCRIPTION', 'Generated digital prescription RX-2026-9001 with 3 formulations for Patient Rajesh Kumar Sharma.', '192.168.1.101'),
(4, 1, 'admin', 'ADMIN', 'GENERATE_INVOICE', 'BILLING', 'Generated tax invoice INV-2026-7001 with 5% GST calculation for Patient Rajesh Kumar Sharma.', '192.168.1.50'),
(5, 5, 'patient_rajesh', 'PATIENT', 'PROCESS_PAYMENT', 'PAYMENT', 'Processed full payment ₹2,339.14 via UPI (Transaction ID: UPI/RAZORPAY/9444011223@okaxis).', '192.168.1.144');
