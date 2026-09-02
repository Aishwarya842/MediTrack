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
  department: string;
  assigned_doctor_id?: number;
  assigned_doctor_name?: string;
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
  vitals_summary?: string;
  created_at: string;
  status: 'Unread' | 'Read' | 'Attending';
}

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
  doctor_id: number;
  doctor_name: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  symptoms?: string;
  notes?: string;
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
  patient_id: number;
  patient_name: string;
  patient_uhid: string;
  age: number;
  gender: string;
  blood_group: string;
  doctor_id: number;
  doctor_name: string;
  department: string;
  doc_reg_no: string;
  prescription_date: string;
  diagnosis_summary: string;
  advice: string;
  follow_up_days: number;
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
  patient_id: number;
  patient_name: string;
  patient_uhid: string;
  patient_phone: string;
  doctor_id: number;
  doctor_name: string;
  invoice_date: string;
  consultation_fee: number;
  medicine_fee: number;
  lab_fee: number;
  additional_charges: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: 'Paid' | 'Pending' | 'Partially Paid';
  payment_mode: string;
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

export const INITIAL_PATIENTS: Patient[] = [];

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
    consultation_fee: 850,
    available_days: "Mon, Tue, Wed, Thu, Fri, Sat",
    room_number: "OPD-102",
    registration_no: "TNMC-44829",
    image: drKavithaImg,
    bio: "Senior Interventional Cardiologist with over 18 years of clinical expertise in coronary interventions, transcatheter aortic valve replacements (TAVR), and cardiac intensive CCU management. Trained at Madras Medical College and Fellow of the American College of Cardiology.",
    opd_timing: "09:00 AM - 01:30 PM & 04:30 PM - 07:00 PM",
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
    consultation_fee: 900,
    available_days: "Mon, Wed, Fri",
    room_number: "OPD-103",
    registration_no: "TNMC-36521",
    image: drBalakrishnanImg,
    bio: "Chief of Cardiac Sciences & Electrophysiology with 22+ years of surgical experience. Has performed over 12,000 diagnostic angiographies, complex bifurcation stenting, radiofrequency catheter ablations, and heart failure device implantations.",
    opd_timing: "10:00 AM - 02:00 PM & 05:00 PM - 07:30 PM",
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
    consultation_fee: 950,
    available_days: "Mon, Wed, Fri",
    room_number: "OPD-108",
    registration_no: "TNMC-51204",
    image: drAravindImg,
    bio: "Chief Neurosurgeon specializing in microscopic brain tumour resections, skull-base surgeries, endoscopic spine decompression, and comprehensive acute ischemic stroke management protocols.",
    opd_timing: "10:00 AM - 02:00 PM & 05:00 PM - 07:30 PM",
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
    consultation_fee: 850,
    available_days: "Tue, Thu, Sat",
    room_number: "OPD-109",
    registration_no: "TNMC-57438",
    image: drDeepaImg,
    bio: "Senior Consultant Neurologist leading the 24/7 Hyper-Acute Stroke Response Pathway and Movement Disorder Clinic. Renowned for botulinum toxin therapy for dystonias and advanced video EEG epilepsy evaluations.",
    opd_timing: "09:30 AM - 01:30 PM & 04:30 PM - 07:00 PM",
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
    consultation_fee: 750,
    available_days: "Mon, Tue, Thu, Fri, Sat",
    room_number: "OPD-204",
    registration_no: "TNMC-38910",
    image: drMeenakshiImg,
    bio: "Renowned Obstetrician & Gynaecological Surgeon with 20+ years guiding over 10,000 safe deliveries. Expert in gestational diabetes, high-risk twin pregnancies, robotic hysterectomies, and fertility preservation.",
    opd_timing: "09:30 AM - 01:00 PM & 04:00 PM - 06:30 PM",
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
    consultation_fee: 750,
    available_days: "Mon, Wed, Fri, Sat",
    room_number: "OPD-205",
    registration_no: "TNMC-61092",
    image: drAnanyaImg,
    bio: "Senior Fetal Medicine Specialist and Gynaecologist certified in advanced prenatal screening, intrauterine fetal therapies, recurrent pregnancy loss management, and adolescent gynaecological wellness.",
    opd_timing: "10:00 AM - 02:30 PM",
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
    consultation_fee: 800,
    available_days: "Tue, Thu, Sat",
    room_number: "OPD-115",
    registration_no: "TNMC-49332",
    image: drSureshImg,
    bio: "Head of Orthopaedics & Robotic Joint Replacement. Pioneered sub-millimeter robotic total knee and hip replacements in South India with rapid 48-hour recovery pathways and athletic sports injury reconstruction.",
    opd_timing: "10:00 AM - 02:00 PM & 04:30 PM - 07:00 PM",
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
    consultation_fee: 750,
    available_days: "Mon, Wed, Fri",
    room_number: "OPD-116",
    registration_no: "TNMC-58721",
    image: drKarthikeyanImg,
    bio: "Senior Consultant Orthopaedic & Sports Injury Surgeon. Official consultant to state athletic associations, specialized in keyhole shoulder/knee repairs, meniscus preservation, and multi-fragment fracture fixation.",
    opd_timing: "09:00 AM - 01:00 PM & 05:00 PM - 07:30 PM",
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
    consultation_fee: 650,
    available_days: "Mon, Tue, Wed, Thu, Fri, Sat",
    room_number: "OPD-105",
    registration_no: "TNMC-62419",
    image: drSangeethaImg,
    bio: "Lead Neonatologist & Senior Paediatrician heading our Level-III NICU. Dedicated to premature infant survival, newborn critical care, comprehensive childhood immunizations, and paediatric allergy care.",
    opd_timing: "09:00 AM - 01:30 PM & 05:00 PM - 08:00 PM",
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
    consultation_fee: 600,
    available_days: "Mon, Tue, Thu, Fri",
    room_number: "OPD-106",
    registration_no: "TNMC-69450",
    image: drManojImg,
    bio: "Consultant Paediatrician and Intensive Care Specialist overseeing the Paediatric High-Dependency Unit. Expert in managing severe childhood fevers, respiratory infections, paediatric asthma, and juvenile diabetes.",
    opd_timing: "10:00 AM - 02:00 PM & 04:30 PM - 07:00 PM",
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
    consultation_fee: 850,
    available_days: "Mon, Wed, Fri",
    room_number: "OPD-210",
    registration_no: "TNMC-56781",
    image: drAnandImg,
    bio: "Consultant Nephrologist and Renal Transplant Physician overseeing 24x7 state-of-the-art hemodialysis, peritoneal dialysis, kidney stone prevention, and immunological transplant management.",
    opd_timing: "09:00 AM - 01:00 PM",
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
    consultation_fee: 800,
    available_days: "Tue, Thu, Sat",
    room_number: "OPD-211",
    registration_no: "TNMC-52390",
    image: drShanthiImg,
    bio: "Senior Consultant Nephrologist dedicated to early detection of kidney disease, resistant hypertension, lupus nephritis, and home-based peritoneal dialysis management programs.",
    opd_timing: "10:00 AM - 02:00 PM & 04:00 PM - 06:30 PM",
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
    consultation_fee: 800,
    available_days: "Mon, Thu, Sat",
    room_number: "OPD-218",
    registration_no: "TNMC-67890",
    image: drVigneshImg,
    bio: "Specialist in advanced diagnostic and therapeutic gastrointestinal endoscopies, ERCP for bile duct calculi, chronic hepatitis, fatty liver disease, and inflammatory bowel disorders.",
    opd_timing: "10:30 AM - 03:00 PM",
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
    consultation_fee: 850,
    available_days: "Tue, Wed, Fri",
    room_number: "OPD-219",
    registration_no: "TNMC-47123",
    image: drSaravananImg,
    bio: "Chief Surgical Gastroenterologist specializing in complex hepatobiliary and pancreatic resections, laparoscopic colorectal surgery, bariatric metabolic procedures, and advanced GI trauma surgery.",
    opd_timing: "09:00 AM - 01:30 PM & 05:00 PM - 07:00 PM",
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
    consultation_fee: 500,
    available_days: "Mon, Tue, Wed, Thu, Fri, Sat",
    room_number: "OPD-101",
    registration_no: "TNMC-74512",
    image: drDivyaImg,
    bio: "Experienced Physician dedicated to preventive health checkups, intensive diabetes titration, hypertension control, fever management, thyroid disorders, and geriatric health.",
    opd_timing: "08:30 AM - 01:00 PM & 04:00 PM - 07:30 PM",
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
    consultation_fee: 650,
    available_days: "Mon, Tue, Wed, Thu, Fri, Sat",
    room_number: "OPD-104",
    registration_no: "TNMC-34109",
    image: drSenthilImg,
    bio: "Senior Consultant Physician with over 23 years of hospital leadership. Expert in chronic disease synchronization, multi-drug rationalization for elderly patients, fever of unknown origin (FUO), and preventive wellness.",
    opd_timing: "09:00 AM - 02:00 PM",
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
    stock_quantity: 1250,
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
    stock_quantity: 480,
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
    stock_quantity: 620,
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
    stock_quantity: 850,
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
    stock_quantity: 590,
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
    stock_quantity: 1400,
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
    stock_quantity: 720,
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
    stock_quantity: 340,
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
    stock_quantity: 85,
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
    stock_quantity: 950,
    batch_number: "NBF-2026-62",
    expiry_date: "2028-05-31",
    hsn_code: "3004"
  }
];

export const INITIAL_INTERNAL_NOTIFICATIONS: InternalNotification[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_CONSULTATIONS: Consultation[] = [];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];


