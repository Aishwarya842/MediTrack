import React, { useState, useMemo } from 'react';
import { Patient, Doctor, Appointment, Consultation, Prescription } from '../data/hospitalData';
import { dbService } from '../services/db';

interface ReceptionCallDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  currentUser?: any;
  onConfirmBooking: (bookingData: {
    patientData: Partial<Patient>;
    doctorId: number;
    department: string;
    appointmentDate: string;
    appointmentTime: string;
    timeSlot: string;
    natureOfHealthIssue: string;
    symptoms: string;
    feeAmount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Insurance / TPA';
    sourceChannel: 'Phone Call (Receptionist Intake)';
    isReturningPatient: boolean;
    receptionistName: string;
  }) => Promise<{ success: boolean; appointment?: Appointment; opdRegNo?: string; error?: string }>;
  onViewPrescription?: (patientId: number) => void;
  onOpenReceipt?: (appt: Appointment) => void;
}

// Symptom-to-Department Triage Guide
const SYMPTOM_TRIAGE_GUIDE: { keyword: string; dept: string; label: string }[] = [
  { keyword: 'chest', dept: 'Cardiology', label: 'Chest Pain / Palpitation' },
  { keyword: 'heart', dept: 'Cardiology', label: 'Heart Issue / Blood Pressure' },
  { keyword: 'breath', dept: 'Cardiology', label: 'Breathlessness / Angina' },
  { keyword: 'headache', dept: 'Neurology', label: 'Severe Headache / Migraine' },
  { keyword: 'dizziness', dept: 'Neurology', label: 'Dizziness / Vertigo' },
  { keyword: 'seizure', dept: 'Neurology', label: 'Seizures / Epilepsy' },
  { keyword: 'stroke', dept: 'Neurology', label: 'Stroke / Numbness / Weakness' },
  { keyword: 'bone', dept: 'Orthopaedics', label: 'Bone / Fracture / Trauma' },
  { keyword: 'joint', dept: 'Orthopaedics', label: 'Knee / Joint Pain / Arthritis' },
  { keyword: 'back', dept: 'Orthopaedics', label: 'Spine / Severe Backache' },
  { keyword: 'pregnancy', dept: 'Obstetrics & Gynaecology', label: 'Pregnancy / Antenatal Checkup' },
  { keyword: 'delivery', dept: 'Obstetrics & Gynaecology', label: 'Labour / Maternity Care' },
  { keyword: 'period', dept: 'Obstetrics & Gynaecology', label: 'Menstrual / Gynaec Issue' },
  { keyword: 'child', dept: 'Paediatrics', label: 'Child Health / Growth' },
  { keyword: 'baby', dept: 'Paediatrics', label: 'Infant Care / Vaccination' },
  { keyword: 'kidney', dept: 'Nephrology', label: 'Kidney Stones / Renal Care' },
  { keyword: 'dialysis', dept: 'Nephrology', label: 'Dialysis / Urea / Creatinine' },
  { keyword: 'stomach', dept: 'Gastroenterology', label: 'Stomach Ache / Acidity' },
  { keyword: 'liver', dept: 'Gastroenterology', label: 'Liver / Jaundice / Digestion' },
  { keyword: 'fever', dept: 'General Medicine', label: 'High Fever / Infection / Chills' },
  { keyword: 'diabetes', dept: 'General Medicine', label: 'Sugar / Diabetes Follow-up' },
  { keyword: 'cold', dept: 'General Medicine', label: 'Cold / Cough / Weakness' }
];

