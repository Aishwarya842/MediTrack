/**
 * MEDICONNECT – Integrated Patient Care & Multispeciality Hospital Management
 * Initial Clinical Datasets & Medical Master Data
 */

// Professional Dedicated Upper-Body Indian Doctor Profile Imagery (16 Unique Specialists - Same Uniform White Coat & Stethoscope, No Repeats)
import drKavithaImg from '../assets/images/dr_kavitha_uniform_1788173510675.jpg';
import drBalakrishnanImg from '../assets/images/indian_senior_surgeon_halfbody_1788171152746.jpg';
import drAravindImg from '../assets/images/dr_aravind_neurology_1788172037467.jpg';
import drDeepaImg from '../assets/images/indian_female_specialist_halfbody_1788171166116.jpg';
import drMeenakshiImg from '../assets/images/dr_meenakshi_obgyn_1788169049758.jpg';
import drAnanyaImg from '../assets/images/indian_female_doctor_upperbody_1788171131087.jpg';
import drSureshImg from '../assets/images/dr_suresh_orthopaedic_1788172051082.jpg';
import drKarthikeyanImg from '../assets/images/indian_male_doctor_upperbody_1788171117168.jpg';
import drSangeethaImg from '../assets/images/dr_sangeetha_paediatric_1788172084778.jpg';
import drManojImg from '../assets/images/dr_aravind_neuro_1788169034072.jpg';
import drAnandImg from '../assets/images/dr_anand_nephrology_1788172067172.jpg';
import drShanthiImg from '../assets/images/dr_divya_genmed_1788169129663.jpg';
import drVigneshImg from '../assets/images/dr_vignesh_gastroenterology_1788172102592.jpg';
import drSaravananImg from '../assets/images/dr_suresh_ortho_1788169063667.jpg';
import drDivyaImg from '../assets/images/dr_divya_generalmedicine_1788172116779.jpg';
import drSenthilImg from '../assets/images/dr_anand_nephro_1788169096544.jpg';

// Professional Receptionist Staff Imagery (Male & Female)
import receptionistFemaleImg from '../assets/images/female_receptionist_avatar_1788171082241.jpg';
import receptionistMaleImg from '../assets/images/male_receptionist_avatar_1788171097505.jpg';
import babyFootMaternityImg from '../assets/images/newborn_baby_foot_care_1788171054897.jpg';

export { babyFootMaternityImg, receptionistFemaleImg, receptionistMaleImg };

export interface Receptionist {
  id: number;
  title: 'Mr.' | 'Ms.' | 'Miss' | 'Mrs.';
  first_name: string;
  last_name: string;
  full_name: string;
  gender: 'Male' | 'Female';
  email: string;
  phone: string;
  shift: string;
  desk: string;
  languages: string[];
  experience_years: number;
  employee_id: string;
  image: string;
  bio: string;
  status: 'On Duty' | 'Available' | 'Off Duty';
}

export interface Patient {
  id: number;
  uhid: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth: string;
  age: number;
  gender: string;
  blood_group: string;
  department?: string;
  assigned_doctor_id?: number;
  assigned_doctor_name?: string;
  // Patient Location & Health Issue
  location?: string;
  nature_of_health_issue?: string;
  // Biological & Vitals Details
  height_cm?: number;
  weight_kg?: number;
  bmi?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  bp?: string;
  pulse?: number;
  temperature?: string;
  spo2?: string;
  allergies?: string;
  medical_history?: string;
  address: string;
  city: string;
  state: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  registered_by?: string;
  avatar?: string;
  created_at: string;
}

export interface InternalNotification {
  id: number;
  doctor_id: number;
  doctor_name: string;
  department: string;
  patient_id: number;
  patient_name: string;
  patient_uhid: string;
  token_no: string;
  message: string;
  recipient_role?: 'RECEPTIONIST' | 'DOCTOR' | 'ADMIN';
  fee_amount?: number;
  fee_text?: string;
  vitals_summary?: string;
  created_at: string;
  status: 'Unread' | 'Read' | 'Attending';
}

// Follow-Up Reminder (SMS / Call) dispatched to patients ahead of their next review
export interface FollowUpReminder {
  id: number;
  prescription_id: number;
  prescription_no: string;
  patient_id: number;
  patient_name: string;
  patient_uhid: string;
  patient_phone: string;
  doctor_id: number;
  doctor_name: string;
  department: string;
  follow_up_date: string;
  days_left: number;
  channel: 'SMS' | 'Call';
  message: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  sent_at: string;
}

export interface IPDPackage {
  id: string;
  title: string;
  category: string;
  stayType: string;
  department: string;
  fee: number;
  feeInLakhsText: string;
  leadDoctor: string;
  description: string;
  proceduresIncluded: string[];
}

export const OPD_CONSULTATION_FEE = 700;
export const OPD_APPLICABLE_TAX = 35; // 5% Healthcare GST: CGST ₹17.50 + SGST ₹17.50
export const OPD_NURSING_CHARGE = 200; // Clinical Nursing, Registration & Sanitization (SAC 999319)
export const OPD_TOTAL_FEE = 945; // ₹700 consultation + ₹200 nursing + ₹45 tax

// Follow-Up Reminder window: start messaging patients N days before their follow-up date
// e.g. follow-up 2026-09-14 → first reminder dispatched from 2026-09-08
export const FOLLOW_UP_REMINDER_WINDOW_DAYS = 6;

