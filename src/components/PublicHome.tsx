import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Doctor } from '../data/hospitalData';
import { AntigravityCanvas } from './AntigravityCanvas';

// Clean AI-Generated Hospital Portfolio Imagery (Unique per Branch & Suite)
import hospitalCampusMainImg from '../assets/images/hospital_campus_main_1788168982516.jpg';
import hospitalExteriorModernImg from '../assets/images/hospital_exterior_modern_1788095019072.jpg';
import hospitalExteriorImg from '../assets/images/hospital_exterior_1788096972533.jpg';
import hospitalBranchExteriorImg from '../assets/images/hospital_branch_exterior_1788169753103.jpg';
import branchFertilityImg from '../assets/images/branch_fertility_exterior_1788169771963.jpg';
import branchScansImg from '../assets/images/branch_scans_exterior_1788169783779.jpg';
import ctScanSuiteImg from '../assets/images/ct_scan_radiology_suite_1788169725217.jpg';
import deluxeRoomImg from '../assets/images/deluxe_inpatient_room_1788169738976.jpg';
import cardiacIcuImg from '../assets/images/cardiac_icu_cathlab_1788095048741.jpg';
import roboticSurgeryImg from '../assets/images/robotic_surgery_theatre_1788095034011.jpg';
import dialysisImg from '../assets/images/dialysis_nephrology_clean_1788168998582.jpg';
import maternityCareImg from '../assets/images/maternity_neonatal_care_1788095076616.jpg';
import cardiologySurgeryImg from '../assets/images/cardiology_surgery_1788097009088.jpg';
import patientRecoveryImg from '../assets/images/patient_recovery_care_1788097023074.jpg';
import preventiveWellnessImg from '../assets/images/preventive_wellness_hero_1788169712548.jpg';
import digitalXraySuiteImg from '../assets/images/digital_xray_room_1788252633079.jpg';