export const ReceptionCallDeskModal: React.FC<ReceptionCallDeskModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  appointments,
  consultations,
  prescriptions,
  currentUser,
  onConfirmBooking,
  onOpenReceipt
}) => {
  if (!isOpen) return null;

  const receptionistName = currentUser?.full_name || 'Ms. Aishwarya Sundaram';

  // Step state: 1 = Call Intake & Inquiry, 2 = Doctor Availability & Slots, 3 = Confirmation & Auto-Send Slip
  const [step, setStep] = useState<'INTAKE' | 'SLOTS' | 'CONFIRMED'>('INTAKE');

  // Intake State
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null); // null, true = First Time, false = Returning
  const [searchPhoneQuery, setSearchPhoneQuery] = useState('');
  const [fetchedPatient, setFetchedPatient] = useState<Patient | null>(null);
  const [hasSearchedReturning, setHasSearchedReturning] = useState(false);

  // Form Fields
  const [callerName, setCallerName] = useState('');
  const [callerAge, setCallerAge] = useState<number>(35);
  const [callerGender, setCallerGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [callerPhone, setCallerPhone] = useState('');
  const [callerLocation, setCallerLocation] = useState('');
  const [natureOfHealthIssue, setNatureOfHealthIssue] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Cardiology');

  // Visiting Time & Slot State
  const [visitDate, setVisitDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(doctors[0]?.id || 1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Insurance / TPA'>('UPI');

  // Post-Confirmation State
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);
  const [smsDeliverySent, setSmsDeliverySent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Returning Patient Phone Search
  const handleSearchReturningPatient = (phoneInput: string) => {
    setSearchPhoneQuery(phoneInput);
    setHasSearchedReturning(true);
    const matched = dbService.findPatientByContactOrUhid(patients, phoneInput);
    if (matched) {
      setFetchedPatient(matched);
      setCallerName(matched.full_name);
      setCallerAge(matched.age || 35);
      setCallerGender((matched.gender as any) || 'Prefer not to say');
      setCallerPhone(matched.phone || phoneInput);
      setCallerLocation(matched.location || matched.address || matched.city || 'Chennai');
      if (matched.department) {
        setSelectedDepartment(matched.department);
      }
      setErrorMessage('');
    } else {
      setFetchedPatient(null);
    }
  };

  // Previous records for fetched patient
  const patientPreviousConsultations = useMemo(() => {
    if (!fetchedPatient) return [];
    return consultations.filter(
      (c) => c.patient_uhid === fetchedPatient.uhid || c.patient_id === fetchedPatient.id
    );
  }, [fetchedPatient, consultations]);

  const patientPreviousPrescriptions = useMemo(() => {
    if (!fetchedPatient) return [];
    return prescriptions.filter(
      (p) => p.patient_uhid === fetchedPatient.uhid || p.patient_id === fetchedPatient.id
    );
  }, [fetchedPatient, prescriptions]);

  // Intelligent Department Recommendation based on Nature of Health Issue
  const handleNatureOfIssueChange = (text: string) => {
    setNatureOfHealthIssue(text);
    const lower = text.toLowerCase();
    const matched = SYMPTOM_TRIAGE_GUIDE.find((item) => lower.includes(item.keyword));
    if (matched) {
      setSelectedDepartment(matched.dept);
      // Auto pick first doctor in that dept
      const doc = doctors.find((d) => d.department.toLowerCase() === matched.dept.toLowerCase());
      if (doc) {
        setSelectedDoctorId(doc.id);
      }
    }
  };

  // Doctors in the selected department
  const departmentDoctors = useMemo(() => {
    return doctors.filter(
      (d) => d.department.toLowerCase() === selectedDepartment.toLowerCase()
    );
  }, [doctors, selectedDepartment]);

  const activeDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || departmentDoctors[0] || doctors[0];
  }, [doctors, selectedDoctorId, departmentDoctors]);

  // Real-time Available Slots Generator for Visit Date
  // Standard OPD Slots (Morning & Evening)
  const availableTimeSlots = useMemo(() => {
    const slots = [
      { time: '09:00 AM', period: 'Morning' },
      { time: '09:30 AM', period: 'Morning' },
      { time: '10:00 AM', period: 'Morning' },
      { time: '10:30 AM', period: 'Morning' },
      { time: '11:00 AM', period: 'Morning' },
      { time: '11:30 AM', period: 'Morning' },
      { time: '12:00 PM', period: 'Morning' },
      { time: '12:30 PM', period: 'Morning' },
      { time: '04:30 PM', period: 'Evening' },
      { time: '05:00 PM', period: 'Evening' },
      { time: '05:30 PM', period: 'Evening' },
      { time: '06:00 PM', period: 'Evening' },
      { time: '06:30 PM', period: 'Evening' },
      { time: '07:00 PM', period: 'Evening' }
    ];

    // Check existing appointments on this date with active doctor
    return slots.map((s) => {
      const isBooked = appointments.some(
        (a) =>
          a.doctor_id === activeDoctor.id &&
          a.appointment_date === visitDate &&
          (a.appointment_time === s.time || a.time_slot?.includes(s.time)) &&
          a.status !== 'Cancelled'
      );
      return {
        ...s,
        isBooked
      };
    });
  }, [activeDoctor, visitDate, appointments]);

  // Proceed from Intake to Doctor & Slot Selection
  const handleProceedToSlots = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callerName.trim()) {
      setErrorMessage('Please enter the patient name.');
      return;
    }
    if (!callerPhone.trim() || callerPhone.trim().length < 8) {
      setErrorMessage('Please enter a valid patient contact number.');
      return;
    }
    if (!callerLocation.trim()) {
      setErrorMessage('Please enter the patient location (City/Area).');
      return;
    }
    if (!natureOfHealthIssue.trim()) {
      setErrorMessage('Please enter the nature of the health issue.');
      return;
    }

    setErrorMessage('');
    // Auto align doctor to department
    if (departmentDoctors.length > 0 && !departmentDoctors.some((d) => d.id === selectedDoctorId)) {
      setSelectedDoctorId(departmentDoctors[0].id);
    }
    setStep('SLOTS');
  };

  // Final Confirmation & Auto-Send
  const handleConfirmAndAutoSend = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await onConfirmBooking({
        patientData: {
          id: fetchedPatient?.id,
          uhid: fetchedPatient?.uhid,
          full_name: callerName.trim(),
          age: Number(callerAge),
          gender: callerGender,
          phone: callerPhone.trim(),
          location: callerLocation.trim(),
          address: callerLocation.trim(),
          city: callerLocation.includes(',') ? callerLocation.split(',')[1].trim() : callerLocation.trim(),
          state: 'Tamil Nadu',
          department: selectedDepartment,
          nature_of_health_issue: natureOfHealthIssue.trim(),
          medical_history: natureOfHealthIssue.trim()
        },
        doctorId: activeDoctor.id,
        department: selectedDepartment,
        appointmentDate: visitDate,
        appointmentTime: selectedTimeSlot,
        timeSlot: `${selectedTimeSlot} - ${getEndTime(selectedTimeSlot)}`,
        natureOfHealthIssue: natureOfHealthIssue.trim(),
        symptoms: natureOfHealthIssue.trim(),
        feeAmount: 700,
        paymentMode,
        sourceChannel: 'Phone Call (Receptionist Intake)',
        isReturningPatient: Boolean(fetchedPatient),
        receptionistName
      });

      if (result.success && result.appointment) {
        setConfirmedAppt(result.appointment);
        setStep('CONFIRMED');
        setTimeout(() => {
          setSmsDeliverySent(true);
        }, 600);
      } else {
        setErrorMessage(result.error || 'Failed to complete appointment registration.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to compute end time (+30 min)
  const getEndTime = (slot: string) => {
    if (slot.includes('09:00')) return '09:30 AM';
    if (slot.includes('09:30')) return '10:00 AM';
    if (slot.includes('10:00')) return '10:30 AM';
    if (slot.includes('10:30')) return '11:00 AM';
    if (slot.includes('11:00')) return '11:30 AM';
    if (slot.includes('11:30')) return '12:00 PM';
    if (slot.includes('12:00')) return '12:30 PM';
    if (slot.includes('12:30')) return '01:00 PM';
    if (slot.includes('04:30')) return '05:00 PM';
    if (slot.includes('05:00')) return '05:30 PM';
    if (slot.includes('05:30')) return '06:00 PM';
    if (slot.includes('06:00')) return '06:30 PM';
    if (slot.includes('06:30')) return '07:00 PM';
    return '07:30 PM';
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Header - Screen only */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 text-lg shadow-inner">
              <i className="fa-solid fa-headset animate-pulse"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Receptionist Phone Call Intake &amp; OPD Booking Desk
                </h3>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live 7-Day OPD
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Logged in Receptionist: <span className="text-amber-300 font-semibold">{receptionistName}</span> • MediConnect Vadapalani
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Progress Tracker - Screen only */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-semibold print:hidden">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => step !== 'CONFIRMED' && setStep('INTAKE')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                step === 'INTAKE'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
              <span>Patient Call &amp; Health Issue</span>
            </button>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
            <button
              onClick={() => {
                if (callerName && callerPhone && callerLocation && natureOfHealthIssue) {
                  setStep('SLOTS');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                step === 'SLOTS'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              <span>Doctor &amp; Time Slot (7-Day Check)</span>
            </button>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
                step === 'CONFIRMED'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
              <span>Auto-Send Pass &amp; OPD Slip</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-800 text-xs">
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 print:hidden font-medium">
              <i className="fa-solid fa-circle-exclamation text-base"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: PATIENT CALL INTAKE */}
          {step === 'INTAKE' && (
            <form onSubmit={handleProceedToSlots} className="space-y-5">
              
              {/* Question 5: First time enquiring? */}
              <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white p-4 rounded-2xl border border-amber-200 shadow-2xs">
                <label className="block text-xs sm:text-sm font-extrabold text-amber-950 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-phone-volume text-amber-600"></i>
                  Receptionist Inquiry: &quot;Is this the first time you are enquiring / visiting MediConnect Hospital?&quot;
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFirstTime(false);
                      setFetchedPatient(null);
                      setHasSearchedReturning(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      isFirstTime === false
                        ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isFirstTime === false ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isFirstTime === false && <i className="fa-solid fa-check text-[10px]"></i>}
                    </div>
                    <div>
                      <strong className="block text-slate-900 font-bold text-xs">
                        NO, Returning Patient (Already Registered)
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Collect registered mobile number to fetch earlier records, past visits &amp; history.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFirstTime(true);
                      setFetchedPatient(null);
                      setSearchPhoneQuery('');
                      setCallerName('');
                      setCallerPhone('');
                      setCallerLocation('');
                    }}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      isFirstTime === true
                        ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isFirstTime === true ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isFirstTime === true && <i className="fa-solid fa-check text-[10px]"></i>}
                    </div>
                    <div>
                      <strong className="block text-slate-900 font-bold text-xs">
                        YES, First Time Calling (New Patient Registration)
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Collect new patient details, location, and issue.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Returning Patient Live Phone Lookup */}
              {isFirstTime === false && (
                <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                      <i className="fa-solid fa-search text-blue-600"></i>
                      Receptionist asks: &quot;Please share your registered 10-digit mobile number or UHID:&quot;
                    </label>
                    <span className="text-[10px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded font-mono">
                      Test Sample: 9884012345 or 9840156789
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <i className="fa-solid fa-phone absolute left-3 top-2.5 text-slate-400"></i>
                      <input
                        type="text"
                        placeholder="Enter registered mobile number (e.g. 9884012345) or UHID"
                        value={searchPhoneQuery}
                        onChange={(e) => handleSearchReturningPatient(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-blue-300 focus:border-blue-600 outline-none text-xs font-semibold text-slate-900 shadow-2xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSearchReturningPatient(searchPhoneQuery)}
                      className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-xs transition cursor-pointer"
                    >
                      Fetch Records
                    </button>
                  </div>

                  {/* Fetched Patient Summary Card */}
                  {fetchedPatient ? (
                    <div className="bg-white border border-emerald-300 rounded-xl p-3.5 shadow-sm space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                          <span className="font-bold text-emerald-900 text-xs">
                            ✓ Earlier Hospital Record Verified
                          </span>
                        </div>
                        <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {fetchedPatient.uhid}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Name:</span>
                          <strong className="text-slate-900">{fetchedPatient.full_name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Age / Gender:</span>
                          <strong className="text-slate-900">{fetchedPatient.age} Yrs / {fetchedPatient.gender}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Contact:</span>
                          <strong className="text-slate-900 font-mono">{fetchedPatient.phone}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Location:</span>
                          <strong className="text-slate-900">{fetchedPatient.location || fetchedPatient.address || 'Chennai'}</strong>
                        </div>
                      </div>

                      {/* Previous Medical History Pill */}
                      {patientPreviousConsultations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                          <span>
                            <i className="fa-solid fa-clock-rotate-left text-slate-400 mr-1"></i>
                            Past Visits: <strong className="text-slate-900">{patientPreviousConsultations.length} Consultations</strong> (Last seen by {patientPreviousConsultations[0].doctor_name})
                          </span>
                          <span className="text-sky-800 font-medium bg-sky-50 px-2 py-0.5 rounded">
                            Prev Diagnosis: {patientPreviousConsultations[0].diagnosis}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : hasSearchedReturning && searchPhoneQuery.length >= 5 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
                      <span>No prior record found for this number. Switch to New Patient Registration?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFirstTime(true);
                          setCallerPhone(searchPhoneQuery);
                        }}
                        className="bg-amber-600 text-white font-bold px-2.5 py-1 rounded-lg hover:bg-amber-700"
                      >
                        Register as New
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Patient Core Demographics Form (Required 1-4 + Location) */}
              {(isFirstTime !== null || fetchedPatient) && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-id-card-clip text-blue-700"></i>
                      Caller Information (Collected by Receptionist)
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">
                      All fields mandatory for OPD pass generation
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {/* 1. Name */}
                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">
                        1. Patient Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={callerName}
                        onChange={(e) => setCallerName(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-medium text-slate-900"
                      />
                    </div>

                    {/* 2. Age & Gender */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-bold text-xs mb-1">
                          2. Age *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="120"
                          value={callerAge}
                          onChange={(e) => setCallerAge(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold text-xs mb-1">
                          Gender *
                        </label>
                        <select
                          value={callerGender}
                          onChange={(e) => setCallerGender(e.target.value as any)}
                          className="w-full px-2 py-2 bg-white rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-medium text-slate-900"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* 3. Contact No */}
                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">
                        3. Contact Number (Mobile) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98840 00000"
                        value={callerPhone}
                        onChange={(e) => setCallerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-medium text-slate-900"
                      />
                    </div>

                    {/* Location Collection (Explicitly Requested) */}
                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-slate-700 font-bold text-xs mb-1 flex items-center justify-between">
                        <span>Patient Location / Area &amp; City (Mandatory) *</span>
                        <span className="text-[10px] text-slate-400 font-normal">e.g. Vadapalani, Chennai / T. Nagar / Velachery</span>
                      </label>
                      <div className="relative">
                        <i className="fa-solid fa-location-dot absolute left-3 top-2.5 text-rose-500 text-xs"></i>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Vadapalani, Chennai (Locality / Area / City)"
                          value={callerLocation}
                          onChange={(e) => setCallerLocation(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Nature of Health Issue & Smart Department Triage */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <label className="block text-slate-700 font-bold text-xs">
                      4. Nature of Health Issue / Chief Complaints *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Describe symptoms (e.g. acute chest tightness, severe knee pain after fall, high fever with chills, morning sickness...)"
                      value={natureOfHealthIssue}
                      onChange={(e) => handleNatureOfIssueChange(e.target.value)}
                      className="w-full p-3 bg-white rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-medium text-slate-900"
                    />

                    {/* Quick Symptom Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Quick Select:</span>
                      {SYMPTOM_TRIAGE_GUIDE.slice(0, 7).map((s, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleNatureOfIssueChange(s.label)}
                          className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 hover:border-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full transition"
                        >
                          + {s.label}
                        </button>
                      ))}
                    </div>

                    {/* Recommended Specialty Department Badge */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        <span className="font-bold text-emerald-950 text-xs">
                          Smart Clinical Department Recommendation:
                        </span>
                        <span className="font-extrabold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300 shadow-2xs">
                          {selectedDepartment}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-slate-500 font-medium">Override Dept:</label>
                        <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                        >
                          <option value="Cardiology">Cardiology</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Orthopaedics">Orthopaedics</option>
                          <option value="Obstetrics & Gynaecology">Obstetrics &amp; Gynaecology</option>
                          <option value="Paediatrics">Paediatrics</option>
                          <option value="Nephrology">Nephrology</option>
                          <option value="Gastroenterology">Gastroenterology</option>
                          <option value="General Medicine">General Medicine</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
                >
                  Cancel Call
                </button>
                <button
                  type="submit"
                  disabled={isFirstTime === null}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Check Doctor Availability &amp; Slots</span>
                  <i className="fa-solid fa-arrow-right text-[11px]"></i>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REAL-TIME DOCTOR AVAILABILITY & TIME SLOTS (ALL 7 DAYS AVAILABLE) */}
          {step === 'SLOTS' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Receptionist Dialogue Prompt */}
              <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-headset"></i>
                  </div>
                  <div>
                    <span className="font-bold text-sky-950 block">
                      Receptionist asks caller: &quot;When are you planning to visit the hospital? Which date &amp; time slot suits you?&quot;
                    </span>
                    <span className="text-[11px] text-sky-800">
                      Doctors in {selectedDepartment} are available on <strong>All 7 Days (Mon - Sun)</strong> across Morning and Evening shifts.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setStep('INTAKE')}
                  className="text-sky-700 hover:text-sky-900 font-bold text-xs underline shrink-0 cursor-pointer"
                >
                  Edit Details
                </button>
              </div>

              {/* Date & Doctor Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Left 5 Cols: Visit Date & Doctor Roster */}
                <div className="md:col-span-5 space-y-3">
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1 flex items-center justify-between">
                      <span>Visiting Date *</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Available All 7 Days
                      </span>
                    </label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:border-blue-600 outline-none font-bold text-slate-900 text-xs shadow-2xs"
                    />
                  </div>

                  {/* Specialist Doctors in Department */}
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">
                      Select Available Specialist Doctor ({departmentDoctors.length})
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {departmentDoctors.map((doc) => {
                        const isSelected = doc.id === activeDoctor.id;
                        return (
                          <div
                            key={doc.id}
                            onClick={() => setSelectedDoctorId(doc.id)}
                            className={`p-3 rounded-xl border transition cursor-pointer text-xs ${
                              isSelected
                                ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <strong className="font-bold text-slate-900">{doc.full_name}</strong>
                              <span className="text-[10px] font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                                {doc.room_number}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{doc.qualification}</div>
                            <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                              <i className="fa-solid fa-circle-check text-[9px]"></i>
                              <span>All Days Available • {doc.opd_timing}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right 7 Cols: Real-Time Slots Grid */}
                <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <strong className="text-slate-900 text-xs block font-bold">
                        Live OPD Time Slots for {activeDoctor.full_name}
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Date: <strong className="text-blue-900">{visitDate}</strong> • Room: <strong>{activeDoctor.room_number}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Free
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span> Booked
                      </span>
                    </div>
                  </div>

                  {/* Slots Grouped */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Morning Slots (09:00 AM - 01:00 PM)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableTimeSlots
                          .filter((s) => s.period === 'Morning')
                          .map((s, idx) => {
                            const isSelected = selectedTimeSlot === s.time;
                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={s.isBooked}
                                onClick={() => setSelectedTimeSlot(s.time)}
                                className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                                  s.isBooked
                                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-400/30'
                                    : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                                }`}
                              >
                                {s.time}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Evening Slots (04:30 PM - 07:30 PM)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableTimeSlots
                          .filter((s) => s.period === 'Evening')
                          .map((s, idx) => {
                            const isSelected = selectedTimeSlot === s.time;
                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={s.isBooked}
                                onClick={() => setSelectedTimeSlot(s.time)}
                                className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                                  s.isBooked
                                    ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-400/30'
                                    : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                                }`}
                              >
                                {s.time}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Consultation Fee Note (Collected ONLY after consultation) */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-slate-700 font-bold block text-xs">
                        OPD Consultation Fee: ₹700.00 + ₹200.00 Nursing = ₹900.00 (₹45 GST) = ₹945.00
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        No payment collected now. Fee payable at the reception desk after the doctor completes the consultation.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep('INTAKE')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-left mr-1.5"></i> Back to Patient Info
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmAndAutoSend}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  <span>{isSubmitting ? 'Registering...' : 'Confirm Slot & Auto-Send OPD Form to Mobile'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMED, AUTO-SENT TO CONTACT NO & OFFICIAL PRINTABLE SLIP */}
          {step === 'CONFIRMED' && confirmedAppt && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Animated Notification of Auto-Sent Message to Patient Contact No */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-md space-y-2 print:hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                      <i className="fa-solid fa-check"></i>
                    </span>
                    <div>
                      <strong className="text-sm font-bold block">
                        OPD Registration Form Auto-Sent Successfully!
                      </strong>
                      <span className="text-xs text-emerald-100">
                        Dispatched in real-time to registered contact: <strong>{callerPhone}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase">
                    SMS &amp; WhatsApp Sent
                  </span>
                </div>

                {/* Simulated SMS Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-[11.5px] border border-white/20 font-mono text-emerald-50 leading-relaxed">
                  💬 <strong>SMS / WhatsApp Delivered to {callerPhone}:</strong>
                  <br />
                  &quot;Dear {confirmedAppt.patient_name}, your OPD Registration at MediConnect Hospital is CONFIRMED.
                  <br />
                  <strong>Reg No:</strong> {confirmedAppt.opd_reg_no || confirmedAppt.appointment_no} | <strong>Token:</strong> {confirmedAppt.appointment_no}
                  <br />
                  <strong>Doctor:</strong> {confirmedAppt.doctor_name} ({confirmedAppt.department})
                  <br />
                  <strong>Schedule:</strong> {confirmedAppt.appointment_date} at {confirmedAppt.appointment_time} (Room: {activeDoctor.room_number})
                  <br />
                  <strong>Location:</strong> {confirmedAppt.patient_location || callerLocation}
                  <br />
                  Show this digital pass at the Reception / Doctor OPD desk.&quot;
                </div>
              </div>

              {/* Action Toolbar on Screen */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl print:hidden">
                <span className="text-xs font-bold text-slate-700">
                  Official OPD Registration Slip &amp; Clinical Intake Sheet
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintSlip}
                    className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <i className="fa-solid fa-print"></i> Print OPD Slip
                  </button>
                  {onOpenReceipt && (
                    <button
                      onClick={() => onOpenReceipt(confirmedAppt)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <i className="fa-solid fa-receipt"></i> Print Consultation Fee Receipt
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Done / Close
                  </button>
                </div>
              </div>

              {/* OFFICIAL PRINTABLE OPD REGISTRATION SLIP (NEAT & PROFESSIONAL) */}
              <div
                id="printable-opd-registration-slip"
                className="bg-white border-2 border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 print:border-none print:p-0 print:m-0 print:w-full print-page-break-inside-avoid shadow-sm"
              >
                {/* Hospital Letterhead Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#004b91] text-white flex flex-col items-center justify-center font-black p-1 leading-none shadow-sm print:bg-[#004b91]">
                      <span className="text-base">+</span>
                      <span className="text-[7.5px] tracking-tighter uppercase">MEDICONNECT</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-black tracking-tight text-[#004b91] uppercase">
                        MEDICONNECT MULTISPECIALITY HOSPITAL
                      </h1>
                      <p className="text-[10.5px] font-bold text-slate-600">
                        100 Feet Bypass Road, Vadapalani, Chennai – 600026 • 24x7 Helpline: 1066 / +91 44 2483 3400
                      </p>
                      <span className="text-[9.5px] font-black text-amber-700 uppercase tracking-widest">
                        NABH ACCREDITED • TERTIARY HEALTHCARE INSTITUTION
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded block uppercase">
                      OPD REGISTRATION PASS
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Issued: {new Date().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Primary Reference Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-3 rounded-xl border border-slate-300 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">OPD Reg Number:</span>
                    <strong className="text-blue-950 font-bold text-sm">
                      {confirmedAppt.opd_reg_no || confirmedAppt.appointment_no}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Patient UHID:</span>
                    <strong className="text-emerald-950 font-bold">
                      {confirmedAppt.patient_uhid}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Appointment Token:</span>
                    <strong className="text-slate-950 font-bold text-sm">
                      {confirmedAppt.appointment_no}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Mode of Booking:</span>
                    <strong className="text-slate-900">
                      Phone Call Intake
                    </strong>
                  </div>
                </div>

                {/* Patient Information & Demographics (Requirements 1-4 + Location) */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-1.5 flex justify-between">
                    <span>Patient Profile &amp; Contact Details</span>
                    <span className="text-emerald-700 font-bold">Registration Status: Active</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Patient Full Name:</span>
                      <strong className="text-slate-900 text-sm">{confirmedAppt.patient_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Age &amp; Gender:</span>
                      <strong className="text-slate-900">{callerAge} Years / {callerGender}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Registered Contact Number:</span>
                      <strong className="text-slate-900 font-mono">{confirmedAppt.patient_phone || callerPhone}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block text-[11px]">Patient Location / Address:</span>
                      <strong className="text-slate-900">{confirmedAppt.patient_location || callerLocation}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Inquirer Status:</span>
                      <strong className="text-slate-900">{fetchedPatient ? 'Returning Patient' : 'First Time Caller'}</strong>
                    </div>
                  </div>
                </div>

                {/* Clinical Specialty & Visiting Schedule */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-blue-50/40">
                  <div className="font-extrabold text-xs uppercase tracking-wider text-blue-950 border-b border-blue-100 pb-1.5 flex justify-between">
                    <span>Clinical Consultation Schedule</span>
                    <span className="text-blue-900 font-bold">OPD Room: {activeDoctor.room_number}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Department:</span>
                      <strong className="text-blue-950 font-bold">{confirmedAppt.department}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Attending Consultant:</span>
                      <strong className="text-slate-900">{confirmedAppt.doctor_name}</strong>
                      <span className="text-[10px] text-slate-500 block">{activeDoctor.qualification}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Confirmed Date &amp; Time Slot:</span>
                      <strong className="text-slate-900 font-bold text-sm text-blue-900">
                        {confirmedAppt.appointment_date} at {confirmedAppt.appointment_time}
                      </strong>
                      <span className="text-[10px] text-emerald-700 block font-semibold">Doctor Available (All 7 Days)</span>
                    </div>
                    <div className="sm:col-span-3">
                      <span className="text-slate-500 block text-[11px]">Nature of Health Issue / Presenting Complaints:</span>
                      <strong className="text-slate-900 bg-white p-2 rounded-lg border border-slate-200 block mt-0.5">
                        {confirmedAppt.nature_of_health_issue || confirmedAppt.symptoms || natureOfHealthIssue}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Consultation Fee Breakdown & Barcode Footer */}
                <div className="border-t-2 border-slate-800 pt-3 flex flex-wrap justify-between items-end gap-3 text-xs">
                  <div>
                    <div className="text-[11px] text-slate-600">
                      OPD Consultation Fee: <strong>₹700.00 + ₹200.00 Nursing + ₹45 GST = ₹945.00</strong> (Payable at reception after consultation)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Intake Recorded By: <strong>{receptionistName} (Front Desk Receptionist)</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Please report at the OPD registration desk 10 minutes before your slot. Carry this slip or show SMS pass.
                    </div>
                  </div>

                  {/* Stamp / Signature */}
                  <div className="text-right">
                    <div className="w-28 h-10 border border-slate-300 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 mb-1 ml-auto">
                      [HOSPITAL SEAL]
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 block">Authorized Receptionist</span>
                    <span className="text-[10px] text-slate-500">MediConnect Vadapalani</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