export const IPD_PACKAGES: IPDPackage[] = [
  {
    id: 'ipd-cardiac',
    title: 'Advanced Cardiac Sciences, Cardiac Stenting & Cardiothoracic Surgery',
    category: 'IPD Surgical & ICU',
    stayType: 'Overnight Stay (24h+)',
    department: 'Cardiology',
    fee: 385000,
    feeInLakhsText: '₹3.85 Lakhs',
    leadDoctor: 'Dr. Kavitha Ramanathan & Dr. Balakrishnan Natarajan',
    description: 'Coronary artery bypass grafting (CABG), drug-eluting stent implantations, valve repairs, cardiac intensive CCU stay, and 24/7 post-op perfusion monitoring.',
    proceduresIncluded: ['Cardiac Catheterization & Stenting', 'Surgical OT Facility', '48h Cardiac CCU Bed', 'Specialist Rounds']
  },
  {
    id: 'ipd-icu',
    title: 'Critical Care & Intensive Care Unit (ICU)',
    category: 'IPD Surgical & ICU',
    stayType: 'Overnight Stay (24h+)',
    department: 'General Medicine',
    fee: 175000,
    feeInLakhsText: '₹1.75 Lakhs',
    leadDoctor: 'Dr. Divya Radhakrishnan & Critical Care Team',
    description: 'Level-III Intensive Care Unit with invasive mechanical ventilation, continuous arterial hemodynamics, multi-organ support, and 1:1 dedicated nursing ratio.',
    proceduresIncluded: ['Invasive Ventilator Support', 'Arterial Blood Gas (ABG) Monitoring', 'Intensivist Round-the-clock Care', 'Central Line & Resuscitation']
  },
  {
    id: 'ipd-transplant',
    title: 'Liver Care, Hepatobiliary & Transplant Surgery (Liver & Kidney Transplantation)',
    category: 'IPD Surgical & ICU',
    stayType: 'Overnight Stay (24h+)',
    department: 'Nephrology',
    fee: 750000,
    feeInLakhsText: '₹7.50 Lakhs',
    leadDoctor: 'Dr. Anand Parthasarathy & Transplant Surgical Team',
    description: 'Complex living donor / deceased donor organ transplantation, dedicated HEPA-filtered positive pressure isolation rooms, and comprehensive immunosuppression protocols.',
    proceduresIncluded: ['Transplant Operating Theatre', 'Immunosuppressive Monitoring', 'Isolated Sterile Transplant ICU', 'Crossmatch & Histology']
  },
  {
    id: 'ipd-ortho',
    title: 'Orthopaedics, Robotic Joint Replacement & Sports Injuries',
    category: 'IPD Surgical & ICU',
    stayType: 'Overnight Stay (24h+)',
    department: 'Orthopaedics',
    fee: 260000,
    feeInLakhsText: '₹2.60 Lakhs',
    leadDoctor: 'Dr. Suresh Balaji, MS, M.Ch (Ortho)',
    description: 'Sub-millimeter robotic total knee/hip arthroplasty, titanium implants, computer navigation alignment, epidural post-op analgesia, and inpatient rehabilitation.',
    proceduresIncluded: ['Robotic Navigated Surgical OT', 'FDA-Approved Joint Prosthesis', 'Post-Operative Inpatient Stay', 'Physiotherapy & Mobilization']
  },
  {
    id: 'ipd-neuro',
    title: 'Neurosciences – Brain & Spine Surgery',
    category: 'IPD Surgical & ICU',
    stayType: 'Overnight Stay (24h+)',
    department: 'Neurology',
    fee: 420000,
    feeInLakhsText: '₹4.20 Lakhs',
    leadDoctor: 'Dr. Aravind Krishnan, M.Ch (Neurosurgery)',
    description: 'High-precision microscopic craniotomy, spinal stabilization with titanium pedicle screws, neuromonitoring, and neuro-intensive recovery care.',
    proceduresIncluded: ['Microscopic Craniotomy OT', 'Intraoperative Neuromonitoring', 'Neuro-ICU Dedicated Bay', 'CT/MRI Post-Surgical Scans']
  },
  {
    id: 'ipd-obgyn',
    title: 'Obstetrics & Gynaecology & Natural Birthing',
    category: 'IPD Surgical & ICU',
    stayType: 'Overnight Stay (24h+)',
    department: 'Obstetrics & Gynaecology',
    fee: 120000,
    feeInLakhsText: '₹1.20 Lakhs',
    leadDoctor: 'Dr. Meenakshi Sundaram, MD, DGO (OB/GYN)',
    description: 'Private maternity birthing suite, painless delivery epidural analgesia, high-risk maternal-fetal monitoring, and complete neonatal nursery assessment.',
    proceduresIncluded: ['Private Birthing OT / Labour Room', 'Painless Epidural Anesthesia', 'Post-Natal Inpatient Stay', 'Neonatologist Evaluation']
  },
  {
    id: 'ipd-nicu',
    title: 'Neonatal Intensive Care Unit (NICU)',
    category: 'IPD Surgical & ICU',
    stayType: 'Overnight Stay (24h+)',
    department: 'Paediatrics',
    fee: 195000,
    feeInLakhsText: '₹1.95 Lakhs',
    leadDoctor: 'Dr. Sangeetha Natarajan, MD, DNB (Neonatology)',
    description: 'Level-III tertiary neonatal intensive care for premature infants, Giraffe infant warmers, surfactant therapy, phototherapy, and specialized neonatology oversight.',
    proceduresIncluded: ['Level-III NICU Incubator Bay', 'High-Frequency Oscillatory Support', 'Phototherapy & Parenteral Nutrition', '24/7 Neonatologist Care']
  },
  {
    id: 'ipd-stroke',
    title: 'Advanced Neuro Stroke Care & Mechanical Thrombectomy',
    category: 'IPD Surgical & ICU',
    stayType: 'Overnight Stay (24h+)',
    department: 'Neurology',
    fee: 340000,
    feeInLakhsText: '₹3.40 Lakhs',
    leadDoctor: 'Dr. Deepa Ramesh & Acute Stroke Intervention Team',
    description: 'Rapid golden-hour endovascular thrombectomy, neuro-vascular cath lab intervention, continuous intracranial pressure monitoring, and specialized stroke rehab.',
    proceduresIncluded: ['Biplane Cath Lab Angiography', 'Endovascular Clot Retrieval Catheters', 'Neuro Critical Care Monitoring', 'Dedicated Speech & Physical Therapy']
  }
];

export interface Doctor {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  specialization: string;
  experience_years: number;
  consultation_fee: number;
  available_days: string;
  room_number: string;
  registration_no: string;
  image?: string;
  bio?: string;
  opd_timing?: string;
  rating?: number;
  reviews_count?: number;
  awards?: string[];
  procedures?: string[];
  memberships?: string[];
  languages?: string[];
}

export interface Appointment {
  id: number;
  appointment_no: string;
  patient_id: number;
  patient_name: string;
  patient_uhid: string;
  patient_phone?: string;
  patient_age?: number;
  patient_gender?: string;
  patient_location?: string;
  opd_reg_no?: string;
  time_slot?: string;
  nature_of_health_issue?: string;
  source_channel?: 'Phone Call (Receptionist Intake)' | 'Walk-in' | 'Online Portal';
  doctor_id: number;
  doctor_name: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  type?: string;
  status: 'OPD Registration' | 'Appointment Pending' | 'Doctor + Date/Time Scheduled by Receptionist' | 'Appointment Confirmed' | 'Consultation Pending' | 'Consultation In Progress' | 'Consultation Completed' | 'Payment Pending' | '₹700 + Tax Paid' | 'Paid' | 'Receipt Generated' | 'Documents Ready' | 'Printed' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Scheduled' | 'Checked In';
  consultation_completed?: boolean;
  documents_ready?: boolean;
  printed_at?: string;
  consultation_id?: number;
  prescription_id?: number;
  first_name?: string;
  last_name?: string;
  specialty?: string;
  symptoms?: string;
  notes?: string;
  tax_amount?: number;
  total_amount?: number;
  // Mandatory Payment & Biological Details Architecture
  service_category?: 'OPD Consultation' | 'IPD Surgical & ICU';
  ipd_package_name?: string;
  fee_amount: number;
  fee_in_lakhs_text?: string;
  payment_status: 'Unpaid (Pending at Reception)' | 'Paid (Collected by Receptionist)' | 'Paid' | 'Refunded' | 'Unpaid' | 'Pending Payment';
  payment_mode?: 'Cash' | 'UPI' | 'Card' | 'Insurance / TPA';
  receipt_no?: string;
  collected_by_receptionist?: string;
  collected_at?: string;
  consultation_unlocked: boolean;
  // Biological Vitals recorded at Reception
  vitals_recorded?: boolean;
  vitals_summary?: string;
  height_cm?: number;
  weight_kg?: number;
  bmi?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  bp?: string;
  pulse?: number;
  temperature?: string;
  spo2?: string;
  allergies?: string;
  medical_history?: string;
}

export interface Consultation {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_uhid: string;
  doctor_id: number;
  doctor_name: string;
  consultation_date: string;
  symptoms: string;
  diagnosis: string;
  bp: string;
  pulse: number;
  temperature: string;
  spo2: string;
  lab_tests_recommended?: string;
  clinical_notes?: string;
  status?: 'Completed' | 'In Progress' | 'Pending';
  appointment_id?: number;
}

export interface Medicine {
  id: number;
  medicine_name: string;
  generic_name: string;
  category: string;
  form: string;
  strength: string;
  manufacturer: string;
  unit_price: number;
  stock_quantity: number;
  batch_number: string;
  expiry_date: string;
  hsn_code: string;
}