interface PublicHomeProps {
  doctors: Doctor[];
  onOpenBooking: () => void;
  onOpenLogin: (category?: 'STAFF' | 'PATIENT') => void;
  onBookAppointmentDirect?: (apptData: any) => Promise<{ success: boolean; appointment_no?: string; error?: string }>;
  onViewDoctorDetail?: (doctor: Doctor) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  doctors,
  onOpenBooking,
  onOpenLogin,
  onBookAppointmentDirect,
  onViewDoctorDetail
}) => {
  // Quick Booking Form States
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickDept, setQuickDept] = useState('Cardiology');
  const [quickDoctorId, setQuickDoctorId] = useState<number>(doctors[0]?.id || 1);
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<{
    token: string;
    doctor: string;
    dept: string;
    phone: string;
  } | null>(null);

  // Selected Branch Modal & Carousel
  const [branchIndex, setBranchIndex] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [branchMapModal, setBranchMapModal] = useState<any | null>(null);

  // Selected Centre of Excellence Modal
  const [selectedCentre, setSelectedCentre] = useState<any | null>(null);
  const [isIpdFormOpen, setIsIpdFormOpen] = useState(false);
  const [ipdTargetCentre, setIpdTargetCentre] = useState<any | null>(null);
  const [ipdSubmittedDocket, setIpdSubmittedDocket] = useState<any | null>(null);

  // IPD Admission Form State
  const [ipdPatientName, setIpdPatientName] = useState('');
  const [ipdPatientPhone, setIpdPatientPhone] = useState('');
  const [ipdPatientAge, setIpdPatientAge] = useState('45');
  const [ipdPatientGender, setIpdPatientGender] = useState('Male');
  const [ipdCity, setIpdCity] = useState('Chennai');
  const [ipdCategory, setIpdCategory] = useState('Elective Major Surgery');
  const [ipdRoomPref, setIpdRoomPref] = useState('Single Deluxe Room (AC)');
  const [ipdPaymentMode, setIpdPaymentMode] = useState('Cashless Insurance / Corporate TPA');
  const [ipdClinicalNote, setIpdClinicalNote] = useState('');
  const [ipdTermsAccepted, setIpdTermsAccepted] = useState(false);

  // Testimonials Carousel
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [selectedReviewModal, setSelectedReviewModal] = useState<any | null>(null);

  // Hospital Portfolio State & Gallery Items
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [portfolioFilter, setPortfolioFilter] = useState('All');
  const [selectedPortfolioModal, setSelectedPortfolioModal] = useState<any | null>(null);

  // Doctors Filter Tab & Carousel
  const [doctorIndex, setDoctorIndex] = useState(0);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Selected Doctor Profile Modal
  const [activeDoctorModal, setActiveDoctorModal] = useState<Doctor | null>(null);

  // 1. Hospital Branches & Locations (Unique High-Quality Imagery for each Location)
  const branches = [
    {
      id: 'vadapalani',
      name: 'VADAPALANI',
      tagline: 'Main Tertiary Care Multispeciality & 24/7 Trauma Casualty',
      image: hospitalCampusMainImg,
      address: '1/1, Arunachalam Road, Vadapalani, Chennai, Tamil Nadu 600026',
      phone: '+91 44 2483 3444 / 1066',
      hours: '24 Hours Emergency & 08:30 AM - 08:30 PM OPD',
      specialties: ['Cardiac Sciences & Cath Lab', 'Robotic Joint Replacement', 'Neuro-Spine Surgery', 'Level-III NICU', 'Dialysis Unit'],
      mapQuery: 'MediConnect+Hospital+Vadapalani+Chennai'
    },
    {
      id: 'nungambakkam',
      name: 'NUNGAMBAKKAM',
      tagline: 'Liver Care, Hepatobiliary & Daycare Surgical Centre',
      image: hospitalExteriorModernImg,
      address: 'No. 24, College Road, Nungambakkam, Chennai, Tamil Nadu 600006',
      phone: '+91 44 2827 7788',
      hours: '08:00 AM - 08:00 PM (Monday - Saturday)',
      specialties: ['Liver & Kidney Care', 'Digestive Health', 'Day Care Laparoscopy', 'Executive Health Checkups'],
      mapQuery: 'MediConnect+Hospital+Nungambakkam+Chennai'
    },
    {
      id: 'nagercoil',
      name: 'NAGERCOIL',
      tagline: 'Super Speciality Healthcare Centre & Advanced Diagnostics',
      image: hospitalExteriorImg,
      address: 'Cape Road, Near Collectorate, Nagercoil, Kanyakumari, Tamil Nadu 629001',
      phone: '+91 4652 232 444',
      hours: '08:30 AM - 08:00 PM Daily',
      specialties: ['Cardiology Consultations', 'Orthopaedics & Spine', 'Dialysis Centre', 'Digital Imaging'],
      mapQuery: 'MediConnect+Hospital+Nagercoil'
    },
    {
      id: 'tirunelveli',
      name: 'TIRUNELVELI',
      tagline: 'Comprehensive Hospital & Regional Critical Care Facility',
      image: hospitalBranchExteriorImg,
      address: 'South Bypass Road, Vannarpettai, Tirunelveli, Tamil Nadu 627003',
      phone: '+91 462 250 1234',
      hours: '24 Hours Emergency & Outpatient Services',
      specialties: ['Trauma & Emergency', 'Mother & Child Care', 'Critical Care ICU', 'General Medicine'],
      mapQuery: 'MediConnect+Hospital+Tirunelveli'
    },
    {
      id: 'fertility',
      name: "MEDICONNECT FERTILITY & WOMEN'S CARE",
      tagline: 'State-of-the-art IVF, Reproductive Medicine & High-Risk Maternity',
      image: branchFertilityImg,
      address: '10, Jawaharlal Nehru Salai, Vadapalani, Chennai, Tamil Nadu 600026',
      phone: '+91 44 2483 3450',
      hours: '08:00 AM - 06:30 PM (Mon - Sat)',
      specialties: ['IVF / ICSI Technology', 'High-Risk Pregnancy', 'Fetal Medicine', 'Laparoscopic Gynaecology'],
      mapQuery: 'MediConnect+Fertility+Vadapalani+Chennai'
    },
    {
      id: 'scans',
      name: 'RAJIV SCANS & IMAGING',
      tagline: 'Advanced 128-Slice CT, 3T Digital MRI & High-Frequency Ultrasound',
      image: branchScansImg,
      address: 'Arunachalam Road Opp. Main Hospital, Vadapalani, Chennai 600026',
      phone: '+91 44 2483 9900',
      hours: '24x7 Diagnostic Scanning Services',
      specialties: ['128-Slice CT Angio', '3 Tesla MRI', 'Digital Mammography', 'Color Doppler & 4D Echo'],
      mapQuery: 'Rajiv+Scans+Vadapalani+Chennai'
    },
    {
      id: 'diagnostics',
      name: 'MEDICONNECT DIAGNOSTICS INTERNATIONAL',
      tagline: 'NABL Accredited Fully Automated Reference Laboratory',
      image: ctScanSuiteImg,
      address: 'MediConnect Tower, Vadapalani, Chennai 600026',
      phone: '+91 7699997000',
      hours: '24x7 Sample Collection & Home Visit',
      specialties: ['Molecular Biology', 'Histopathology', 'Biochemistry & Immunoassays', 'Microbiology'],
      mapQuery: 'MediConnect+Diagnostics+Vadapalani+Chennai'
    }
  ];

  // 2. Centres of Excellence
  const centresOfExcellence = [
    {
      id: 1,
      title: 'Advanced Cardiac Sciences, Cardiac Stenting & Cardiothoracic Surgery',
      badgeColor: 'bg-[#f58220]',
      icon: 'fa-heart-pulse',
      leadDoctor: 'Dr. Kavitha Ramanathan, MD, DM (Cardiology)',
      desc: 'Round-the-clock digital Cath Lab, primary coronary angioplasty (PCI), fractional flow reserve (FFR), pacemaker implantations, and adult & paediatric cardiothoracic bypass surgeries.'
    },
    {
      id: 2,
      title: 'Critical Care & Intensive Care Unit (ICU)',
      badgeColor: 'bg-[#002a54]',
      icon: 'fa-stethoscope',
      leadDoctor: 'Dr. Rajesh Kumar, MD (Critical Care & Anaesthesiology)',
      desc: 'Multidisciplinary 40-bed level-III ICU equipped with advanced Hamilton mechanical ventilators, invasive haemodynamic monitoring, continuous renal replacement therapy (CRRT), and 24/7 intensivist coverage.'
    },
    {
      id: 3,
      title: 'Liver Care, Hepatobiliary & Transplant Surgery (Liver & Kidney Transplantation)',
      badgeColor: 'bg-[#002a54]',
      icon: 'fa-hand-holding-heart',
      leadDoctor: 'Dr. Vignesh Sundaram, MD, DM (Gastroenterology)',
      desc: 'Comprehensive management of chronic liver disease, living & deceased donor liver and kidney transplantation, therapeutic ERCP, and complex GI oncology resections.'
    },
    {
      id: 4,
      title: 'Orthopaedics, Robotic Joint Replacement & Sports Injuries',
      badgeColor: 'bg-[#f58220]',
      icon: 'fa-bone',
      leadDoctor: 'Dr. Suresh Kumar Natarajan, MS, M.Ch (Ortho)',
      desc: 'Computer-navigated robotic total knee and hip arthroplasty, arthroscopic ligament reconstructions (ACL/PCL), pediatric orthopaedics, and poly-trauma stabilization.'
    },
    {
      id: 5,
      title: 'Neurosciences – Brain & Spine Surgery',
      badgeColor: 'bg-[#f58220]',
      icon: 'fa-brain',
      leadDoctor: 'Dr. Aravind Swaminathan, M.Ch (Neurosurgery)',
      desc: 'Microscopic and endoscopic brain tumour resections, minimally invasive keyhole spine surgeries, aneurysm clipping, and specialized neuro-trauma intensive care.'
    },
    {
      id: 6,
      title: 'Obstetrics & Gynaecology & Natural Birthing',
      badgeColor: 'bg-[#002a54]',
      icon: 'fa-person-breastfeeding',
      leadDoctor: 'Dr. Meenakshi Sundaram, MD, DGO (OB/GYN)',
      desc: 'Dedicated birthing suites, painless labour epidural management, high-risk maternal-fetal medicine, 3D/4D fetal scans, and advanced gynecological laparoscopic surgery.'
    },
    {
      id: 7,
      title: 'Neonatal Intensive Care Unit (NICU)',
      badgeColor: 'bg-[#002a54]',
      icon: 'fa-baby',
      leadDoctor: 'Dr. Sangeetha Vijay, MD (Paediatrics), DNB (Neonatology)',
      desc: 'Level-III tertiary neonatal unit with high-frequency oscillatory ventilators, nitric oxide therapy, total body cooling for birth asphyxia, and specialized preterm infant incubators.'
    },
    {
      id: 8,
      title: 'Advanced Neuro Stroke Care & Mechanical Thrombectomy',
      badgeColor: 'bg-[#f58220]',
      icon: 'fa-wave-square',
      leadDoctor: 'Dr. Aravind Swaminathan & Emergency Stroke Team',
      desc: '24/7 hyper-acute stroke pathway, intravenous thrombolysis within the golden window, endovascular mechanical thrombectomy, and comprehensive neuro-rehabilitation.'
    }
  ];

  // 3. Patient Testimonials
  const testimonials = [
    {
      id: 1,
      author: 'Thuya Aravinth',
      avatarLetter: 'T',
      avatarBg: 'bg-slate-700',
      reviewsCount: '3 reviews',
      rating: 5,
      timeAgo: '1 week ago',
      content: 'I underwent IVF treatment at MediConnect in 2023, and the care provided by the fertility doctors and nursing staff was phenomenal. The doctors explain every step patiently and the laboratory standards are top notch. Today we are blessed with healthy twins.',
      department: 'Fertility & Obstetrics'
    },
    {
      id: 2,
      author: 'Mohan A',
      avatarLetter: 'M',
      avatarBg: 'bg-amber-600',
      reviewsCount: '5 reviews',
      rating: 5,
      timeAgo: '2 days ago',
      content: 'Best NICU in Chennai at MediConnect. High-tech equipment and the doctors took exceptional care of our premature baby. The nurses are attentive 24/7 and treat every newborn like their own child. Forever grateful to Dr. Sangeetha and the team.',
      department: 'Neonatal ICU (NICU)'
    },
    {
      id: 3,
      author: 'Selvapriya Selvapriya',
      avatarLetter: 'S',
      avatarBg: 'bg-rose-700',
      reviewsCount: '3 reviews',
      rating: 5,
      timeAgo: '2 months ago',
      content: 'I am very happy with NICU and Maternity care at MediConnect, headed by experienced senior doctors who guide you with utmost compassion. Clean rooms, hygienic environment, and very reasonable transparent billing.',
      department: 'Maternity & Child Health'
    },
    {
      id: 4,
      author: 'Dr. Rajesh Kumar',
      avatarLetter: 'R',
      avatarBg: 'bg-indigo-700',
      reviewsCount: '8 reviews',
      rating: 5,
      timeAgo: '3 weeks ago',
      content: 'As a practicing physician myself, I entrusted my father’s complex coronary angioplasty to MediConnect’s cardiac team. The digital Cath Lab procedure was executed with clinical precision and zero complications. Truly 35 years of trusted excellence.',
      department: 'Cardiology & Cath Lab'
    },
    {
      id: 5,
      author: 'Ananya Subramanian',
      avatarLetter: 'A',
      avatarBg: 'bg-emerald-700',
      reviewsCount: '4 reviews',
      rating: 5,
      timeAgo: '1 month ago',
      content: 'Robotic knee replacement surgery at MediConnect Orthopaedics helped my 68-year-old mother walk pain-free within 48 hours. Excellent post-op physiotherapy and caring staff.',
      department: 'Orthopaedics & Joint Replacement'
    }
  ];

  // 4. Hospital Portfolio Gallery Items (Matching Real Facility Suites in High Definition)
  const portfolioItems = [
    {
      id: 1,
      title: 'Obstetric Labour & Delivery OT with Radiant Infant Warmer',
      category: 'Maternity & Inpatient',
      badge: 'Labour & Delivery',
      desc: 'Dedicated sterile birthing suite featuring multi-position ergonomic delivery table, ceiling scialytic surgical spotlight, neonatal infant radiant warmer, and continuous cardiotocography (CTG) fetal monitoring.',
      specs: ['Giraffe Infant Warmer', 'Painless Epidural Integration', 'High-Risk Resuscitation Station', 'Sterile Laminar Airflow'],
      image: maternityCareImg
    },
    {
      id: 2,
      title: 'Deluxe Inpatient Suite with Teakwood Panelling & Motorized Bed',
      category: 'Maternity & Inpatient',
      badge: 'Inpatient Suites',
      desc: 'Spacious climate-controlled executive patient room with motorized 5-function Fowler bed, dedicated companion lounger armchair, entertainment console, wardrobe, and 24/7 centralized nurse call intercom.',
      specs: ['5-Function Electric Bed', 'Attendant Daybed & Sofa', 'En-Suite Bathroom', 'Oxygen & Suction Port Panel'],
      image: deluxeRoomImg
    },
    {
      id: 3,
      title: 'Siemens Somatom 128-Slice High-Precision CT Scanner Suite',
      category: 'Radiology & Scans',
      badge: 'Advanced Imaging',
      desc: 'Ultra-low radiation dose high-speed cardiac, vascular, and whole-body computed tomography with automated contrast injectors and sub-millimeter isotropic resolution at Rajiv Scans & Diagnostic Imaging.',
      specs: ['128-Slice Sub-Second Rotation', 'Dual-Energy Scanning', 'CARE Dose4D Low Radiation', '3D Angiography Post-Processing'],
      image: ctScanSuiteImg
    },
    {
      id: 4,
      title: 'Class-100 Laminar Flow Modular Surgical Operating Theatre',
      category: 'Operation Theatres & ICU',
      badge: 'Modular OT',
      desc: 'State-of-the-art sterile surgical theater with multi-arm LED scialytic surgical lamps, advanced Dräger anaesthesia workstation, anti-static flooring, and computer navigation for robotic joint replacements.',
      specs: ['Class-100 HEPA Filtration', 'Multi-Arm Shadowless LED Lights', 'Integrated Anaesthesia Workstation', 'Laparoscopy 4K Video Tower'],
      image: roboticSurgeryImg
    },
    {
      id: 5,
      title: 'Intensive Care Unit (ICU) & Post-Operative Critical Care Bay',
      category: 'Operation Theatres & ICU',
      badge: 'Critical Care',
      desc: 'Multi-bed high-dependency critical care bay with advanced motorized ICU beds, overhead medical gas pipelines, continuous multiparameter hemodynamics, invasive mechanical ventilators, and 1:1 nursing ratios.',
      specs: ['Multiparameter Vital Monitors', 'Invasive & Non-Invasive Ventilators', 'Central Nursing Station Feed', 'Motorized Multi-Position Beds'],
      image: cardiacIcuImg
    },
    {
      id: 6,
      title: 'Digital Radiography / X-Ray Suite with BUCKX Examination Table',
      category: 'Radiology & Scans',
      badge: 'Digital X-Ray',
      desc: 'High-frequency digital fluoroscopy and radiography suite with motorized BUCKX examination table, overhead ceiling-suspended X-ray tube crane, and vertical chest Bucky stand for instant crystal-clear digital images.',
      specs: ['High-Frequency Generator', 'Motorized Floating BUCKX Table', 'Vertical Chest Bucky Stand', 'Instant PACS Network Archiving'],
      image: digitalXraySuiteImg
    },
    {
      id: 7,
      title: 'Private Inpatient Recovery Ward with Window Ventilation',
      category: 'Maternity & Inpatient',
      badge: 'Recovery Ward',
      desc: 'Comfortable private inpatient recovery room equipped with modern multi-position patient bed, dedicated privacy partition curtains, direct medical gas connections, and natural lighting for peaceful healing.',
      specs: ['Ergonomic Semi-Fowler Bed', 'Privacy Acoustic Curtains', 'Centralized Oxygen & Vacuum Outlets', 'Dedicated Nursing Call Bell'],
      image: patientRecoveryImg
    },
    {
      id: 8,
      title: 'Interventional C-Arm Fluoroscopy Minor OT & Daycare Theatre',
      category: 'Operation Theatres & ICU',
      badge: 'Interventional Suite',
      desc: 'Specialized interventional daycare surgical suite with high-resolution mobile C-Arm fluoroscopy unit, radiolucent carbon-fiber operating table, and precision electrocautery for orthopaedic and pain interventions.',
      specs: ['Mobile High-Res C-Arm Unit', 'Carbon-Fiber Radiolucent Table', 'Real-Time Fluoroscopy Monitor', 'Daycare Surgical Monitoring'],
      image: cardiologySurgeryImg
    },
    {
      id: 9,
      title: 'NABL-Accredited Automated Clinical Biochemistry & Pathology Lab',
      category: 'Diagnostic Labs & Dialysis',
      badge: 'Central Lab',
      desc: 'Automated high-throughput biochemistry analyzers, immunoassay systems, digital haematology counters, and refrigerated centrifuges delivering rapid 30-minute critical test turnarounds with barcoded chain-of-custody.',
      specs: ['Fully Automated Analyzers', 'Integrated LIMS Reporting', 'Temperature-Controlled Sample Stations', 'Biochemical & Immuno Tests'],
      image: branchScansImg
    },
    {
      id: 10,
      title: '24x7 Hemodialysis Suite with Ultra-Pure RO Water Plant',
      category: 'Diagnostic Labs & Dialysis',
      badge: 'Renal Dialysis',
      desc: 'Advanced Fresenius computerized hemodialysis machines with individual touch-screen parameters, isolated hepatitis suites, high-flux biocompatible dialyzers, and continuous nephrologist supervision.',
      specs: ['Fresenius 4008/5008 Series', 'Multi-Stage RO Water Purification', 'Individual Patient Entertainment', 'Dedicated Infection Isolation'],
      image: dialysisImg
    }
  ];

  // Quick Booking Form Submit
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !quickPhone.trim()) {
      alert('Please enter your name and 10-digit mobile number.');
      return;
    }

    setIsSubmittingQuick(true);
    const selectedDoc = doctors.find((d) => d.id === Number(quickDoctorId)) || doctors[0];

    const today = new Date();
    today.setDate(today.getDate() + 1);
    const dateStr = today.toISOString().split('T')[0];

    if (onBookAppointmentDirect) {
      const res = await onBookAppointmentDirect({
        patient_name: quickName,
        patient_phone: quickPhone,
        doctor_id: selectedDoc.id,
        doctor_name: selectedDoc.full_name,
        department: selectedDoc.department,
        appointment_date: dateStr,
        appointment_time: '10:00 AM',
        symptoms: 'Scheduled via MediConnect Top Booking Ribbon'
      });

      setIsSubmittingQuick(false);

      if (res.success) {
        setBookingSuccessModal({
          token: res.appointment_no || 'MC-OPD-TOKEN',
          doctor: selectedDoc.full_name,
          dept: selectedDoc.department,
          phone: quickPhone
        });
        setQuickName('');
        setQuickPhone('');
      } else {
        alert(res.error || 'Could not schedule appointment.');
      }
    } else {
      setIsSubmittingQuick(false);
      onOpenBooking();
    }
  };

  const filteredDoctors =
    selectedDeptFilter === 'All'
      ? doctors
      : doctors.filter((d) => d.department.toLowerCase().includes(selectedDeptFilter.toLowerCase()));

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans">
      
      {/* =========================================================================
          SECTION 1: HORIZONTAL QUICK APPOINTMENT BOOKING RIBBON
          ========================================================================= */}
      <motion.section
        id="book-appointment"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-[#003876] text-white py-5 px-4 sm:px-6 relative shadow-inner"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#f58220] animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Direct OPD Specialist Scheduling
            </span>
          </div>
          <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
            
            {/* Field 1: Name */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-white mb-1.5">
                Patient Name
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-medium placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#f58220] shadow-sm"
                required
              />
            </div>

            {/* Field 2: Mobile Number with India Flag */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-white mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-1 px-3 py-2.5 bg-slate-100 border-r border-slate-200 text-xs font-bold text-slate-700 flex-shrink-0">
                  <span>🇮🇳 +91</span>
                </div>
                <input
                  type="tel"
                  placeholder="10 digit number"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none"
                  required
                />
              </div>
            </div>

            {/* Field 3: Department */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-white mb-1.5">
                Specialty
              </label>
              <select
                value={quickDept}
                onChange={(e) => {
                  setQuickDept(e.target.value);
                  const matching = doctors.filter((d) =>
                    d.department.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  if (matching.length > 0) setQuickDoctorId(matching[0].id);
                }}
                className="w-full px-3 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#f58220] shadow-sm"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology & Spine</option>
                <option value="Orthopaedics">Orthopaedics</option>
                <option value="Obstetrics & Gynaecology">Obstetrics & Gynae</option>
                <option value="Paediatrics">Paediatrics & NICU</option>
                <option value="Nephrology">Nephrology & Dialysis</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>

            {/* Field 4: Doctor */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-white mb-1.5">
                Doctor
              </label>
              <select
                value={quickDoctorId}
                onChange={(e) => setQuickDoctorId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#f58220] shadow-sm truncate"
              >
                {doctors
                  .filter((d) => !quickDept || d.department.toLowerCase().includes(quickDept.toLowerCase()))
                  .map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.full_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Field 5: Book Appointment Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={isSubmittingQuick}
                className="w-full py-2.5 px-4 bg-[#f58220] hover:bg-[#e07113] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <i className="fa-regular fa-calendar-check"></i>
                <span>{isSubmittingQuick ? 'Booking...' : 'Book OPD Slot'}</span>
              </button>
            </div>

          </form>
        </div>
      </motion.section>

      {/* In-Browser Submission Confirmation Dialog Modal */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#002a54]"></div>
            
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3 shadow-xs">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            
            <div className="text-center mb-1">
              <span className="inline-block px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider rounded-full">
                Submitted!
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-center text-slate-900 mb-1 font-display">
              Request Submitted Successfully!
            </h3>
            <p className="text-xs text-center text-slate-500 mb-5 font-medium">
              Your appointment request has been recorded and confirmed in the hospital clinical system.
            </p>
            
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5 text-xs border border-slate-200/80 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Appointment Token:</span>
                <span className="font-mono font-black text-[#e66c00] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  {bookingSuccessModal.token}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Specialist Doctor:</span>
                <span className="font-bold text-slate-900">{bookingSuccessModal.doctor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Department:</span>
                <span className="text-slate-700 font-medium">{bookingSuccessModal.dept}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Contact Phone:</span>
                <span className="font-bold text-slate-900 font-mono">+91 {bookingSuccessModal.phone}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-2.5">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-xs"></i> System Status:
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full text-[11px]">
                  Submitted & Active
                </span>
              </div>
            </div>

            <button
              onClick={() => setBookingSuccessModal(null)}
              className="w-full py-3 bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-check"></i>
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: "Expert Healthcare, Closer To You" (Hospital Locations)
          ========================================================================= */}
      <motion.section
        id="locations"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#e66c00] mb-1">
              Regional Network
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002a54] font-display tracking-tight">
              Expert Healthcare, Closer To You
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
              Explore our state-of-the-art hospitals, specialized surgical daycare centres, and high-tech diagnostic scan suites across Tamil Nadu.
            </p>
          </div>

          {/* Carousel Slider Controls (< and >) */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() =>
                setBranchIndex((prev) => (prev - 1 + branches.length) % branches.length)
              }
              aria-label="Previous branch"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f58220] hover:bg-[#e07113] text-white flex items-center justify-center text-sm shadow-md hover:scale-105 transition cursor-pointer"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <div className="px-4 py-1.5 rounded-full bg-[#002a54] text-white text-xs font-mono font-bold tracking-wider shadow-xs">
              {branchIndex + 1}/{branches.length}
            </div>

            <button
              onClick={() =>
                setBranchIndex((prev) => (prev + 1) % branches.length)
              }
              aria-label="Next branch"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f58220] hover:bg-[#e07113] text-white flex items-center justify-center text-sm shadow-md hover:scale-105 transition cursor-pointer"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* 4-Column Grid / Carousel of Hospital Branch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {branches
            .slice(branchIndex, branchIndex + 4)
            .concat(
              branches.slice(
                0,
                Math.max(0, branchIndex + 4 - branches.length)
              )
            )
            .slice(0, Math.min(4, branches.length))
            .map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Branch Image */}
                <div className="h-44 sm:h-48 overflow-hidden bg-slate-100 relative">
                  <img
                    src={branch.image}
                    alt={branch.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] font-extrabold text-slate-800 px-2 py-0.5 rounded-md shadow-xs">
                    <i className="fa-solid fa-hospital mr-1 text-[#f58220]"></i> Branch
                  </div>
                </div>

                {/* Branch Title & Details */}
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-black text-[#002a54] font-display tracking-tight leading-snug">
                    {branch.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {branch.tagline}
                  </p>
                </div>
              </div>

              {/* Two Action Buttons */}
              <div className="p-5 pt-0">
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setBranchMapModal(branch)}
                    className="py-2 px-3 rounded-xl bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-diamond-turn-right text-[10px]"></i>
                    <span>Directions</span>
                  </button>
                  <button
                    onClick={() => setSelectedBranch(branch)}
                    className="py-2 px-3 rounded-xl bg-[#f58220] hover:bg-[#e07113] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-circle-info text-[10px]"></i>
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Branch Details Modal */}
      {selectedBranch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBranch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
            
            <div className="h-44 rounded-xl overflow-hidden mb-4 relative">
              <img
                src={selectedBranch.image}
                alt={selectedBranch.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <h3 className="text-xl font-black text-white font-display">{selectedBranch.name}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
              {selectedBranch.tagline}
            </p>

            <div className="space-y-3 text-xs mb-5">
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <i className="fa-solid fa-location-dot text-[#f58220] mt-0.5 text-sm flex-shrink-0"></i>
                <div>
                  <div className="font-bold text-slate-900">Address & Landmark:</div>
                  <div className="text-slate-600 mt-0.5">{selectedBranch.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <i className="fa-solid fa-phone text-[#002a54] mt-0.5 text-sm flex-shrink-0"></i>
                <div>
                  <div className="font-bold text-slate-900">Direct Helpline:</div>
                  <div className="font-mono text-slate-700 font-bold mt-0.5">{selectedBranch.phone}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <i className="fa-solid fa-clock text-emerald-600 mt-0.5 text-sm flex-shrink-0"></i>
                <div>
                  <div className="font-bold text-slate-900">Operating Hours:</div>
                  <div className="text-slate-600 mt-0.5">{selectedBranch.hours}</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-1.5">Key Clinical Specialities:</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBranch.specialties.map((spec: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-sky-50 text-sky-800 text-[11px] font-bold rounded-lg border border-sky-200"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedBranch(null);
                  setBranchMapModal(selectedBranch);
                }}
                className="flex-1 py-2.5 bg-[#002a54] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#001d3a] transition cursor-pointer"
              >
                Open Maps Route
              </button>
              <button
                onClick={() => setSelectedBranch(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branch Directions Map Modal */}
      {branchMapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-[#002a54] flex items-center justify-center text-2xl mx-auto mb-3">
              <i className="fa-solid fa-map-location-dot"></i>
            </div>
            <h3 className="text-lg font-black text-[#002a54] font-display mb-1">
              Directions to {branchMapModal.name}
            </h3>
            <p className="text-xs text-slate-600 mb-4">{branchMapModal.address}</p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2 mb-5">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-car text-slate-500"></i>
                <span className="text-slate-700 font-medium">Free 24x7 Valet Parking Available</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-train text-slate-500"></i>
                <span className="text-slate-700 font-medium">5 Mins from Vadapalani Metro Station</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-truck-medical text-rose-500"></i>
                <span className="text-slate-700 font-medium">Dedicated Direct Emergency Ambulance Ramp</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branchMapModal.mapQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
                <span>Open in Google Maps</span>
              </a>
              <button
                onClick={() => setBranchMapModal(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: "35 Years of Hospital Legacy & Clinical Heritage" (Dedicated Legacy Section)
          ========================================================================= */}
      <motion.section
        id="legacy"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24 border-y border-slate-200 relative overflow-hidden"
      >
        <AntigravityCanvas className="opacity-75" />
        <span id="why-sooriya" className="sr-only">Why MediConnect</span>
        <span id="why-mediconnect" className="sr-only">MediConnect Legacy</span>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#e66c00] text-xs font-black uppercase tracking-wider mb-3">
              <i className="fa-solid fa-award text-amber-600"></i>
              <span>1991 – 2026 • 35 Glorious Years</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#002a54] font-display tracking-tight leading-tight">
              35 Years of Healing, Innovation & Trusted Patient Care
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-3">
              Established in Vadapalani in 1991, MediConnect has evolved from a pioneering community surgical center into one of South India's most respected multispeciality tertiary care networks, grounded in ethical medicine and patient-centric compassion.
            </p>
          </div>

          {/* 4 Hero Counters Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center hover:border-[#f58220]/40 transition-colors">
              <div className="text-3xl sm:text-4xl font-black text-[#f58220] font-display">35+</div>
              <div className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-wider">Years of Excellence</div>
              <p className="text-[11px] text-slate-500 mt-1">Continuous clinical service since 1991</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center hover:border-[#f58220]/40 transition-colors">
              <div className="text-3xl sm:text-4xl font-black text-[#002a54] font-display">150,000+</div>
              <div className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-wider">Patients Treated</div>
              <p className="text-[11px] text-slate-500 mt-1">Across Tamil Nadu & international borders</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center hover:border-[#f58220]/40 transition-colors">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-display">50,000+</div>
              <div className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-wider">Safe Deliveries</div>
              <p className="text-[11px] text-slate-500 mt-1">High-risk obstetrics & Level-III NICU</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center hover:border-[#f58220]/40 transition-colors">
              <div className="text-3xl sm:text-4xl font-black text-[#002a54] font-display">NABH & NABL</div>
              <div className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-wider">Gold Accreditations</div>
              <p className="text-[11px] text-slate-500 mt-1">Highest safety & quality standards</p>
            </div>
          </div>

          {/* Historical Milestone Pathway */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
              <h3 className="text-lg sm:text-xl font-black text-[#002a54] font-display">
                Key Milestones In Our Healthcare Journey
              </h3>
              <span className="text-xs font-bold text-[#e66c00]">
                3.5 Decades of Progress
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative">
                <span className="inline-block px-2.5 py-0.5 bg-[#002a54] text-white text-xs font-black rounded-md mb-2">
                  1991
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-display mb-1">
                  The Genesis
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Founded in Vadapalani as a dedicated 50-bed emergency hospital with 24x7 trauma care.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative">
                <span className="inline-block px-2.5 py-0.5 bg-[#f58220] text-white text-xs font-black rounded-md mb-2">
                  2002
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-display mb-1">
                  Cath Lab & NABH
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Commissioned South Chennai's premier digital cardiac catheterization suite & earned NABH status.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative">
                <span className="inline-block px-2.5 py-0.5 bg-[#002a54] text-white text-xs font-black rounded-md mb-2">
                  2012
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-display mb-1">
                  Transplants & NICU
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inaugurated dedicated Renal Transplant program and 20-bed Level-III Neonatal Intensive Care.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative">
                <span className="inline-block px-2.5 py-0.5 bg-[#f58220] text-white text-xs font-black rounded-md mb-2">
                  2019
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-display mb-1">
                  Regional Network
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Expanded regional super-speciality facilities across Nungambakkam, Nagercoil & Tirunelveli.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-orange-300 shadow-2xs relative bg-orange-50/20">
                <span className="inline-block px-2.5 py-0.5 bg-emerald-600 text-white text-xs font-black rounded-md mb-2">
                  2026+
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-display mb-1">
                  Robotics & Smart Care
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Integrated sub-millimeter robotic orthopaedic joint replacement and real-time clinical token workflows.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Institutional Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#f58220] flex items-center justify-center text-xl flex-shrink-0">
                <i className="fa-solid fa-hand-holding-medical"></i>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#002a54] font-display mb-1">
                  Patient-First Clinical Ethics
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Transparent clinical decisions with zero unnecessary procedures. Our faculty follows evidence-based protocols endorsed by national medical boards.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-[#002a54] flex items-center justify-center text-xl flex-shrink-0">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#002a54] font-display mb-1">
                  24/7 Senior Faculty On-Premise
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Round-the-clock emergency casualty, resident cardiologists, intensive care anaesthetists, and trauma surgeons available every hour of the year.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl flex-shrink-0">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#002a54] font-display mb-1">
                  NABH & NABL Quality Assurance
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Rigorous infection control, zero-error medication dispensing, HEPA-filtered laminar airflow operating theatres, and automated pathology suites.
                </p>
              </div>
            </div>
          </div>

        </div>
      </motion.section>

      {/* =========================================================================
          SECTION 4: "Our Centres Of Excellence" (In-Patient Department - IPD)
          ========================================================================= */}
      <motion.section
        id="centres"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20"
      >
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[11px] font-extrabold uppercase tracking-wider text-[#e66c00] mb-2 shadow-2xs">
            <i className="fa-solid fa-bed-pulse"></i>
            <span>Tertiary Specialization • In-Patient Department (IPD)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002a54] font-display tracking-tight">
            Our Centres Of Excellence
          </h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Dedicated multi-disciplinary centres delivering world-class clinical outcomes and surgical innovation.
          </p>
        </div>

        {/* IPD Explanatory Banner */}
        <div className="max-w-4xl mx-auto mb-8 p-4 bg-gradient-to-r from-slate-900 to-[#002a54] text-white rounded-2xl shadow-sm border border-slate-800 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-[#f58220] flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
            <i className="fa-solid fa-circle-info"></i>
          </div>
          <div className="text-xs leading-relaxed space-y-1 flex-1">
            <div className="font-bold text-sm text-white flex flex-wrap items-center justify-between gap-2">
              <span>In-Patient Department (IPD) Clinical Protocol Directive</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#f58220] text-white">24h+ Overnight Stay</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong className="text-white">IPD stands for the In-Patient Department</strong>, which is the section of a hospital where patients are officially admitted to stay overnight or for 24 hours or longer.
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              A major surgery like a kidney transplantation, open-heart bypass, robotic joint replacement, or ICU critical care requires official admission to the hospital and is <strong className="text-amber-300">never performed as an Outpatient Department (OPD) procedure</strong>. Admissions for these centres are coordinated directly through our 24/7 IPD Surgical Pre-Authorization and Bed Management desk.
            </p>
          </div>
        </div>

        {/* 2-Column Pill Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {centresOfExcellence.map((centre) => (
            <button
              key={centre.id}
              onClick={() => setSelectedCentre(centre)}
              className="w-full text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#f58220]/50 transition-all duration-200 flex items-center gap-4 group cursor-pointer"
            >
              {/* Colored Square Badge */}
              <div className={`w-12 h-12 rounded-xl ${centre.badgeColor} text-white flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs`}>
                <i className={`fa-solid ${centre.icon}`}></i>
              </div>

              {/* Title & IPD Designation */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    IPD Surgical & ICU
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Overnight Stay (24h+)</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#002a54] transition-colors leading-snug font-display">
                  {centre.title}
                </h3>
              </div>

              {/* Chevron Arrow */}
              <div className="text-slate-300 group-hover:text-[#f58220] transition-colors flex-shrink-0 pl-2">
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </div>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Centre of Excellence Modal (IPD In-Patient Specialization Only) */}
      {selectedCentre && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedCentre(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl ${selectedCentre.badgeColor} text-white flex items-center justify-center text-xl`}>
                <i className={`fa-solid ${selectedCentre.icon}`}></i>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e66c00] flex items-center gap-1.5">
                  <i className="fa-solid fa-bed-pulse"></i> In-Patient Department (IPD) Specialization
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#002a54] font-display leading-snug">
                  {selectedCentre.title}
                </h3>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-3 text-xs text-slate-700 leading-relaxed space-y-2">
              <p>{selectedCentre.desc}</p>
            </div>

            {/* In-Patient (IPD) Protocol Notice Box */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1 mb-3">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <i className="fa-solid fa-hospital-user text-amber-600"></i>
                <span>In-Patient Department (IPD) Admission Protocol:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Major tertiary surgeries (such as Organ Transplantation, Open-Heart Bypass, Robotic Arthroplasty, or Neuro-Spine Resection) require comprehensive hospital admission (24h+ overnight stay) and are strictly managed under <strong>In-Patient Department (IPD)</strong> admission protocols rather than Outpatient (OPD) visits.
              </p>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 mb-5 text-xs">
              <span className="font-bold text-sky-900 block mb-0.5">Senior Faculty & Surgical Lead:</span>
              <span className="text-sky-800 font-medium">{selectedCentre.leadDoctor}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setIpdTargetCentre(selectedCentre);
                  setSelectedCentre(null);
                  setIsIpdFormOpen(true);
                }}
                className="flex-1 py-2.5 bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                <i className="fa-solid fa-bed-pulse text-[#f58220]"></i>
                <span>Request IPD Surgical Admission</span>
              </button>
              <a
                href="tel:+914424833444"
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <i className="fa-solid fa-phone text-slate-500"></i>
                <span>24x7 IPD Desk</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated In-Patient Department (IPD) Admission & Surgical Evaluation Modal */}
      {isIpdFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsIpdFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-[#002a54] text-[#f58220] flex items-center justify-center text-xl flex-shrink-0">
                <i className="fa-solid fa-bed-pulse"></i>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e66c00]">
                  Hospital In-Patient Department (IPD)
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#002a54] font-display leading-tight">
                  Inpatient Surgical Admission & Pre-Authorization
                </h3>
                <p className="text-xs text-slate-500">
                  Target Centre: <strong className="text-slate-800">{ipdTargetCentre?.title || 'Tertiary Surgical Department'}</strong>
                </p>
              </div>
            </div>

            {/* Inpatient Warning Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 mb-4 flex items-start gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-0.5 flex-shrink-0"></i>
              <div className="text-[11px] leading-relaxed">
                <strong>IPD Overnight Stay Requirement:</strong> Inpatient admissions are for surgical procedures, organ transplantations, and intensive care requiring official overnight stay (24 hours or longer). This is strictly distinct from Outpatient Department (OPD) visits.
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!ipdTermsAccepted) {
                  alert('Please confirm the IPD Inpatient Overnight Admission protocol acknowledgment.');
                  return;
                }
                const randomDocketId = `IPD-ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                setIpdSubmittedDocket({
                  docketId: randomDocketId,
                  patientName: ipdPatientName,
                  phone: ipdPatientPhone,
                  age: ipdPatientAge,
                  gender: ipdPatientGender,
                  city: ipdCity,
                  centreTitle: ipdTargetCentre?.title || 'Tertiary Centre',
                  leadDoctor: ipdTargetCentre?.leadDoctor || 'Senior Surgical Consultant',
                  category: ipdCategory,
                  roomPref: ipdRoomPref,
                  paymentMode: ipdPaymentMode,
                  clinicalNote: ipdClinicalNote,
                  submittedAt: new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                });
                setIsIpdFormOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Balasubramanian S"
                    value={ipdPatientName}
                    onChange={(e) => setIpdPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#002a54]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9840012345"
                    value={ipdPatientPhone}
                    onChange={(e) => setIpdPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#002a54]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Patient Age & Gender *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      placeholder="Age"
                      value={ipdPatientAge}
                      onChange={(e) => setIpdPatientAge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#002a54]"
                    />
                    <select
                      value={ipdPatientGender}
                      onChange={(e) => setIpdPatientGender(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#002a54]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    City / Native Location
                  </label>
                  <input
                    type="text"
                    value={ipdCity}
                    onChange={(e) => setIpdCity(e.target.value)}
                    placeholder="e.g. Chennai / Madurai / International"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#002a54]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Inpatient Admission Category *
                  </label>
                  <select
                    value={ipdCategory}
                    onChange={(e) => setIpdCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#002a54]"
                  >
                    <option value="Elective Major Surgery">Elective Major Surgery</option>
                    <option value="Organ Transplantation (Liver / Kidney)">Organ Transplantation (Liver / Kidney)</option>
                    <option value="Critical Care / Emergency ICU Transfer">Critical Care / Emergency ICU Transfer</option>
                    <option value="Robotic Arthroplasty Joint Replacement">Robotic Arthroplasty Joint Replacement</option>
                    <option value="Complex Neuro-Spine Resection">Complex Neuro-Spine Resection</option>
                    <option value="High-Risk Maternal Birthing & C-Section">High-Risk Maternal Birthing & C-Section</option>
                    <option value="Neonatal ICU (NICU) Preterm Care">Neonatal ICU (NICU) Preterm Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Preferred Room / Accommodation
                  </label>
                  <select
                    value={ipdRoomPref}
                    onChange={(e) => setIpdRoomPref(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#002a54]"
                  >
                    <option value="Single Deluxe Room (AC)">Single Deluxe Room (AC)</option>
                    <option value="Semi-Private Twin Sharing Room">Semi-Private Twin Sharing Room</option>
                    <option value="Executive Presidential Suite">Executive Presidential Suite</option>
                    <option value="General Multi-Bed Ward (Air-Cooled)">General Multi-Bed Ward (Air-Cooled)</option>
                    <option value="Intensive Care Unit (ICU / NICU Bed)">Intensive Care Unit (ICU / NICU Bed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Payment / Insurance Pre-Authorization Mode *
                </label>
                <select
                  value={ipdPaymentMode}
                  onChange={(e) => setIpdPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#002a54]"
                >
                  <option value="Cashless Insurance / Corporate TPA">Cashless Insurance / Corporate TPA</option>
                  <option value="Ayushman Bharat / PM-JAY Scheme">Ayushman Bharat / PM-JAY Scheme</option>
                  <option value="Chief Minister Comprehensive Health Scheme (CMCHIS)">Chief Minister Comprehensive Health Scheme (CMCHIS)</option>
                  <option value="Direct Hospital Settlement / Self-Pay">Direct Hospital Settlement / Self-Pay</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Diagnosis / Surgeon Referral Notes / Symptoms Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Referred for living donor kidney transplant evaluation / Severe aortic stenosis for valve replacement"
                  value={ipdClinicalNote}
                  onChange={(e) => setIpdClinicalNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#002a54]"
                ></textarea>
              </div>

              {/* Mandatory IPD Protocol Checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    required
                    checked={ipdTermsAccepted}
                    onChange={(e) => setIpdTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#002a54] focus:ring-[#002a54] cursor-pointer"
                  />
                  <span className="text-[11px] leading-relaxed">
                    <strong>I understand and acknowledge:</strong> This registration is for an <strong>In-Patient Department (IPD)</strong> surgical or intensive admission requiring an official hospital stay (24h+ overnight stay), and is strictly not an Outpatient Department (OPD) appointment.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIpdFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs shadow-xs flex items-center gap-2"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Submit IPD Admission Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IPD Admission Confirmation Docket Modal */}
      {ipdSubmittedDocket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-xs">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-2xl">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">
                In-Patient Department Admission Docket Generated
              </span>
              <h3 className="text-lg font-black text-slate-900 font-display">
                IPD Pre-Authorization Confirmed
              </h3>
              <div className="font-mono text-xs font-bold text-[#002a54] mt-1 bg-slate-100 px-3 py-1 rounded-full inline-block">
                Docket No: {ipdSubmittedDocket.docketId}
              </div>
            </div>

            <div className="py-4 space-y-2.5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Patient Name:</span>
                  <span className="font-bold text-slate-900">{ipdSubmittedDocket.patientName} ({ipdSubmittedDocket.age}y, {ipdSubmittedDocket.gender})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Specialty Centre:</span>
                  <span className="font-bold text-slate-900 text-right">{ipdSubmittedDocket.centreTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Attending Surgical Lead:</span>
                  <span className="font-bold text-[#002a54] text-right">{ipdSubmittedDocket.leadDoctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Admission Category:</span>
                  <span className="font-bold text-slate-900">{ipdSubmittedDocket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Room Preference:</span>
                  <span className="font-bold text-slate-900">{ipdSubmittedDocket.roomPref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Payment Protocol:</span>
                  <span className="font-bold text-slate-900">{ipdSubmittedDocket.paymentMode}</span>
                </div>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-[11px] text-sky-900 leading-relaxed">
                <strong>Next Step:</strong> Our 24/7 IPD Bed Coordination & TPA Cashless Desk has received this docket. A dedicated patient coordinator will contact you at <strong className="text-slate-900">{ipdSubmittedDocket.phone}</strong> within 15 minutes for admission time, bed allotment, and fasting/pre-operative guidelines.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setIpdSubmittedDocket(null)}
                className="flex-1 py-2.5 bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs rounded-xl transition"
              >
                Close Docket
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-print"></i>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 5: "Care You Can Trust, Experts You Can Rely On" (Testimonials)
          ========================================================================= */}
      <motion.section
        id="testimonials"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-slate-100/70 py-14 sm:py-20 border-y border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#e66c00] mb-1">
              Patient Voices
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002a54] font-display tracking-tight">
              Care You Can Trust, Experts You Can Rely On
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Read verified patient experiences from Google Reviews and hospital feedback.
            </p>
          </div>

          {/* 3 Testimonials Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {testimonials
              .slice(testimonialIndex, testimonialIndex + 3)
              .concat(
                testimonials.slice(
                  0,
                  Math.max(0, testimonialIndex + 3 - testimonials.length)
                )
              )
              .slice(0, 3)
              .map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* User Avatar & Name & Review Count */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${rev.avatarBg} text-white flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                        {rev.avatarLetter}
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                          {rev.author}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">{rev.reviewsCount}</div>
                      </div>
                    </div>

                    {/* Star Rating & Time ago */}
                    <div className="flex items-center gap-2">
                      <div className="flex text-[#f58220] text-xs">
                        {[...Array(rev.rating)].map((_, i) => (
                          <i key={i} className="fa-solid fa-star"></i>
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{rev.timeAgo}</span>
                    </div>

                    {/* Quote Content */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-normal">
                      "{rev.content}"
                    </p>
                  </div>

                  {/* Read More Link */}
                  <div>
                    <button
                      onClick={() => setSelectedReviewModal(rev)}
                      className="text-xs font-bold text-[#f58220] hover:text-[#d46a0e] transition cursor-pointer"
                    >
                      Read Full Review
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() =>
                setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
              }
              aria-label="Previous reviews"
              className="w-10 h-10 rounded-full bg-[#f58220] hover:bg-[#e07113] text-white flex items-center justify-center text-sm shadow-sm transition cursor-pointer"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <div className="px-5 py-1.5 rounded-full bg-[#002a54] text-white text-xs font-mono font-bold tracking-wider shadow-sm">
              {testimonialIndex + 1}/{testimonials.length}
            </div>

            <button
              onClick={() =>
                setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
              }
              aria-label="Next reviews"
              className="w-10 h-10 rounded-full bg-[#f58220] hover:bg-[#e07113] text-white flex items-center justify-center text-sm shadow-sm transition cursor-pointer"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </motion.section>

      {/* Review Read More Modal */}
      {selectedReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedReviewModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-full ${selectedReviewModal.avatarBg} text-white flex items-center justify-center font-bold text-sm`}>
                {selectedReviewModal.avatarLetter}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 font-display">{selectedReviewModal.author}</h4>
                <div className="text-[11px] text-slate-400">{selectedReviewModal.reviewsCount} • {selectedReviewModal.timeAgo}</div>
              </div>
            </div>

            <div className="flex text-[#f58220] text-sm mb-3">
              {[...Array(selectedReviewModal.rating)].map((_, i) => (
                <i key={i} className="fa-solid fa-star"></i>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-5 font-normal">
              "{selectedReviewModal.content}"
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 mb-4 flex justify-between items-center">
              <span>Department:</span>
              <span className="font-bold text-slate-800">{selectedReviewModal.department}</span>
            </div>

            <button
              onClick={() => setSelectedReviewModal(null)}
              className="w-full py-2.5 bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 6: "Our Hospital Portfolio" (HD Facility Suites & Lightbox)
          ========================================================================= */}
      <motion.section
        id="portfolio"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative"
      >
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#e66c00] mb-1">
            <i className="fa-solid fa-hospital-user text-xs"></i>
            <span>World-Class Clinical Infrastructure</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002a54] font-display tracking-tight">
            Our Hospital Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl mx-auto">
            Explore our state-of-the-art modular surgical theatres, ultra-low dose Siemens CT scanners, high-dependency ICUs, and deluxe patient healing suites.
          </p>
        </div>

        {/* Centered Category Filters */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-6 max-w-5xl mx-auto">
          {['All', 'Operation Theatres & ICU', 'Radiology & Scans', 'Maternity & Inpatient', 'Diagnostic Labs & Dialysis'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setPortfolioFilter(cat);
                setPortfolioIndex(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                portfolioFilter === cat
                  ? 'bg-[#002a54] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Centered Carousel Controls */}
        {(() => {
          const filteredPortfolio = portfolioItems.filter((item) =>
            portfolioFilter === 'All' ? true : item.category === portfolioFilter
          );
          const totalItems = filteredPortfolio.length;
          if (totalItems <= 3) return null;
          return (
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={() =>
                  setPortfolioIndex((prev) => (prev - 1 + totalItems) % totalItems)
                }
                aria-label="Previous portfolio suites"
                className="w-10 h-10 rounded-full bg-[#f58220] hover:bg-[#e07113] text-white flex items-center justify-center text-sm shadow-md hover:scale-105 transition cursor-pointer"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <div className="px-4 py-1.5 rounded-full bg-[#002a54] text-white text-xs font-mono font-bold tracking-wider shadow-xs">
                {portfolioIndex + 1}/{totalItems}
              </div>

              <button
                onClick={() =>
                  setPortfolioIndex((prev) => (prev + 1) % totalItems)
                }
                aria-label="Next portfolio suites"
                className="w-10 h-10 rounded-full bg-[#f58220] hover:bg-[#e07113] text-white flex items-center justify-center text-sm shadow-md hover:scale-105 transition cursor-pointer"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          );
        })()}

        {/* Portfolio Gallery Grid */}
        {(() => {
          const filteredPortfolio = portfolioItems.filter((item) =>
            portfolioFilter === 'All' ? true : item.category === portfolioFilter
          );
          const displayedPortfolio = filteredPortfolio
            .slice(portfolioIndex, portfolioIndex + 6)
            .concat(
              filteredPortfolio.slice(
                0,
                Math.max(0, portfolioIndex + 6 - filteredPortfolio.length)
              )
            )
            .slice(0, Math.min(6, filteredPortfolio.length));

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayedPortfolio.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPortfolioModal(item)}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#f58220]/40 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-64 sm:h-72 overflow-hidden bg-slate-100 relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                        />
                        <span className="absolute top-3 left-3 bg-[#002a54]/90 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                          {item.badge}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-bold text-[#002a54] font-display leading-snug mb-2 group-hover:text-[#f58220] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {item.specs.slice(0, 2).map((spec: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="bg-slate-50 text-slate-600 border border-slate-200/80 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            • {spec}
                          </span>
                        ))}
                        {item.specs.length > 2 && (
                          <span className="text-[10px] text-[#e66c00] font-bold self-center ml-1">
                            +{item.specs.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPortfolio.length === 0 && (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  No facility suites found in this category.
                </div>
              )}
            </>
          );
        })()}

        {/* Selected Portfolio Item HD Lightbox Modal */}
        {selectedPortfolioModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-scaleUp">
              {/* Modal Top Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#002a54] to-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="bg-[#f58220] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded">
                    {selectedPortfolioModal.badge}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-[280px] sm:max-w-md">
                    {selectedPortfolioModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPortfolioModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition cursor-pointer"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Modal Body with HD Photo & Specs */}
              <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
                <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner max-h-96">
                  <img
                    src={selectedPortfolioModal.image}
                    alt={selectedPortfolioModal.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover max-h-96"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Facility Overview & Clinical Capability
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {selectedPortfolioModal.desc}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Equipment & Technical Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPortfolioModal.specs.map((spec: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                      >
                        <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  NABH Accredited Tertiary Healthcare Facility
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href="#book-appointment"
                    onClick={() => setSelectedPortfolioModal(null)}
                    className="flex-1 sm:flex-none py-2.5 px-5 bg-[#f58220] hover:bg-[#e07113] text-white font-bold text-xs rounded-xl transition text-center shadow-xs"
                  >
                    Consult Our Specialists
                  </a>
                  <button
                    onClick={() => setSelectedPortfolioModal(null)}
                    className="py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.section>

      {/* =========================================================================
          SECTION 7: FIND A DOCTOR & SPECIALISTS (With Dedicated Profile Pages)
          ========================================================================= */}
      <motion.section
        id="doctors"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-slate-100/70 py-14 sm:py-20 border-t border-slate-200 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Centered Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#e66c00] block mb-1">
              Distinguished Medical Faculty
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002a54] font-display tracking-tight">
              Our Senior Specialists & Surgeons
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Click on any doctor to view their dedicated profile page with full career background, procedures, and clinic schedules.
            </p>
          </div>

          {/* Centered Department Filter Tabs */}
          <div className="flex items-center justify-center flex-wrap gap-2 mb-6 max-w-5xl mx-auto">
            {['All', 'Cardiology', 'Neurology', 'Obstetrics & Gynaecology', 'Orthopaedics', 'Paediatrics', 'Nephrology', 'Gastroenterology', 'General Medicine'].map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDeptFilter(dept);
                  setDoctorIndex(0);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                  selectedDeptFilter === dept
                    ? 'bg-[#002a54] text-white ring-2 ring-[#002a54]/30 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {dept === 'Obstetrics & Gynaecology' ? 'Obstetrics & Gyn' : dept}
              </button>
            ))}
          </div>

          {/* Centered Carousel Slider Controls (< and >) with 1/16 pagination */}
          {(() => {
            const totalDocs = filteredDoctors.length;
            if (totalDocs <= 4) return null;
            return (
              <div className="flex items-center justify-center gap-3 mb-8">
                <button
                  onClick={() =>
                    setDoctorIndex((prev) => (prev - 1 + totalDocs) % totalDocs)
                  }
                  aria-label="Previous doctors"
                  className="w-10 h-10 rounded-full bg-[#f58220] hover:bg-[#e07113] text-white flex items-center justify-center text-sm shadow-md hover:scale-105 transition cursor-pointer"
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

                <div className="px-4 py-1.5 rounded-full bg-[#002a54] text-white text-xs font-mono font-bold tracking-wider shadow-sm">
                  {doctorIndex + 1}/{totalDocs}
                </div>

                <button
                  onClick={() =>
                    setDoctorIndex((prev) => (prev + 1) % totalDocs)
                  }
                  aria-label="Next doctors"
                  className="w-10 h-10 rounded-full bg-[#f58220] hover:bg-[#e07113] text-white flex items-center justify-center text-sm shadow-md hover:scale-105 transition cursor-pointer"
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            );
          })()}

          {/* Doctor Cards Grid with Carousel Window */}
          {(() => {
            const displayedDoctors = filteredDoctors
              .slice(doctorIndex, doctorIndex + 4)
              .concat(
                filteredDoctors.slice(
                  0,
                  Math.max(0, doctorIndex + 4 - filteredDoctors.length)
                )
              )
              .slice(0, Math.min(4, filteredDoctors.length));

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Doctor Portrait Half-Body Upper Frame with uncropped head visibility */}
                      <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                        {doc.image ? (
                          <img
                            src={doc.image}
                            alt={doc.full_name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-[center_6%] group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#002a54] text-white flex items-center justify-center text-4xl font-bold font-display">
                            {doc.full_name.charAt(4) || 'D'}
                          </div>
                        )}
                        <span className="absolute bottom-2.5 left-2.5 bg-[#002a54] text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                          {doc.department}
                        </span>
                        <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          Available
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="text-base font-bold text-slate-900 font-display leading-snug">
                          {doc.full_name}
                        </h3>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {doc.qualification}
                        </div>
                        <div className="text-xs text-[#e66c00] font-bold mt-1.5 flex items-center gap-1">
                          <i className="fa-solid fa-award text-xs"></i>
                          <span>{doc.experience_years}+ Years Clinical Experience</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-1">
                          Reg: {doc.registration_no}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-100 flex flex-col gap-2.5 mt-2">
                      <div className="flex items-center justify-between text-xs pt-2">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OPD Days</div>
                          <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{doc.available_days}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OPD Room</div>
                          <div className="text-xs font-bold text-slate-900">{doc.room_number}</div>
                        </div>
                      </div>

                      {/* Dual Action: Dedicated Doctor Page & Quick Book */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            if (onViewDoctorDetail) {
                              onViewDoctorDetail(doc);
                            } else {
                              setActiveDoctorModal(doc);
                            }
                          }}
                          className="py-2 px-2 bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs rounded-xl transition text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-user-doctor text-[10px]"></i>
                          <span>Full Page</span>
                        </button>
                        <a
                          href="#book-appointment"
                          onClick={() => {
                            setQuickDept(doc.department);
                            setQuickDoctorId(doc.id);
                          }}
                          className="py-2 px-2 bg-[#f58220] hover:bg-[#e07113] text-white font-bold text-xs rounded-xl transition text-center shadow-xs flex items-center justify-center gap-1"
                        >
                          <i className="fa-solid fa-calendar-check text-[10px]"></i>
                          <span>Book Slot</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </motion.section>

      {/* Doctor Quick Profile Modal */}
      {activeDoctorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveDoctorModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-slate-100">
              {activeDoctorModal.image ? (
                <img
                  src={activeDoctorModal.image}
                  alt={activeDoctorModal.full_name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#002a54] text-white flex items-center justify-center font-bold text-xl flex-shrink-0 font-display">
                  {activeDoctorModal.full_name.charAt(4) || 'D'}
                </div>
              )}
              <div>
                <h3 className="text-base font-black text-[#002a54] font-display">{activeDoctorModal.full_name}</h3>
                <div className="text-xs text-slate-600 font-bold">{activeDoctorModal.qualification}</div>
                <div className="text-[11px] text-[#e66c00] font-bold">{activeDoctorModal.department} • {activeDoctorModal.experience_years}+ Yrs Exp</div>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Clinical Biography:</span>
                <span className="text-slate-600 leading-relaxed">{activeDoctorModal.about || 'Senior clinical faculty member dedicated to ethical, precision medical care and patient wellness at MediConnect.'}</span>
              </div>

              <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">OPD Timings:</span>
                <span className="font-mono text-slate-900 font-bold">{activeDoctorModal.opd_timing || '09:30 AM - 01:30 PM'}</span>
              </div>

              <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">OPD Room:</span>
                <span className="text-sm font-black text-slate-900">{activeDoctorModal.room_number}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const doc = activeDoctorModal;
                  setActiveDoctorModal(null);
                  if (onViewDoctorDetail) onViewDoctorDetail(doc);
                }}
                className="py-2.5 px-3 bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <i className="fa-solid fa-user-doctor"></i>
                <span>Full Page View</span>
              </button>
              <a
                href="#book-appointment"
                onClick={() => {
                  setQuickDept(activeDoctorModal.department);
                  setQuickDoctorId(activeDoctorModal.id);
                  setActiveDoctorModal(null);
                }}
                className="flex-1 py-2.5 bg-[#f58220] hover:bg-[#e07113] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <i className="fa-regular fa-calendar-check"></i>
                <span>Book OPD Slot</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 9: MASTER HEALTH PACKAGES
          ========================================================================= */}
      <motion.section
        id="packages"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20"
      >
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#e66c00] block mb-1">
            Preventive Diagnostics
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002a54] font-display tracking-tight">
            Preventive Master Health Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Early screening and wellness diagnostics with verified same-day electronic reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-sky-600 mb-1">Basic Screening</div>
              <h3 className="text-lg font-black text-[#002a54] font-display">Essential Health Profile</h3>
              <div className="text-2xl font-black text-[#f58220] my-3 font-display">₹1,499</div>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Complete Hemogram (CBC + ESR)</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Fasting Blood Sugar & HbA1c</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Lipid Profile (Cholesterol, HDL, LDL)</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Liver Function Test (LFT)</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Kidney Function (Creatinine, Urea)</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> General Physician Consultation</li>
              </ul>
            </div>
            <a
              href="#book-appointment"
              className="w-full py-2.5 bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs rounded-xl text-center transition"
            >
              Book Package
            </a>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-[#f58220] shadow-md relative flex flex-col justify-between">
            <span className="absolute -top-3 right-4 bg-[#f58220] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
              Most Popular
            </span>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#e66c00] mb-1">Cardio-Diabetic Care</div>
              <h3 className="text-lg font-black text-[#002a54] font-display">Master Cardiac & Wellness</h3>
              <div className="text-2xl font-black text-[#f58220] my-3 font-display">₹3,499</div>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> All Essential Profile Tests (60+ Parameters)</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> 12-Lead Resting Digital ECG</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> 2D Echocardiogram with Color Doppler</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> TMT (Treadmill Stress Test)</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Chest X-Ray & Ultrasound Abdomen</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Senior Cardiologist Consultation</li>
              </ul>
            </div>
            <a
              href="#book-appointment"
              className="w-full py-2.5 bg-[#f58220] hover:bg-[#e07113] text-white font-bold text-xs rounded-xl text-center transition shadow-sm"
            >
              Book Cardiac Package
            </a>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-purple-600 mb-1">Comprehensive</div>
              <h3 className="text-lg font-black text-[#002a54] font-display">Executive Whole-Body Check</h3>
              <div className="text-2xl font-black text-[#f58220] my-3 font-display">₹5,999</div>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Full Body Blood & Bio-markers (85+ Tests)</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Cardiac Echo + TMT + ECG</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Thyroid Panel (T3, T4, TSH) & Vitamin D/B12</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Ultrasound Whole Abdomen & Pelvis</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Bone Mineral Densitometry (BMD)</li>
                <li><i className="fa-solid fa-check text-emerald-600 mr-2"></i> Consultations with 3 Specialists + Diet</li>
              </ul>
            </div>
            <a
              href="#book-appointment"
              className="w-full py-2.5 bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs rounded-xl text-center transition"
            >
              Book Executive Package
            </a>
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          SECTION 10: DEEP BLUE CLEAN HOSPITAL FOOTER
          ========================================================================= */}
      <motion.footer
        id="contact"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-[#003876] text-white pt-14 pb-8 border-t border-white/10 relative overflow-hidden"
      >
        
        {/* Subtle Background Watermark Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/15">
            
            {/* Left Column: Brand & Logo */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md relative flex-shrink-0">
                  <i className="fa-solid fa-heart-pulse text-xl text-amber-100"></i>
                </div>
                <div>
                  <div className="text-xl font-black font-display tracking-tight text-white">
                    Medi<span className="text-[#f58220]">Connect</span>
                  </div>
                  <div className="text-[10px] text-white/70 font-semibold tracking-widest uppercase">
                    Multispeciality Hospital
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium text-white/90 leading-relaxed max-w-sm">
                Your Health, Our Priority Anytime, Anywhere
              </p>
              <p className="text-xs text-white/60 leading-relaxed max-w-sm">
                35+ years of clinical excellence in multispeciality tertiary healthcare, trauma surgery, advanced maternal-neonatal care, and diagnostic medicine in Vadapalani, Chennai.
              </p>
            </div>

            {/* Column 2: Patients & Visitors */}
            <div className="lg:col-span-2 space-y-3 text-xs">
              <h4 className="text-sm font-extrabold text-[#f58220] tracking-wide uppercase font-display">
                Patients &amp; Visitors
              </h4>
              <ul className="space-y-2 text-white/80 font-medium">
                <li><a href="#book-appointment" className="hover:text-white transition">Book Appointment</a></li>
                <li><a href="#doctors" className="hover:text-white transition">Find a Doctor</a></li>
                <li><a href="#receptionists" className="hover:text-white transition">Patient Reception Desk</a></li>
                <li><a href="#packages" className="hover:text-white transition">Health Packages</a></li>
                <li><a href="#centres" className="hover:text-white transition">Centres of Excellence</a></li>
                <li><a href="#locations" className="hover:text-white transition">Hospital Locations</a></li>
              </ul>
            </div>

            {/* Column 3: Quick Link */}
            <div className="lg:col-span-2 space-y-3 text-xs">
              <h4 className="text-sm font-extrabold text-[#f58220] tracking-wide uppercase font-display">
                Quick Links
              </h4>
              <ul className="space-y-2 text-white/80 font-medium">
                <li><a href="#why-sooriya" className="hover:text-white transition">About Us</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact Us</a></li>
                <li>
                  <button onClick={() => onOpenLogin('STAFF')} className="hover:text-white transition text-left cursor-pointer">
                    Doctor / Staff Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenLogin('PATIENT')} className="hover:text-white transition text-left cursor-pointer">
                    Patient Portal
                  </button>
                </li>
                <li><a href="#portfolio" className="hover:text-white transition">Hospital Infrastructure</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">Patient Reviews</a></li>
              </ul>
            </div>

            {/* Column 4: 24/7 Accident & Emergency Premium White Box */}
            <div className="lg:col-span-4 md:col-span-2">
              <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/90 space-y-4 text-center relative overflow-hidden max-w-md mx-auto lg:max-w-none">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-[#002a54]"></div>
                
                <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-black uppercase tracking-wider rounded-full shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                  <span>24/7 ROUND THE CLOCK</span>
                </div>

                <div className="text-xl sm:text-2xl font-black text-[#002a54] font-display tracking-tight leading-tight">
                  Accident &amp; Emergency
                </div>

                <div className="p-3.5 sm:p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3 text-left">
                  {/* Row 1: Casualty Toll-Free */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                      Casualty Toll-Free
                    </span>
                    <a
                      href="tel:1066"
                      className="text-sm sm:text-base font-black text-rose-600 font-mono tracking-tight hover:underline flex items-center gap-1.5 bg-rose-50/90 px-2.5 py-1 rounded-lg border border-rose-200/80 shrink-0"
                    >
                      <i className="fa-solid fa-phone-volume text-xs"></i>
                      <span>1066</span>
                    </a>
                  </div>

                  <div className="border-t border-slate-200/80"></div>

                  {/* Row 2: Hospital Central Desk */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-700 whitespace-nowrap">
                      Hospital Central Desk
                    </span>
                    <a
                      href="tel:+914424833444"
                      className="text-xs sm:text-sm font-bold text-slate-900 font-mono hover:text-[#002a54] bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs shrink-0"
                    >
                      +914424833444
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider mb-2.5">Connect with MediConnect</div>
                  <div className="flex items-center justify-center gap-3 text-sm text-[#002a54]">
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#002a54] hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer font-bold text-xs">
                      <i className="fa-brands fa-linkedin-in text-sm"></i>
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#002a54] hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer font-bold text-xs">
                      <i className="fa-brands fa-facebook-f text-sm"></i>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#002a54] hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer font-bold text-xs">
                      <i className="fa-brands fa-instagram text-sm"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Pills Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-white/70">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="mailto:enquiry@mediconnect.in"
                className="px-4 py-1.5 rounded-full border border-white/30 hover:border-white text-white/90 text-xs font-bold transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-envelope text-[#f58220]"></i>
                <span>enquiry@mediconnect.in</span>
              </a>
              <a
                href="tel:+917699997000"
                className="px-4 py-1.5 rounded-full border border-white/30 hover:border-white text-white/90 text-xs font-bold transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-phone text-[#f58220]"></i>
                <span>+91 7699997000</span>
              </a>
            </div>

            <div className="text-[11px] text-white/60 font-medium">
              © 2026 MediConnect Hospital. All Rights Reserved. NABH & NABL Certified.
            </div>
          </div>

        </div>
      </motion.footer>

    </div>
  );
};