export interface PrescribedMedicine {
  medicine_id?: number;
  medicine_name: string;
  strength: string;
  form: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

export interface Prescription {
  id: number;
  prescription_no: string;
  opd_reg_no?: string;
  patient_id: number;
  patient_name: string;
  patient_uhid: string;
  age: number;
  gender: string;
  blood_group: string;
  phone?: string;
  location?: string;
  nature_of_health_issue?: string;
  doctor_id: number;
  doctor_name: string;
  department: string;
  doc_reg_no: string;
  prescription_date: string;
  diagnosis_summary: string;
  advice: string;
  follow_up_days: number;
  follow_up_date?: string;
  medicines: PrescribedMedicine[];
  // Amount & Billing Breakdown
  consultation_fee: number;
  medicines_fee: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: 'Paid' | 'Pending at Pharmacy Desk' | 'Billed';
}

export interface Invoice {
  id: number;
  invoice_no: string;
  appointment_id?: number;
  patient_id: number;
  patient_name: string;
  patient_uhid: string;
  patient_phone: string;
  patient_age?: number;
  patient_location?: string;
  opd_reg_no?: string;
  doctor_id: number;
  doctor_name: string;
  department?: string;
  invoice_date: string;
  consultation_time?: string;
  consultation_fee: number;
  medicine_fee: number;
  lab_fee: number;
  additional_charges: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: 'Paid' | 'Pending' | 'Partially Paid';
  payment_mode: string;
  receipt_no?: string;
  collected_by?: string;
}

export interface Payment {
  id: number;
  receipt_no: string;
  invoice_id: number;
  patient_name: string;
  patient_uhid: string;
  payment_date: string;
  amount_paid: number;
  payment_mode: string;
  transaction_reference: string;
  status: string;
}

export interface AuditLog {
  id: number;
  user_name: string;
  action: string;
  entity_type: string;
  ip_address: string;
  details: string;
  created_at: string;
}

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 1,
    uhid: 'UHID-2026-0001',
    full_name: 'Karthik Subramanian',
    phone: '+91 98840 12345',
    email: 'karthik.subramanian@gmail.com',
    date_of_birth: '1984-06-15',
    age: 41,
    gender: 'Male',
    blood_group: 'B+',
    department: 'Cardiology',
    assigned_doctor_id: 1,
    assigned_doctor_name: 'Dr. Kavitha Ramanathan',
    location: 'T. Nagar, Chennai',
    nature_of_health_issue: 'Follow-up for mild exertional chest discomfort & BP check',
    height_cm: 174,
    weight_kg: 76,
    bmi: 25.1,
    bp_systolic: 130,
    bp_diastolic: 84,
    bp: '130/84 mmHg',
    pulse: 74,
    temperature: '98.4 °F',
    spo2: '99%',
    allergies: 'No known drug allergies (NKDA)',
    medical_history: 'Essential hypertension on Telma 40. Previous ECG within normal limits.',
    address: '42/1, Venkatanarayana Road, T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    emergency_contact_name: 'Lakshmi Subramanian (Spouse)',
    emergency_contact_phone: '+91 98840 54321',
    registered_by: 'Reception Desk (Ms. Aishwarya Sundaram)',
    created_at: '2026-08-15 10:30:00'
  },
  {
    id: 2,
    uhid: 'UHID-2026-0002',
    full_name: 'Priya Sundaram',
    phone: '+91 98401 56789',
    email: 'priya.sundaram@yahoo.com',
    date_of_birth: '1992-11-20',
    age: 33,
    gender: 'Female',
    blood_group: 'O+',
    department: 'Obstetrics & Gynaecology',
    assigned_doctor_id: 5,
    assigned_doctor_name: 'Dr. Meenakshi Sundaram',
    location: 'Anna Nagar, Chennai',
    nature_of_health_issue: 'Routine antenatal trimester review & anomaly screening',
    height_cm: 162,
    weight_kg: 64,
    bmi: 24.4,
    bp_systolic: 118,
    bp_diastolic: 76,
    bp: '118/76 mmHg',
    pulse: 78,
    temperature: '98.6 °F',
    spo2: '99%',
    allergies: 'Penicillin allergy (skin rash)',
    medical_history: 'Antenatal care 2nd trimester. G1P0, regular iron/folate supplementation.',
    address: '15, 2nd Avenue, Anna Nagar East',
    city: 'Chennai',
    state: 'Tamil Nadu',
    emergency_contact_name: 'Venkatesh Sundaram (Husband)',
    emergency_contact_phone: '+91 98401 99999',
    registered_by: 'Reception Desk (Ms. Aishwarya Sundaram)',
    created_at: '2026-08-20 11:15:00'
  },
  {
    id: 3,
    uhid: 'UHID-2026-0003',
    full_name: 'Rajesh Sharma',
    phone: '+91 98840 98765',
    email: 'rajesh.sharma@gmail.com',
    date_of_birth: '1988-04-12',
    age: 38,
    gender: 'Male',
    blood_group: 'A+',
    department: 'General Medicine',
    assigned_doctor_id: 15,
    assigned_doctor_name: 'Dr. Divya Radhakrishnan',
    location: 'Vadapalani, Chennai',
    nature_of_health_issue: 'High grade fever with chills and persistent dry cough for 3 days',
    height_cm: 172,
    weight_kg: 71,
    bmi: 24.0,
    bp_systolic: 122,
    bp_diastolic: 80,
    bp: '122/80 mmHg',
    pulse: 82,
    temperature: '101.2 °F',
    spo2: '98%',
    allergies: 'No known drug allergies (NKDA)',
    medical_history: 'No past chronic illness. Seasonal viral fever history.',
    address: '28, Arcot Road, Vadapalani',
    city: 'Chennai',
    state: 'Tamil Nadu',
    emergency_contact_name: 'Meena Sharma (Spouse)',
    emergency_contact_phone: '+91 98840 56780',
    registered_by: 'Online Patient Appointment Portal',
    created_at: '2026-09-05 09:00:00'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  // 1. CARDIOLOGY (2 Doctors)
  {
    id: 1,
    full_name: "Dr. Kavitha Ramanathan",
    email: "dr.kavitha@mediconnect.in",
    phone: "+91 44 2483 3401",
    department: "Cardiology",
    qualification: "MBBS, MD (General Medicine), DM (Cardiology), FACC (USA)",
    specialization: "Interventional Cardiology, Complex Angioplasty, TAVR & Pacemakers",
    experience_years: 18,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-102",
    registration_no: "TNMC-44829",
    image: drKavithaImg,
    bio: "Senior Interventional Cardiologist with over 18 years of clinical expertise in coronary interventions, transcatheter aortic valve replacements (TAVR), and cardiac intensive CCU management. Trained at Madras Medical College and Fellow of the American College of Cardiology.",
    opd_timing: "09:00 AM - 01:30 PM & 04:30 PM - 07:00 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 428,
    awards: ["Best Cardiologist Award (Tamil Nadu Medical Council, 2024)", "Excellence in TAVR Procedures"],
    procedures: ["Coronary Angiography & Angioplasty (PTCA)", "TAVR & Mitral Clip", "Permanent Pacemaker Implantation", "Rotablation & IVUS Guided PCI"],
    memberships: ["Cardiological Society of India (CSI)", "American College of Cardiology (FACC)", "European Society of Cardiology (ESC)"],
    languages: ["English", "Tamil", "Hindi"]
  },
  {
    id: 2,
    full_name: "Dr. Balakrishnan Natarajan",
    email: "dr.balakrishnan@mediconnect.in",
    phone: "+91 44 2483 3402",
    department: "Cardiology",
    qualification: "MBBS, MD (Internal Medicine), DM (Cardiology), FSCAI",
    specialization: "Senior Interventional Cardiologist, Cardiac Electrophysiology, Heart Failure & CRT-D",
    experience_years: 22,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-103",
    registration_no: "TNMC-36521",
    image: drBalakrishnanImg,
    bio: "Chief of Cardiac Sciences & Electrophysiology with 22+ years of surgical experience. Has performed over 12,000 diagnostic angiographies, complex bifurcation stenting, radiofrequency catheter ablations, and heart failure device implantations.",
    opd_timing: "10:00 AM - 02:00 PM & 05:00 PM - 07:30 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 512,
    awards: ["Lifetime Achievement Award in Cardiology (2023)", "Pioneer in Radial Angioplasty South India"],
    procedures: ["Primary Emergency Angioplasty (24x7 Golden Hour)", "3D Mapping & Arrhythmia Radiofrequency Ablation", "CRT-D & ICD Implantation", "Peripheral Vascular Angioplasty & Stenting"],
    memberships: ["Cardiological Society of India (CSI)", "Society for Cardiovascular Angiography and Interventions (FSCAI)", "Indian Heart Rhythm Society"],
    languages: ["English", "Tamil", "Telugu"]
  },

  // 2. NEUROLOGY & NEUROSURGERY (2 Doctors)
  {
    id: 3,
    full_name: "Dr. Aravind Krishnan",
    email: "dr.aravind@mediconnect.in",
    phone: "+91 44 2483 3403",
    department: "Neurology",
    qualification: "MBBS, MS (General Surgery), M.Ch (Neuro Surgery)",
    specialization: "Brain Microsurgery, Minimally Invasive Spine Surgery, Stroke Care",
    experience_years: 15,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-108",
    registration_no: "TNMC-51204",
    image: drAravindImg,
    bio: "Chief Neurosurgeon specializing in microscopic brain tumour resections, skull-base surgeries, endoscopic spine decompression, and comprehensive acute ischemic stroke management protocols.",
    opd_timing: "10:00 AM - 02:00 PM & 05:00 PM - 07:30 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 310,
    awards: ["Pioneering Neuro-Endoscopy Fellowship (Japan)", "State Neuro Surgical Excellence Gold Medal"],
    procedures: ["Awake Brain Craniotomy", "Microdiscectomy & Spinal Fusion", "Trigeminal Neuralgia Microvascular Decompression", "Endoscopic Pituitary Surgery"],
    memberships: ["Neurological Society of India (NSI)", "Congress of Neurological Surgeons (USA)"],
    languages: ["English", "Tamil", "Malayalam"]
  },
  {
    id: 4,
    full_name: "Dr. Deepa Ramesh",
    email: "dr.deepa@mediconnect.in",
    phone: "+91 44 2483 3404",
    department: "Neurology",
    qualification: "MBBS, MD (General Medicine), DM (Neurology)",
    specialization: "Comprehensive Stroke Care, Parkinson's & Movement Disorders, Refractory Epilepsy",
    experience_years: 14,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-109",
    registration_no: "TNMC-57438",
    image: drDeepaImg,
    bio: "Senior Consultant Neurologist leading the 24/7 Hyper-Acute Stroke Response Pathway and Movement Disorder Clinic. Renowned for botulinum toxin therapy for dystonias and advanced video EEG epilepsy evaluations.",
    opd_timing: "09:30 AM - 01:30 PM & 04:30 PM - 07:00 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 285,
    awards: ["Young Neurologist Investigator Award", "Distinction in Clinical Neurophysiology (NIMHANS)"],
    procedures: ["IV Thrombolysis for Acute Stroke", "Botulinum Toxin Injection for Migraine & Spasticity", "Nerve Conduction & Electromyography (NCV/EMG)", "Neuro-Immunology & Multiple Sclerosis Management"],
    memberships: ["Indian Academy of Neurology (IAN)", "Movement Disorder Society of India", "World Stroke Organization"],
    languages: ["English", "Tamil", "Hindi"]
  },

  // 3. OBSTETRICS & GYNAECOLOGY (2 Doctors)
  {
    id: 5,
    full_name: "Dr. Meenakshi Sundaram",
    email: "dr.meenakshi@mediconnect.in",
    phone: "+91 44 2483 3405",
    department: "Obstetrics & Gynaecology",
    qualification: "MBBS, DGO, MS (OB/GYN), FICOG",
    specialization: "High-Risk Obstetrics, Laparoscopic Gynaecology, Painless Delivery",
    experience_years: 20,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-204",
    registration_no: "TNMC-38910",
    image: drMeenakshiImg,
    bio: "Renowned Obstetrician & Gynaecological Surgeon with 20+ years guiding over 10,000 safe deliveries. Expert in gestational diabetes, high-risk twin pregnancies, robotic hysterectomies, and fertility preservation.",
    opd_timing: "09:30 AM - 01:00 PM & 04:00 PM - 06:30 PM (All 7 Days)",
    rating: 5.0,
    reviews_count: 580,
    awards: ["Distinguished Obstetrician of the Decade", "National Women Healthcare Leadership Award"],
    procedures: ["High-Risk Antenatal Care & Painless Labour", "Total Laparoscopic Hysterectomy (TLH)", "Ovarian Cystectomy & Myomectomy", "Infertility Workup & IUI Support"],
    memberships: ["Federation of Obstetric and Gynaecological Societies of India (FOGSI)", "OGSSI Chennai"],
    languages: ["English", "Tamil", "Telugu"]
  },
  {
    id: 6,
    full_name: "Dr. Ananya Swaminathan",
    email: "dr.ananya@mediconnect.in",
    phone: "+91 44 2483 3406",
    department: "Obstetrics & Gynaecology",
    qualification: "MBBS, MS (OB/GYN), DNB, Fellowship in Fetal Medicine & Reproductive Genetics",
    specialization: "Fetal Medicine, 3D/4D NT Scans, Reproductive Endocrinology & Infertility",
    experience_years: 13,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-205",
    registration_no: "TNMC-61092",
    image: drAnanyaImg,
    bio: "Senior Fetal Medicine Specialist and Gynaecologist certified in advanced prenatal screening, intrauterine fetal therapies, recurrent pregnancy loss management, and adolescent gynaecological wellness.",
    opd_timing: "10:00 AM - 02:30 PM & 05:00 PM - 07:30 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 340,
    awards: ["Fetal Medicine Foundation UK Certified Specialist", "Best Research Paper in Perinatal Care"],
    procedures: ["Targeted Fetal Anomaly Scan & Echo", "Amniocentesis & Chorionic Villus Sampling (CVS)", "Painless Epidural Normal Delivery", "Laparoscopic Fertility Enhancing Surgery"],
    memberships: ["Society of Fetal Medicine (SFM)", "International Society of Ultrasound in Obstetrics and Gynecology (ISUOG)"],
    languages: ["English", "Tamil", "Hindi"]
  },

  // 4. ORTHOPAEDICS & JOINT REPLACEMENT (2 Doctors)
  {
    id: 7,
    full_name: "Dr. Suresh Balaji",
    email: "dr.suresh@mediconnect.in",
    phone: "+91 44 2483 3407",
    department: "Orthopaedics",
    qualification: "MBBS, MS (Orthopaedics), M.Ch (Ortho - UK), Fellowship in Joint Replacement",
    specialization: "Robotic Joint Replacement, Arthroscopic Knee/Shoulder Surgery, Trauma",
    experience_years: 16,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-115",
    registration_no: "TNMC-49332",
    image: drSureshImg,
    bio: "Head of Orthopaedics & Robotic Joint Replacement. Pioneered sub-millimeter robotic total knee and hip replacements in South India with rapid 48-hour recovery pathways and athletic sports injury reconstruction.",
    opd_timing: "10:00 AM - 02:00 PM & 04:30 PM - 07:00 PM (All 7 Days)",
    rating: 4.8,
    reviews_count: 395,
    awards: ["Robotic Orthopaedic Innovator Award 2025", "Fellow of Royal College of Surgeons (Edinburgh)"],
    procedures: ["Robotic Total & Partial Knee Arthroplasty", "Total Hip Replacement (Anterior Approach)", "Knee ACL/PCL Ligament Reconstruction", "Shoulder Rotator Cuff Arthroscopy"],
    memberships: ["Indian Orthopaedic Association (IOA)", "Tamil Nadu Orthopaedic Association (TNOA)", "ISAKOS"],
    languages: ["English", "Tamil", "Hindi"]
  },
  {
    id: 8,
    full_name: "Dr. R. Karthikeyan",
    email: "dr.karthikeyan@mediconnect.in",
    phone: "+91 44 2483 3408",
    department: "Orthopaedics",
    qualification: "MBBS, MS (Ortho), DNB (Ortho), Fellowship in Sports Medicine (Germany)",
    specialization: "Sports Arthroscopy, Spine Decompression, Complex Trauma & Pelvic Reconstruction",
    experience_years: 14,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-116",
    registration_no: "TNMC-58721",
    image: drKarthikeyanImg,
    bio: "Senior Consultant Orthopaedic & Sports Injury Surgeon. Official consultant to state athletic associations, specialized in keyhole shoulder/knee repairs, meniscus preservation, and multi-fragment fracture fixation.",
    opd_timing: "09:00 AM - 01:00 PM & 05:00 PM - 07:30 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 310,
    awards: ["Distinction in Arthroscopic Surgery (Munich)", "State Trauma Excellence Award"],
    procedures: ["Arthroscopic Meniscal Repair & Cartilage Restoration", "Multi-Ligament Knee Reconstructions", "Minimally Invasive Spine Microdiscectomy", "Complex Poly-Trauma Fixation"],
    memberships: ["Indian Arthroscopy Society (IAS)", "AO Trauma International", "Indian Orthopaedic Association (IOA)"],
    languages: ["English", "Tamil"]
  },

  // 5. PAEDIATRICS & NEONATOLOGY (2 Doctors)
  {
    id: 9,
    full_name: "Dr. Sangeetha Natarajan",
    email: "dr.sangeetha@mediconnect.in",
    phone: "+91 44 2483 3409",
    department: "Paediatrics",
    qualification: "MBBS, DCH, MD (Paediatrics), Fellowship in Neonatology",
    specialization: "Neonatal Intensive Care (NICU), Paediatric Asthma, Developmental Health",
    experience_years: 12,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-105",
    registration_no: "TNMC-62419",
    image: drSangeethaImg,
    bio: "Lead Neonatologist & Senior Paediatrician heading our Level-III NICU. Dedicated to premature infant survival, newborn critical care, comprehensive childhood immunizations, and paediatric allergy care.",
    opd_timing: "09:00 AM - 01:30 PM & 05:00 PM - 08:00 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 512,
    awards: ["Excellence in Neonatal Survival Protocol (IAP)", "Child Welfare Medical Honor"],
    procedures: ["Level-III NICU Care & Surfactant Therapy", "Paediatric Immunization & Growth Milestones", "Paediatric Emergency & Bronchial Asthma Care", "Newborn Screening & Phototherapy"],
    memberships: ["Indian Academy of Pediatrics (IAP)", "National Neonatology Forum (NNF)"],
    languages: ["English", "Tamil", "Telugu"]
  },
  {
    id: 10,
    full_name: "Dr. Manoj Prabu",
    email: "dr.manoj@mediconnect.in",
    phone: "+91 44 2483 3410",
    department: "Paediatrics",
    qualification: "MBBS, MD (Paediatrics), Fellowship in Paediatric Critical Care (PICU)",
    specialization: "Paediatric Intensive Care, Infectious Diseases, Childhood Nutrition & Growth",
    experience_years: 11,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-106",
    registration_no: "TNMC-69450",
    image: drManojImg,
    bio: "Consultant Paediatrician and Intensive Care Specialist overseeing the Paediatric High-Dependency Unit. Expert in managing severe childhood fevers, respiratory infections, paediatric asthma, and juvenile diabetes.",
    opd_timing: "10:00 AM - 02:00 PM & 04:30 PM - 07:00 PM (All 7 Days)",
    rating: 4.8,
    reviews_count: 275,
    awards: ["Paediatric Critical Care Excellence Award", "National Quiz Gold Medalist in Paediatrics"],
    procedures: ["PICU Invasive Ventilation & Hemodynamic Monitoring", "Paediatric Allergy Desensitization", "Developmental Delay & ADHD Assessment", "Childhood Obesity & Metabolic Guidance"],
    memberships: ["Indian Academy of Pediatrics (IAP)", "Paediatric Critical Care Chapter"],
    languages: ["English", "Tamil", "Hindi"]
  },

  // 6. NEPHROLOGY & RENAL CARE (2 Doctors)
  {
    id: 11,
    full_name: "Dr. Anand Parthasarathy",
    email: "dr.anand@mediconnect.in",
    phone: "+91 44 2483 3411",
    department: "Nephrology",
    qualification: "MBBS, MD (Medicine), DM (Nephrology)",
    specialization: "Renal Transplant, Dialysis Management, Diabetic Nephropathy",
    experience_years: 14,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-210",
    registration_no: "TNMC-56781",
    image: drAnandImg,
    bio: "Consultant Nephrologist and Renal Transplant Physician overseeing 24x7 state-of-the-art hemodialysis, peritoneal dialysis, kidney stone prevention, and immunological transplant management.",
    opd_timing: "09:00 AM - 01:00 PM & 04:30 PM - 07:00 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 245,
    awards: ["Best Clinical Nephrologist Award (ISN Southern Chapter)"],
    procedures: ["Live Donor Kidney Transplantation", "AV Fistula Creation & Catheterization", "Continuous Renal Replacement Therapy (CRRT)", "Renal Biopsy under Real-Time Ultrasound"],
    memberships: ["Indian Society of Nephrology (ISN)", "International Society of Nephrology"],
    languages: ["English", "Tamil"]
  },
  {
    id: 12,
    full_name: "Dr. Shanthi Varadharajan",
    email: "dr.shanthi@mediconnect.in",
    phone: "+91 44 2483 3412",
    department: "Nephrology",
    qualification: "MBBS, MD (General Medicine), DNB (Nephrology), MNAMS",
    specialization: "Glomerular Diseases, Chronic Kidney Disease (CKD), Peritoneal Dialysis (CAPD)",
    experience_years: 15,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-211",
    registration_no: "TNMC-52390",
    image: drShanthiImg,
    bio: "Senior Consultant Nephrologist dedicated to early detection of kidney disease, resistant hypertension, lupus nephritis, and home-based peritoneal dialysis management programs.",
    opd_timing: "10:00 AM - 02:00 PM & 04:00 PM - 06:30 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 290,
    awards: ["Women in Nephrology Leadership Honor", "Distinction in Glomerular Disease Research"],
    procedures: ["Automated & Continuous Ambulatory Peritoneal Dialysis (CAPD)", "Temporary & Permcath Dialysis Access", "Kidney Stone Metabolic Workup", "Pre-Transplant Immunological Profiling"],
    memberships: ["Indian Society of Nephrology (ISN)", "International Society of Peritoneal Dialysis (ISPD)"],
    languages: ["English", "Tamil", "Telugu"]
  },

  // 7. GASTROENTEROLOGY & HEPATOLOGY (2 Doctors)
  {
    id: 13,
    full_name: "Dr. Vigneshwaran S",
    email: "dr.vignesh@mediconnect.in",
    phone: "+91 44 2483 3413",
    department: "Gastroenterology",
    qualification: "MBBS, MD, DM (Medical Gastroenterology)",
    specialization: "Therapeutic Endoscopy, Liver Cirrhosis, IBD Care, ERCP",
    experience_years: 11,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-218",
    registration_no: "TNMC-67890",
    image: drVigneshImg,
    bio: "Specialist in advanced diagnostic and therapeutic gastrointestinal endoscopies, ERCP for bile duct calculi, chronic hepatitis, fatty liver disease, and inflammatory bowel disorders.",
    opd_timing: "10:30 AM - 03:00 PM & 05:00 PM - 07:30 PM (All 7 Days)",
    rating: 4.8,
    reviews_count: 198,
    awards: ["Endoscopy Research Fellow (South Korea)", "Young Gastroenterologist Award"],
    procedures: ["Diagnostic & Therapeutic Upper GI Endoscopy", "Colonoscopy & Polypectomy", "ERCP & Stenting", "FibroScan & Liver Biopsy"],
    memberships: ["Indian Society of Gastroenterology (ISG)", "Society of Gastrointestinal Endoscopy of India"],
    languages: ["English", "Tamil"]
  },
  {
    id: 14,
    full_name: "Dr. Saravanan Rathinam",
    email: "dr.saravanan@mediconnect.in",
    phone: "+91 44 2483 3414",
    department: "Gastroenterology",
    qualification: "MBBS, MS (General Surgery), M.Ch (Surgical Gastroenterology), FAIS",
    specialization: "GI Surgical Oncology, Laparoscopic Gallbladder/Hernia, Pancreatic & Liver Surgery",
    experience_years: 17,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-219",
    registration_no: "TNMC-47123",
    image: drSaravananImg,
    bio: "Chief Surgical Gastroenterologist specializing in complex hepatobiliary and pancreatic resections, laparoscopic colorectal surgery, bariatric metabolic procedures, and advanced GI trauma surgery.",
    opd_timing: "09:00 AM - 01:30 PM & 05:00 PM - 07:00 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 365,
    awards: ["Surgical Gastroenterology Gold Medalist", "Pioneer in Advanced Laparoscopic Whipple's"],
    procedures: ["Laparoscopic Cholecystectomy & Appendectomy", "Whipple's Pancreaticoduodenectomy", "Colorectal Cancer Laparoscopic Resection", "Complex Abdominal Wall Hernia Reconstruction"],
    memberships: ["Indian Association of Surgical Gastroenterology (IASG)", "Association of Surgeons of India (ASI)"],
    languages: ["English", "Tamil", "Hindi"]
  },

  // 8. GENERAL MEDICINE & DIABETOLOGY (2 Doctors)
  {
    id: 15,
    full_name: "Dr. Divya Radhakrishnan",
    email: "dr.divya@mediconnect.in",
    phone: "+91 44 2483 3415",
    department: "General Medicine",
    qualification: "MBBS, MD (General Medicine)",
    specialization: "Diabetology, Infectious Diseases, Hypertension & Lifestyle Medicine",
    experience_years: 9,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-101",
    registration_no: "TNMC-74512",
    image: drDivyaImg,
    bio: "Experienced Physician dedicated to preventive health checkups, intensive diabetes titration, hypertension control, fever management, thyroid disorders, and geriatric health.",
    opd_timing: "08:30 AM - 01:00 PM & 04:00 PM - 07:30 PM (All 7 Days)",
    rating: 4.9,
    reviews_count: 360,
    awards: ["State Gold Medalist in Internal Medicine", "Community Health Excellence"],
    procedures: ["Comprehensive Master Health Assessments", "Insulin Titration & CGM Monitoring", "Tropical Infection & Dengue/Typhoid Management", "Adult Immunization & Pre-op Clearance"],
    memberships: ["Association of Physicians of India (API)", "Research Society for the Study of Diabetes in India (RSSDI)"],
    languages: ["English", "Tamil", "Hindi"]
  },
  {
    id: 16,
    full_name: "Dr. R. Senthil Nathan",
    email: "dr.senthil@mediconnect.in",
    phone: "+91 44 2483 3416",
    department: "General Medicine",
    qualification: "MBBS, MD (Internal Medicine), PGDGM (Geriatric Medicine), FICP",
    specialization: "Senior Internal Medicine, Complex Multi-Morbidities, Geriatrics & Hypertension",
    experience_years: 23,
    consultation_fee: 700,
    available_days: "All Days (Mon - Sun)",
    room_number: "OPD-104",
    registration_no: "TNMC-34109",
    image: drSenthilImg,
    bio: "Senior Consultant Physician with over 23 years of hospital leadership. Expert in chronic disease synchronization, multi-drug rationalization for elderly patients, fever of unknown origin (FUO), and preventive wellness.",
    opd_timing: "09:00 AM - 02:00 PM & 04:30 PM - 07:30 PM (All 7 Days)",
    rating: 5.0,
    reviews_count: 620,
    awards: ["Senior Physician of Eminence (API Chennai)", "Distinguished Clinical Service Award"],
    procedures: ["Geriatric Comprehensive Health Assessment", "Management of Multi-Organ Failure & Sepsis", "Hypertension & Dyslipidemia Precision Therapy", "Executive Wellness & Occupational Health Screening"],
    memberships: ["Association of Physicians of India (API)", "Indian Academy of Geriatrics", "Royal College of Physicians (UK) Affiliate"],
    languages: ["English", "Tamil"]
  }
];

export const INITIAL_RECEPTIONISTS: Receptionist[] = [
  {
    id: 1,
    title: 'Ms.',
    first_name: 'Aishwarya',
    last_name: 'Sundaram',
    full_name: 'Ms. Aishwarya Sundaram',
    gender: 'Female',
    email: 'aishwarya.s@mediconnect.in',
    phone: '+91 44 2483 3400 (Ext. 101)',
    shift: 'Morning Shift (07:00 AM - 03:00 PM)',
    desk: 'Main Lobby Registration & Admission Desk',
    languages: ['Tamil', 'English', 'Telugu'],
    experience_years: 6,
    employee_id: 'MDC-REC-0101',
    image: receptionistFemaleImg,
    bio: 'Lead Patient Reception Executive with extensive experience coordinating emergency triage registrations, master health checkup admissions, and VIP patient services.',
    status: 'On Duty'
  },
  {
    id: 2,
    title: 'Mr.',
    first_name: 'Karthik',
    last_name: 'Rajagopal',
    full_name: 'Mr. Karthik Rajagopal',
    gender: 'Male',
    email: 'karthik.r@mediconnect.in',
    phone: '+91 44 2483 3400 (Ext. 102)',
    shift: 'General Day Shift (09:00 AM - 05:30 PM)',
    desk: 'OPD Floor 1 Helpdesk & Token Dispatch',
    languages: ['Tamil', 'English', 'Hindi'],
    experience_years: 5,
    employee_id: 'MDC-REC-0102',
    image: receptionistMaleImg,
    bio: 'Senior Front Desk Officer facilitating doctor consultations scheduling, digital token issuance, multi-specialty queues, and wheelchair escort assistance.',
    status: 'On Duty'
  },
  {
    id: 3,
    title: 'Miss',
    first_name: 'Priya',
    last_name: 'Nandakumar',
    full_name: 'Miss Priya Nandakumar',
    gender: 'Female',
    email: 'priya.n@mediconnect.in',
    phone: '+91 44 2483 3400 (Ext. 103)',
    shift: 'Evening Shift (02:30 PM - 10:00 PM)',
    desk: 'Maternity, NICU & Pediatric Admission Lounge',
    languages: ['Tamil', 'English', 'Malayalam'],
    experience_years: 4,
    employee_id: 'MDC-REC-0103',
    image: receptionistFemaleImg,
    bio: 'Specialized Mother & Child care receptionist guiding expecting parents through painless delivery admissions, birth certificate procedures, and cashless TPA claim desk.',
    status: 'Available'
  },
  {
    id: 4,
    title: 'Mr.',
    first_name: 'Vignesh',
    last_name: 'Anand',
    full_name: 'Mr. Vignesh Anand',
    gender: 'Male',
    email: 'vignesh.a@mediconnect.in',
    phone: '+91 44 2483 3400 (Ext. 104)',
    shift: 'Night Duty & Trauma Ingress (09:30 PM - 07:30 AM)',
    desk: '24/7 Accident & Emergency Casualty Ingress',
    languages: ['Tamil', 'English', 'Telugu', 'Hindi'],
    experience_years: 7,
    employee_id: 'MDC-REC-0104',
    image: receptionistMaleImg,
    bio: 'Emergency Casualty Frontline Coordinator handling night trauma admissions, ambulance dispatch confirmations, MLC records, and critical care ingress.',
    status: 'On Duty'
  }
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 1,
    medicine_name: "Dolo 650",
    generic_name: "Paracetamol",
    category: "Analgesics",
    form: "Tablet",
    strength: "650mg",
    manufacturer: "Micro Labs Ltd",
    unit_price: 2.10,
    stock_quantity: 10000,
    batch_number: "DL-2026-081",
    expiry_date: "2028-06-30",
    hsn_code: "3004"
  },
  {
    id: 2,
    medicine_name: "Augmentin 625 Duo",
    generic_name: "Amoxicillin + Clavulanic Acid",
    category: "Antibiotics",
    form: "Tablet",
    strength: "625mg (500mg+125mg)",
    manufacturer: "GlaxoSmithKline Pharmaceuticals",
    unit_price: 22.40,
    stock_quantity: 10000,
    batch_number: "AUG-2026-X19",
    expiry_date: "2027-11-30",
    hsn_code: "3004"
  },
  {
    id: 3,
    medicine_name: "Pan-D",
    generic_name: "Pantoprazole + Domperidone",
    category: "Gastrointestinal",
    form: "Capsule",
    strength: "40mg + 30mg SR",
    manufacturer: "Alkem Laboratories",
    unit_price: 16.80,
    stock_quantity: 10000,
    batch_number: "PND-2026-88",
    expiry_date: "2028-03-31",
    hsn_code: "3004"
  },
  {
    id: 4,
    medicine_name: "Telma 40",
    generic_name: "Telmisartan",
    category: "Cardiology",
    form: "Tablet",
    strength: "40mg",
    manufacturer: "Glenmark Pharmaceuticals",
    unit_price: 11.20,
    stock_quantity: 10000,
    batch_number: "TLM-2026-44",
    expiry_date: "2028-01-31",
    hsn_code: "3004"
  },
  {
    id: 5,
    medicine_name: "Glycomet-GP 2",
    generic_name: "Metformin + Glimepiride",
    category: "Antidiabetic",
    form: "Tablet",
    strength: "500mg + 2mg",
    manufacturer: "USV Private Limited",
    unit_price: 14.50,
    stock_quantity: 10000,
    batch_number: "GLY-2026-92",
    expiry_date: "2027-10-31",
    hsn_code: "3004"
  },
  {
    id: 6,
    medicine_name: "Ecosprin 75",
    generic_name: "Aspirin",
    category: "Cardiology",
    form: "Tablet",
    strength: "75mg",
    manufacturer: "USV Private Limited",
    unit_price: 0.85,
    stock_quantity: 10000,
    batch_number: "ECO-2026-03",
    expiry_date: "2028-09-30",
    hsn_code: "3004"
  },
  {
    id: 7,
    medicine_name: "Atorva 10",
    generic_name: "Atorvastatin",
    category: "Cardiology",
    form: "Tablet",
    strength: "10mg",
    manufacturer: "Zydus Cadila",
    unit_price: 9.80,
    stock_quantity: 10000,
    batch_number: "ATV-2026-11",
    expiry_date: "2028-04-30",
    hsn_code: "3004"
  },
  {
    id: 8,
    medicine_name: "Montek-LC",
    generic_name: "Montelukast + Levocetirizine",
    category: "Respiratory",
    form: "Tablet",
    strength: "10mg + 5mg",
    manufacturer: "Sun Pharma",
    unit_price: 19.50,
    stock_quantity: 10000,
    batch_number: "MLC-2026-77",
    expiry_date: "2027-12-31",
    hsn_code: "3004"
  },
  {
    id: 9,
    medicine_name: "Clexane 40mg",
    generic_name: "Enoxaparin Sodium",
    category: "Cardiology",
    form: "Injection",
    strength: "40mg / 0.4ml Prefilled Syringe",
    manufacturer: "Sanofi India",
    unit_price: 495.00,
    stock_quantity: 10000,
    batch_number: "CLX-2026-01",
    expiry_date: "2027-08-31",
    hsn_code: "3004"
  },
  {
    id: 10,
    medicine_name: "Neurobion Forte",
    generic_name: "Vitamin B-Complex + B12",
    category: "Neurology",
    form: "Tablet",
    strength: "Forte Multi-B",
    manufacturer: "Procter & Gamble Health",
    unit_price: 3.80,
    stock_quantity: 10000,
    batch_number: "NBF-2026-62",
    expiry_date: "2028-05-31",
    hsn_code: "3004"
  }
];

export const INITIAL_INTERNAL_NOTIFICATIONS: InternalNotification[] = [
  {
    id: 1,
    doctor_id: 1,
    doctor_name: 'Dr. Kavitha Ramanathan',
    department: 'Cardiology',
    patient_id: 1,
    patient_name: 'Karthik Subramanian',
    patient_uhid: 'UHID-2026-0001',
    token_no: 'OPD-CAR-101',
    message: '✅ Patient Karthik Subramanian has paid ₹700.00 OPD Fee. Biological vitals recorded (BP: 130/84 mmHg | Pulse: 74 bpm). Cleared for doctor consultation.',
    recipient_role: 'DOCTOR',
    created_at: '2026-08-15 10:35:00',
    status: 'Read'
  }
];

export const INITIAL_FOLLOW_UP_REMINDERS: FollowUpReminder[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    appointment_no: 'OPD-CAR-101',
    opd_reg_no: 'OPD-2026-CAR-101',
    patient_id: 1,
    patient_name: 'Karthik Subramanian',
    patient_uhid: 'UHID-2026-0001',
    patient_phone: '+91 98840 12345',
    patient_age: 41,
    patient_gender: 'Male',
    patient_location: 'T. Nagar, Chennai',
    doctor_id: 1,
    doctor_name: 'Dr. Kavitha Ramanathan',
    department: 'Cardiology',
    appointment_date: '2026-08-15',
    appointment_time: '10:30 AM',
    time_slot: '10:30 AM - 11:00 AM',
    appointment_type: 'OPD Consultation',
    status: 'Completed',
    symptoms: 'Mild chest discomfort on brisk walking & routine BP check',
    nature_of_health_issue: 'Mild exertional chest tightness & hypertension follow-up',
    source_channel: 'Phone Call (Receptionist Intake)',
    service_category: 'OPD Consultation',
    fee_amount: 700,
    payment_status: 'Paid (Collected by Receptionist)',
    payment_mode: 'UPI',
    receipt_no: 'REC-2026-8801',
    collected_by_receptionist: 'Ms. Aishwarya Sundaram',
    collected_at: '2026-08-15 10:32:00',
    consultation_unlocked: true,
    vitals_recorded: true,
    vitals_summary: 'BP: 130/84 mmHg | Pulse: 74 bpm | Temp: 98.4 °F | SpO2: 99%',
    height_cm: 174,
    weight_kg: 76,
    bmi: 25.1,
    bp: '130/84 mmHg',
    bp_systolic: 130,
    bp_diastolic: 84,
    pulse: 74,
    temperature: '98.4 °F',
    spo2: '99%',
    allergies: 'No known drug allergies (NKDA)',
    medical_history: 'Essential hypertension'
  },
  {
    id: 2,
    appointment_no: 'OPD-OBG-102',
    opd_reg_no: 'OPD-2026-OBG-102',
    patient_id: 2,
    patient_name: 'Priya Sundaram',
    patient_uhid: 'UHID-2026-0002',
    patient_phone: '+91 98401 56789',
    patient_age: 33,
    patient_gender: 'Female',
    patient_location: 'Nungambakkam',
    doctor_id: 5,
    doctor_name: 'Dr. Meenakshi Sundaram',
    department: 'Obstetrics & Gynaecology',
    appointment_date: '2026-09-05',
    appointment_time: '11:00 AM',
    time_slot: '11:00 AM - 11:30 AM',
    appointment_type: 'OPD Consultation',
    status: 'Consultation Completed',
    consultation_completed: true,
    symptoms: 'Routine antenatal trimester review & anomaly scan consultation',
    nature_of_health_issue: 'Second trimester antenatal checkup',
    source_channel: 'Online Portal',
    service_category: 'OPD Consultation',
    fee_amount: 700,
    payment_status: 'Unpaid (Pending at Reception)',
    consultation_unlocked: true,
    vitals_recorded: true,
    vitals_summary: 'BP: 118/76 mmHg | Pulse: 78 bpm | Temp: 98.6 °F | SpO2: 99%',
    height_cm: 162,
    weight_kg: 64,
    bmi: 24.4,
    bp: '118/76 mmHg',
    bp_systolic: 118,
    bp_diastolic: 76,
    pulse: 78,
    temperature: '98.6 °F',
    spo2: '99%',
    allergies: 'Penicillin allergy (skin rash)',
    medical_history: 'Antenatal care 2nd trimester'
  },
  {
    id: 3,
    appointment_no: 'OPD-MED-103',
    opd_reg_no: 'OPD-2026-MED-103',
    patient_id: 3,
    patient_name: 'Rajesh Sharma',
    patient_uhid: 'UHID-2026-0003',
    patient_phone: '+91 98840 98765',
    patient_age: 38,
    patient_gender: 'Male',
    patient_location: 'Vadapalani',
    doctor_id: 15,
    doctor_name: 'Dr. Divya Radhakrishnan',
    department: 'General Medicine',
    appointment_date: '2026-09-05',
    appointment_time: '11:30 AM',
    time_slot: '11:30 AM - 12:00 PM',
    appointment_type: 'OPD Consultation',
    status: 'Scheduled',
    consultation_completed: false,
    symptoms: 'High grade fever with chills and persistent dry cough for 3 days',
    nature_of_health_issue: 'Acute febrile illness with respiratory symptoms',
    source_channel: 'Online Portal',
    service_category: 'OPD Consultation',
    fee_amount: 700,
    payment_status: 'Unpaid (Pending at Reception)',
    consultation_unlocked: true,
    vitals_recorded: true,
    vitals_summary: 'BP: 122/80 mmHg | Pulse: 82 bpm | Temp: 101.2 °F | SpO2: 98%',
    height_cm: 172,
    weight_kg: 71,
    bmi: 24.0,
    bp: '122/80 mmHg',
    bp_systolic: 122,
    bp_diastolic: 80,
    pulse: 82,
    temperature: '101.2 °F',
    spo2: '98%',
    allergies: 'No known drug allergies (NKDA)',
    medical_history: 'No past chronic illness'
  }
];

export const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 1,
    patient_id: 1,
    patient_name: 'Karthik Subramanian',
    patient_uhid: 'UHID-2026-0001',
    doctor_id: 1,
    doctor_name: 'Dr. Kavitha Ramanathan',
    consultation_date: '2026-08-15',
    symptoms: 'Mild chest discomfort on brisk walking',
    diagnosis: 'Stage-1 Essential Hypertension, Mild Atypical Angina (Stable)',
    bp: '130/84 mmHg',
    pulse: 74,
    temperature: '98.4 °F',
    spo2: '99%',
    lab_tests_recommended: 'Lipid Profile, Serum Creatinine, Treadmill Stress Test (TMT)',
    clinical_notes: 'Cardiovascular examination S1, S2 heard normal. No peripheral oedema. Advised low salt diet, daily brisk walking 30 min, and blood pressure monitoring.',
    status: 'Completed',
    appointment_id: 1
  },
  {
    id: 2,
    patient_id: 2,
    patient_name: 'Priya Sundaram',
    patient_uhid: 'UHID-2026-0002',
    doctor_id: 5,
    doctor_name: 'Dr. Meenakshi Sundaram',
    consultation_date: '2026-09-05',
    symptoms: 'Second trimester routine pregnancy checkup & screening',
    diagnosis: 'Intrauterine Gestation 22 Weeks, Normal Fetal Growth & Hemodynamics',
    bp: '118/76 mmHg',
    pulse: 78,
    temperature: '98.6 °F',
    spo2: '99%',
    lab_tests_recommended: 'Complete Blood Count (CBC), Oral Glucose Tolerance Test (OGTT), Urine Routine',
    clinical_notes: 'Fetal heart rate regular at 144 bpm. Fundal height matches dates. Prescribed routine pregnancy micronutrient supplementation. Advised anomaly scan review.',
    status: 'Completed',
    appointment_id: 2
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 1,
    prescription_no: 'RX-2026-0001',
    opd_reg_no: 'OPD-2026-CAR-101',
    patient_id: 1,
    patient_name: 'Karthik Subramanian',
    patient_uhid: 'UHID-2026-0001',
    age: 41,
    gender: 'Male',
    blood_group: 'B+',
    phone: '+91 98840 12345',
    location: 'T. Nagar, Chennai',
    nature_of_health_issue: 'Mild exertional chest discomfort & BP check',
    doctor_id: 1,
    doctor_name: 'Dr. Kavitha Ramanathan',
    department: 'Cardiology',
    doc_reg_no: 'TNMC-44829',
    prescription_date: '2026-08-15',
    diagnosis_summary: 'Stage-1 Essential Hypertension, Mild Atypical Angina',
    advice: 'Follow strict low sodium diet (less than 2g salt/day). Avoid heavy lifting. Review BP twice weekly.',
    follow_up_days: 14,
    medicines: [
      {
        medicine_id: 4,
        medicine_name: 'Telma 40',
        strength: '40mg',
        form: 'Tablet',
        dosage: '1-0-0',
        frequency: 'Once Daily',
        timing: 'Morning After Breakfast',
        duration: '14 Days',
        quantity: 14,
        instructions: 'Take daily in morning with water'
      },
      {
        medicine_id: 6,
        medicine_name: 'Ecosprin 75',
        strength: '75mg',
        form: 'Tablet',
        dosage: '0-1-0',
        frequency: 'Once Daily',
        timing: 'After Lunch',
        duration: '14 Days',
        quantity: 14,
        instructions: 'Take strictly after meals'
      }
    ],
    consultation_fee: 700,
    medicines_fee: 168.7,
    subtotal: 868.7,
    tax_amount: 43.44,
    total_amount: 912.14,
    payment_status: 'Paid'
  },
  {
    id: 2,
    prescription_no: 'RX-2026-0002',
    opd_reg_no: 'OPD-2026-OBG-102',
    patient_id: 2,
    patient_name: 'Priya Sundaram',
    patient_uhid: 'UHID-2026-0002',
    age: 33,
    gender: 'Female',
    blood_group: 'O+',
    phone: '+91 98401 56789',
    location: 'Nungambakkam',
    nature_of_health_issue: 'Second trimester antenatal checkup',
    doctor_id: 5,
    doctor_name: 'Dr. Meenakshi Sundaram',
    department: 'Obstetrics & Gynaecology',
    doc_reg_no: 'TNMC-38910',
    prescription_date: '2026-09-05',
    diagnosis_summary: 'Intrauterine Gestation 22 Weeks, Normal Fetal Growth',
    advice: 'Adequate hydration (2.5L water/day). Left lateral sleeping posture. Mild walking. Avoid unpasteurized dairy.',
    follow_up_days: 28,
    medicines: [
      {
        medicine_id: 11,
        medicine_name: 'Autrin Folic Acid & Iron',
        strength: 'Standard',
        form: 'Capsule',
        dosage: '0-1-0',
        frequency: 'Once Daily',
        timing: 'After Lunch',
        duration: '30 Days',
        quantity: 30,
        instructions: 'Take with lemon juice/water for optimal iron absorption'
      },
      {
        medicine_id: 12,
        medicine_name: 'Shelcal 500 Calcium + D3',
        strength: '500mg',
        form: 'Tablet',
        dosage: '1-0-1',
        frequency: 'Twice Daily',
        timing: 'After Breakfast and Dinner',
        duration: '30 Days',
        quantity: 60,
        instructions: 'Do not take at the same time as iron tablet'
      }
    ],
    consultation_fee: 700,
    medicines_fee: 140.0,
    subtotal: 840.0,
    tax_amount: 42.0,
    total_amount: 882.0,
    payment_status: 'Paid'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 1,
    invoice_no: 'INV-2026-0001',
    patient_id: 1,
    patient_name: 'Karthik Subramanian',
    patient_uhid: 'UHID-2026-0001',
    patient_phone: '+91 98840 12345',
    patient_age: 41,
    patient_location: 'T. Nagar, Chennai',
    opd_reg_no: 'OPD-2026-CAR-101',
    doctor_id: 1,
    doctor_name: 'Dr. Kavitha Ramanathan',
    department: 'Cardiology',
    invoice_date: '2026-08-15',
    consultation_time: '10:30 AM',
    consultation_fee: 700,
    medicine_fee: 168.7,
    lab_fee: 0,
    additional_charges: 200,
    discount_amount: 0,
    tax_amount: 45.0,
    total_amount: 945.0,
    payment_status: 'Paid',
    payment_mode: 'UPI',
    receipt_no: 'REC-2026-8801',
    collected_by: 'Ms. Aishwarya Sundaram (Reception Desk)'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 1,
    receipt_no: 'REC-2026-8801',
    invoice_id: 1,
    patient_name: 'Karthik Subramanian',
    patient_uhid: 'UHID-2026-0001',
    payment_date: '2026-08-15 10:32:00',
    amount_paid: 945.0,
    payment_mode: 'UPI',
    transaction_reference: 'UPI/440819283921/HOSP',
    status: 'Settled'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    user_name: 'Ms. Aishwarya Sundaram',
    action: 'PATIENT_PHONE_CALL_INTAKE',
    entity_type: 'APPOINTMENT',
    ip_address: '192.168.1.10 (Hospital Reception Desk)',
    details: 'Receptionist registered caller Karthik Subramanian, assigned Dr. Kavitha Ramanathan (Cardiology), collected ₹700 fee, and dispatched OPD Registration Pass to +91 98840 12345.',
    created_at: '2026-08-15 10:32:00'
  }
];


