import React, { useState } from 'react';
import { Appointment, Patient, Doctor, Invoice } from '../data/hospitalData';
import { dbService } from '../services/db';
import { AppointmentTokenModal } from './AppointmentTokenModal';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  invoices?: Invoice[];
  currentUser?: any;
  onBookAppointment: (apptData: any) => Promise<{ success: boolean; appointment_no?: string; error?: string }>;
  onUpdateStatus: (id: number, newStatus: 'Appointment Pending' | 'Appointment Confirmed' | 'Confirmed' | 'Completed' | 'Cancelled') => void;
  onUpdateAppointment?: (appointment: Appointment) => Promise<void> | void;
  onDeleteAppointment?: (appointmentId: number) => Promise<void> | void;
  onNavigate: (view: string) => void;
  onExaminePatient?: (appt: Appointment) => void;
  onPrintFeeReceipt?: (appt: Appointment) => void;
  onCollectOPDFee?: (data: {
    appointmentId: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Insurance / TPA' | 'Net Banking';
    receptionistName?: string;
  }) => Promise<{ success: boolean; error?: string; receiptNo?: string; appointment?: Appointment }>;
  onAssignDoctorAndSlot?: (data: {
    appointmentId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    location?: string;
    specialty?: string;
    patientId?: number;
    patientUhid?: string;
    patientName?: string;
    symptoms?: string;
  }) => Promise<{ success: boolean; error?: string; appointment?: Appointment }>;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  patients,
  doctors,
  invoices = [],
  currentUser,
  onBookAppointment,
  onUpdateStatus,
  onUpdateAppointment,
  onDeleteAppointment,
  onNavigate,
  onExaminePatient,
  onPrintFeeReceipt,
  onCollectOPDFee,
  onAssignDoctorAndSlot
}) => {
  const isDoctor = currentUser?.role === 'DOCTOR';
  const isPatient = currentUser?.role === 'PATIENT';
  const doctorDept = currentUser?.department || '';
  const doctorName = currentUser?.full_name || '';

  const getAppointmentInvoiceTotal = (apt: Appointment): number => {
    const matched =
      invoices.find((i) => i.appointment_id === apt.id || i.receipt_no === apt.receipt_no) ||
      invoices.find((i) => i.patient_uhid === apt.patient_uhid);
    return matched ? matched.total_amount : 945;
  };

  const isTokenFrozen = (apt: Appointment): boolean =>
    apt.status === 'Consultation In Progress' ||
    apt.status === 'Consultation Completed' ||
    apt.status === 'Consultation Pending' ||
    apt.status === 'Payment Pending' ||
    apt.status === 'Paid' ||
    apt.status === 'Receipt Generated' ||
    apt.status === 'Documents Ready' ||
    apt.status === 'Printed' ||
    apt.status === 'Completed';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(
    isDoctor ? doctorDept || 'General Medicine' : 'All'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Token Modal State
  const [selectedApptForToken, setSelectedApptForToken] = useState<Appointment | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Handler for Generating / Printing Official Token (Requirement 4 & 5)
  const handleOpenTokenModal = (apt: Appointment) => {
    const isDocAssigned = Boolean(
      apt.doctor_name &&
      apt.doctor_name !== 'Pending Assignment' &&
      apt.doctor_id &&
      apt.doctor_id > 0
    );
    const isDateAssigned = Boolean(
      apt.appointment_date &&
      apt.appointment_date !== 'Pending'
    );
    const isTimeAssigned = Boolean(
      apt.appointment_time &&
      apt.appointment_time !== 'Pending'
    );

    if (!isDocAssigned || !isDateAssigned || !isTimeAssigned) {
      alert('Please assign a doctor appointment date and time before generating the token.');
      return;
    }

    setSelectedApptForToken(apt);
    setIsTokenModalOpen(true);
  };

  // Handler for Post-Consultation Fee Collection (Requirement 6 & 7)
  const handleCollectFee = async (apt: Appointment) => {
    const isCompleted = apt.status === 'Consultation Completed' || apt.consultation_completed;
    if (!isCompleted) {
      alert('Payment cannot be collected until the doctor completes the consultation.');
      return;
    }
    if (onCollectOPDFee) {
      const mode = prompt('Collect ₹700 + ₹200 Nursing + ₹45 Tax = ₹945 OPD Fee. Select Payment Mode (Cash, UPI, Card):', 'UPI');
      if (!mode) return;
      const validMode = mode.toUpperCase() === 'CASH' ? 'Cash' : mode.toUpperCase() === 'CARD' ? 'Card' : 'UPI';
      const res = await onCollectOPDFee({
        appointmentId: apt.id,
        paymentMode: validMode as any,
        receptionistName: currentUser?.full_name || 'Front Desk Receptionist'
      });
      if (res.success) {
        alert(`✅ OPD Consultation Fee Collected!\nReceipt: ${res.receiptNo}\nAmount: ₹945.00 (₹700 + ₹200 Nursing + ₹45 GST)\nMedical records unlocked for printing.`);
      } else {
        alert(res.error || 'Failed to collect payment.');
      }
    }
  };

  // Find matching doctor object for current doctor user
  const currentDoctorObj = doctors.find(
    (d) =>
      (currentUser?.doctor_id && d.id === currentUser.doctor_id) ||
      (doctorName && d.full_name.toLowerCase().includes(doctorName.toLowerCase())) ||
      (doctorName && doctorName.toLowerCase().includes(d.full_name.toLowerCase()))
  ) || doctors[0];

  // Form states for New Booking
  const [patientId, setPatientId] = useState<number | 'manual'>(patients[0]?.id || 'manual');
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientPhone, setManualPatientPhone] = useState('');
  const [manualPatientAge, setManualPatientAge] = useState('');
  const [manualPatientGender, setManualPatientGender] = useState('');
  const [doctorId, setDoctorId] = useState<number>(isDoctor ? currentDoctorObj.id : (doctors[0]?.id || 1));
  const [apptDate, setApptDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [apptTime, setApptTime] = useState('10:00 AM');
  const [apptType, setApptType] = useState('New Consultation');
  const [symptoms, setSymptoms] = useState('');

  // Update / Edit Modal State
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDoctorId, setEditDoctorId] = useState<number>(1);
  const [editStatus, setEditStatus] = useState<'Confirmed' | 'Completed' | 'Cancelled'>('Confirmed');
  const [editType, setEditType] = useState('OPD Consultation');
  const [editSymptoms, setEditSymptoms] = useState('');

  // Delete Confirmation Modal State
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Receptionist OPD Scheduling Desk State (Requirement 1 & 2)
  const [schedPatientSearch, setSchedPatientSearch] = useState('');
  const [schedSearchError, setSchedSearchError] = useState<string | null>(null);
  const [schedSuccessMsg, setSchedSuccessMsg] = useState<string | null>(null);
  const [schedSelectedAppt, setSchedSelectedAppt] = useState<Appointment | null>(null);
  const [schedSelectedPatient, setSchedSelectedPatient] = useState<Patient | null>(null);
  const [schedLocation, setSchedLocation] = useState('Vadapalani');
  const [schedSpecialty, setSchedSpecialty] = useState('General Medicine');
  const [schedDoctorId, setSchedDoctorId] = useState<number>(doctors[0]?.id || 1);
  const [schedDate, setSchedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [schedTime, setSchedTime] = useState('10:00 AM');
  const [schedSymptoms, setSchedSymptoms] = useState('');
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(currentUser?.role === 'RECEPTIONIST' || currentUser?.role === 'ADMIN' || !currentUser?.role);

  // Helper to load patient & appointment into receptionist scheduler (Requirement 1)
  const handleLoadPatientForScheduling = (queryStr: string) => {
    const q = queryStr.trim().toUpperCase();
    const cleanDigits = queryStr.replace(/\D/g, '');
    setSchedSearchError(null);
    setSchedSuccessMsg(null);

    if (!q) {
      setSchedSearchError('Please enter a Patient ID (UHID) or mobile number.');
      return;
    }

    // 1. Try finding patient in master registry
    const pat = patients.find(
      (p) =>
        p.uhid.trim().toUpperCase() === q ||
        p.id.toString() === q ||
        (cleanDigits.length >= 8 && p.phone.replace(/\D/g, '').endsWith(cleanDigits)) ||
        p.full_name.trim().toUpperCase() === q
    );

    // 2. Try finding appointment (by token, patient UHID, or ID)
    const appt = appointments.find(
      (a) =>
        a.patient_uhid?.trim().toUpperCase() === q ||
        a.appointment_no.trim().toUpperCase() === q ||
        a.id.toString() === q ||
        (pat && (a.patient_id === pat.id || a.patient_uhid?.trim().toUpperCase() === pat.uhid.trim().toUpperCase()))
    );

    if (!pat && !appt) {
      setSchedSearchError(`Patient ID "${queryStr.trim()}" not found. Please verify or register the patient.`);
      setSchedSelectedAppt(null);
      setSchedSelectedPatient(null);
      return;
    }

    const resolvedPat: Patient = pat || {
      id: appt?.patient_id || 999,
      uhid: appt?.patient_uhid || 'UHID-2026-0001',
      full_name: appt?.patient_name || 'Patient',
      phone: appt?.patient_phone || '+91 98840 00000',
      gender: appt?.patient_gender || 'Prefer not to say',
      location: appt?.patient_location || 'Vadapalani',
      age: appt?.patient_age || 0,
      date_of_birth: '1990-01-01',
      blood_group: '',
      address: appt?.patient_location || 'Chennai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      emergency_contact_name: 'Emergency Contact',
      emergency_contact_phone: appt?.patient_phone || '+91 98840 00000',
      nature_of_health_issue: appt?.symptoms || 'OPD Consultation',
      created_at: new Date().toISOString()
    };

    setSchedSelectedPatient(resolvedPat);
    setSchedSelectedAppt(appt || null);

    const initialLocation = appt?.patient_location || resolvedPat.location || 'Vadapalani';
    const initialSpecialty = appt?.specialty || appt?.department || resolvedPat.department || 'General Medicine';

    setSchedLocation(initialLocation);
    setSchedSpecialty(initialSpecialty);
    setSchedSymptoms(appt?.symptoms || resolvedPat.nature_of_health_issue || 'OPD Consultation');

    // Find suitable doctor for specialty
    const matchingDoc = doctors.find(
      (d) => d.department?.toLowerCase() === initialSpecialty.toLowerCase()
    ) || doctors[0];
    if (matchingDoc) {
      setSchedDoctorId(matchingDoc.id);
    }
  };

  // Doctors filtered by selected specialty
  const availableDoctorsForSpecialty = doctors.filter((d) =>
    schedSpecialty ? d.department?.toLowerCase() === schedSpecialty.toLowerCase() : true
  );

  // Available and booked slots for chosen doctor and date
  const doctorSlots = dbService.getDoctorSlotsWithAvailability(
    schedDoctorId,
    schedDate,
    appointments,
    schedSelectedAppt?.id
  );

  // Requirement 2: Show only available slots
  const availableSlots = doctorSlots.filter((slot) => !slot.isBooked);

  // Confirm Doctor + Slot assignment (Requirement 2 & 3)
  const handleConfirmReceptionistSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchedSearchError(null);
    setSchedSuccessMsg(null);

    if (!schedSelectedPatient && !schedSelectedAppt) {
      setSchedSearchError('Please search and select a valid Patient ID to schedule.');
      return;
    }

    if (!schedDoctorId) {
      setSchedSearchError('Please select an attending consultant doctor.');
      return;
    }

    if (!schedDate || !schedTime) {
      setSchedSearchError('Please select both appointment date and time slot.');
      return;
    }

    // Check slot collision
    const selectedSlotObj = doctorSlots.find((s) => s.time === schedTime);
    if (selectedSlotObj?.isBooked) {
      setSchedSearchError('Doctor already booked for this slot. Please choose another available slot.');
      return;
    }

    if (onAssignDoctorAndSlot) {
      const res = await onAssignDoctorAndSlot({
        appointmentId: schedSelectedAppt?.id || 0,
        patientId: schedSelectedPatient?.id || schedSelectedAppt?.patient_id || 0,
        patientUhid: schedSelectedPatient?.uhid || schedSelectedAppt?.patient_uhid,
        patientName: schedSelectedPatient?.full_name || schedSelectedAppt?.patient_name,
        doctorId: schedDoctorId,
        appointmentDate: schedDate,
        appointmentTime: schedTime,
        location: schedLocation,
        specialty: schedSpecialty,
        symptoms: schedSymptoms
      });

      if (res.success && res.appointment) {
        // Requirement 3: After booking, show "Appointment booked successfully" with doctor's name, hospital/location, exact appointment date and time
        setSchedSuccessMsg(
          `Appointment booked successfully with ${res.appointment.doctor_name} at CareHub Hospital (${res.appointment.patient_location || schedLocation}) on ${res.appointment.appointment_date} at ${res.appointment.appointment_time}.`
        );
        setSchedSelectedAppt(res.appointment);
      } else {
        setSchedSearchError(res.error || 'Failed to schedule appointment.');
      }
    } else {
      alert('Appointment scheduled successfully.');
    }
  };

  // Filter appointments strictly by Doctor / Department / Patient
  const filteredAppointments = appointments.filter((a) => {
    // 1. Role-specific doctor & patient isolation
    if (isDoctor) {
      const docId = currentUser?.doctor_id;
      const cleanDocName = doctorName?.trim().toLowerCase();
      const matchDoc =
        (docId && a.doctor_id === docId) ||
        (cleanDocName && a.doctor_name && a.doctor_name.trim().toLowerCase() === cleanDocName);
      if (!matchDoc) return false;
    } else if (isPatient) {
      const matchPat =
        (currentUser?.patient_uhid && a.patient_uhid?.trim().toUpperCase() === currentUser.patient_uhid.trim().toUpperCase()) ||
        (currentUser?.patient_id && a.patient_id === currentUser.patient_id);
      if (!matchPat) return false;
    } else if (selectedDeptFilter !== 'All') {
      if (!a.department || a.department.toLowerCase() !== selectedDeptFilter.toLowerCase()) {
        return false;
      }
    }

    // 2. Search & Status Filter
    const matchesSearch =
      a.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patient_uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.appointment_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    let patName = manualPatientName.trim();
    let patPhone = manualPatientPhone.trim();
    let patUhid = '';
    let patId = 0;

    if (patientId !== 'manual') {
      const patientObj = patients.find((p) => p.id === Number(patientId));
      if (patientObj) {
        patName = patientObj.full_name;
        patPhone = patientObj.phone;
        patUhid = patientObj.uhid;
        patId = patientObj.id;
      }
    }

    if (!patName) {
      alert('Please enter or select a patient name.');
      return;
    }

    const doctorObj = doctors.find((d) => d.id === Number(doctorId)) || doctors[0];

    const res = await onBookAppointment({
      patient_id: patId || undefined,
      patient_name: patName,
      patient_uhid: patUhid || undefined,
      patient_phone: patPhone || '9840012345',
      patient_age: patientId === 'manual' || patients.length === 0 ? Number(manualPatientAge) || undefined : undefined,
      patient_gender: patientId === 'manual' || patients.length === 0 ? manualPatientGender || undefined : undefined,
      doctor_id: doctorObj.id,
      doctor_name: doctorObj.full_name,
      department: doctorObj.department,
      appointment_date: apptDate,
      appointment_time: apptTime,
      appointment_type: apptType,
      symptoms: symptoms || 'OPD Clinical Visit'
    });

    if (res.success) {
      setIsModalOpen(false);
      setSymptoms('');
      setManualPatientName('');
      setManualPatientPhone('');
      alert(`Appointment successfully confirmed! Token: ${res.appointment_no}`);
    } else {
      alert(res.error || 'Could not schedule appointment slot.');
    }
  };

  const handleOpenEdit = (apt: Appointment) => {
    if (isTokenFrozen(apt)) {
      alert(`Token ${apt.appointment_no} is frozen after the patient visited the doctor. It can no longer be edited or updated.`);
      return;
    }
    setEditingAppointment(apt);
    setEditDate(apt.appointment_date);
    setEditTime(apt.appointment_time);
    setEditDoctorId(apt.doctor_id || 1);
    setEditStatus(apt.status);
    setEditType(apt.appointment_type || 'OPD Consultation');
    setEditSymptoms(apt.symptoms || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;

    const docObj = doctors.find((d) => d.id === Number(editDoctorId)) || doctors[0];

    const updated: Appointment = {
      ...editingAppointment,
      appointment_date: editDate,
      appointment_time: editTime,
      doctor_id: docObj.id,
      doctor_name: docObj.full_name,
      department: docObj.department,
      status: editStatus,
      appointment_type: editType,
      symptoms: editSymptoms
    };

    if (onUpdateAppointment) {
      await onUpdateAppointment(updated);
    }
    setEditingAppointment(null);
  };

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;
    if (isTokenFrozen(appointmentToDelete)) {
      alert(`Token ${appointmentToDelete.appointment_no} is frozen after the patient visited the doctor. It can no longer be deleted.`);
      setAppointmentToDelete(null);
      return;
    }
    setIsDeleting(true);
    try {
      if (onDeleteAppointment) {
        await onDeleteAppointment(appointmentToDelete.id);
      }
      setAppointmentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            OPD Appointment Scheduler & Slot Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time double-booking prevention, token updates, and record management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <i className="fa-solid fa-calendar-plus text-slate-400"></i> Schedule New Slot
          </button>
        </div>
      </div>

      {/* Doctor Department Isolation Banner */}
      {isDoctor && (
        <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse"></span>
            <span className="font-bold text-sky-950">
              Department OPD Queue: Filtered strictly for {doctorName} ({doctorDept || 'General Medicine'}).
            </span>
            <span className="text-[11px] text-sky-800">
              Other departments (Cardiology, Orthopaedics, etc.) are isolated.
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-sky-900 bg-white px-2.5 py-0.5 rounded-md border border-sky-200 shadow-xs">
            {filteredAppointments.length} Appointments Assigned
          </span>
        </div>
      )}

      {/* Patient Isolation Banner */}
      {isPatient && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-bold text-emerald-950">
              Personal OPD Token &amp; Slot Roster: Showing appointments booked exclusively for {currentUser?.full_name} ({currentUser?.patient_uhid}).
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-900 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-xs">
            {filteredAppointments.length} Appointments
          </span>
        </div>
      )}

      {/* 2. RECEPTIONIST — APPOINTMENT SCHEDULING (DOCTOR + DATE/TIME) */}
      {!isDoctor && !isPatient && (
        <div className="bg-white rounded-xl border border-sky-200/80 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-4 px-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center text-sm">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">
                    Receptionist Desk — Appointment Scheduling (Doctor + Date/Time)
                  </h3>
                  <span className="bg-sky-500/30 text-sky-200 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-400/30">
                    OPD WORKFLOW STEP 2
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Search by Patient ID to assign doctor, consultation date, and available time slot with double-booking prevention
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSchedulingOpen(!isSchedulingOpen)}
              className="text-xs text-sky-300 hover:text-white flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>{isSchedulingOpen ? 'Hide Scheduler' : 'Open Scheduler'}</span>
              <i className={`fa-solid ${isSchedulingOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </button>
          </div>

          {isSchedulingOpen && (
            <div className="p-5 space-y-4">
              {/* Pending Queue Notice if any */}
              {appointments.some((a) => a.status === 'Appointment Pending') && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold">
                    <i className="fa-solid fa-clock-rotate-left text-amber-600"></i>
                    <span>
                      {appointments.filter((a) => a.status === 'Appointment Pending').length} Patient(s) awaiting Doctor &amp; Slot Assignment from OPD Registration.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setSchedPatientSearch(e.target.value);
                          handleLoadPatientForScheduling(e.target.value);
                        }
                      }}
                      className="px-2.5 py-1 text-xs rounded border border-amber-300 bg-white text-amber-950 font-medium outline-none"
                    >
                      <option value="">-- Select Pending Patient --</option>
                      {appointments
                        .filter((a) => a.status === 'Appointment Pending')
                        .map((a) => (
                          <option key={a.id} value={a.patient_uhid || a.appointment_no}>
                            {a.patient_name} ({a.patient_uhid || a.appointment_no}) - {a.specialty || a.department} ({a.patient_location || 'Vadapalani'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Patient ID Search Input */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Search &amp; Retrieve by Patient ID / UHID *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <i className="fa-solid fa-id-card absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                    <input
                      type="text"
                      placeholder="Enter Patient ID (e.g. MED-P-1001, UHID-..., or Appointment Token)..."
                      value={schedPatientSearch}
                      onChange={(e) => setSchedPatientSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleLoadPatientForScheduling(schedPatientSearch);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-900 bg-white font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLoadPatientForScheduling(schedPatientSearch)}
                    className="bg-sky-800 hover:bg-sky-900 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <span>Retrieve Patient</span>
                  </button>
                </div>

                {/* Error Banner */}
                {schedSearchError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-2 mt-2">
                    <i className="fa-solid fa-circle-exclamation text-rose-600 text-sm shrink-0"></i>
                    <span className="font-semibold">{schedSearchError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {schedSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-3 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 mt-2 shadow-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-circle-check text-emerald-600 text-base shrink-0"></i>
                      <span className="font-bold">{schedSuccessMsg}</span>
                    </div>
                    {schedSelectedAppt && (
                      <button
                        type="button"
                        onClick={() => handleOpenTokenModal(schedSelectedAppt)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                      >
                        <i className="fa-solid fa-ticket"></i>
                        <span>Print Official Token</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Patient Details & Scheduling Form (Rendered once a patient is retrieved) */}
              {(schedSelectedPatient || schedSelectedAppt) && (
                <form onSubmit={handleConfirmReceptionistSchedule} className="space-y-4 border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                        Patient Record Retrieved
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {schedSelectedPatient?.full_name || schedSelectedAppt?.patient_name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        ID: {schedSelectedPatient?.uhid || schedSelectedAppt?.patient_uhid}
                      </span>
                      {schedSelectedAppt && (
                        <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                          Token: {schedSelectedAppt.appointment_no}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                        schedSelectedAppt?.status === 'Appointment Confirmed'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        Status: {schedSelectedAppt?.status || 'Appointment Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Patient Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Gender</label>
                      <input
                        type="text"
                        readOnly
                        value={schedSelectedPatient?.gender || schedSelectedAppt?.patient_gender || 'Prefer not to say'}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Mobile (+91)</label>
                      <input
                        type="text"
                        readOnly
                        value={schedSelectedPatient?.phone || schedSelectedAppt?.patient_phone || '+91 98840 00000'}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-mono font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Location *</label>
                      <select
                        value={schedLocation}
                        onChange={(e) => setSchedLocation(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:border-slate-800 outline-none"
                      >
                        <option value="Vadapalani">Vadapalani</option>
                        <option value="Nungambakkam">Nungambakkam</option>
                        <option value="Nagerkoil">Nagerkoil</option>
                        <option value="Tirunelveli">Tirunelveli</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Specialty *</label>
                      <select
                        value={schedSpecialty}
                        onChange={(e) => {
                          const newSpec = e.target.value;
                          setSchedSpecialty(newSpec);
                          const matchedDoc = doctors.find((d) => d.department?.toLowerCase() === newSpec.toLowerCase());
                          if (matchedDoc) setSchedDoctorId(matchedDoc.id);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:border-slate-800 outline-none"
                      >
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Orthopaedics">Orthopaedics</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Obstetrics &amp; Gynaecology">Obstetrics &amp; Gynaecology</option>
                        <option value="Paediatrics">Paediatrics</option>
                        <option value="Nephrology">Nephrology</option>
                        <option value="Gastroenterology">Gastroenterology</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Select Doctor ({schedSpecialty}) *
                      </label>
                      <select
                        value={schedDoctorId}
                        onChange={(e) => setSchedDoctorId(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:border-slate-800 outline-none"
                        required
                      >
                        {availableDoctorsForSpecialty.length > 0 ? (
                          availableDoctorsForSpecialty.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.full_name} ({doc.department} - Room: {doc.room_number})
                            </option>
                          ))
                        ) : (
                          doctors.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.full_name} ({doc.department})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1 text-xs">Patient Symptoms</label>
                    <textarea
                      rows={2}
                      value={schedSymptoms}
                      onChange={(e) => setSchedSymptoms(e.target.value)}
                      placeholder="Symptoms provided by patient during registration..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none"
                    />
                  </div>

                  {/* Date Picker & Time Slot Grid with Real-Time Double Booking Check */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700">Appointment Date *</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={schedDate}
                          onChange={(e) => setSchedDate(e.target.value)}
                          className="px-2.5 py-1 text-xs rounded border border-slate-300 bg-white font-medium text-slate-800 outline-none"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-emerald-800 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
                        </span>
                        <span className="flex items-center gap-1 text-rose-800 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Booked (Blocked)
                        </span>
                      </div>
                    </div>

                    {/* Time Slots Grid (Requirement 2: Show ONLY available slots) */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Available Time Slots ({availableSlots.length} unbooked):
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          ✓ Anti-Collision Active
                        </span>
                      </div>

                      {availableSlots.length === 0 ? (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                          <i className="fa-solid fa-triangle-exclamation text-amber-600 shrink-0"></i>
                          <span>No unbooked slots available for this doctor on {schedDate}. Please select another date.</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                          {availableSlots.map((slot) => {
                            const isSelected = schedTime === slot.time;
                            return (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => setSchedTime(slot.time)}
                                className={`py-2 px-1 rounded-md text-[11px] font-bold transition text-center border cursor-pointer ${
                                  isSelected
                                    ? 'bg-sky-800 text-white border-sky-800 shadow-xs ring-2 ring-sky-300'
                                    : 'bg-emerald-50/80 text-emerald-950 border-emerald-300/80 hover:bg-emerald-100 hover:border-emerald-500'
                                }`}
                              >
                                <span className="block text-[9px] text-emerald-600 font-normal">Available</span>
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Selected Slot: <strong className="text-slate-900 font-mono">{schedDate} at {schedTime}</strong> with{' '}
                      <strong className="text-sky-900">
                        {doctors.find((d) => d.id === schedDoctorId)?.full_name || 'Selected Doctor'}
                      </strong>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <i className="fa-solid fa-check"></i>
                      <span>Confirm Appointment (Assign Doctor &amp; Slot)</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder={
              isDoctor
                ? `Search ${doctorDept || 'General Medicine'} appointments...`
                : "Search by token, patient name, UHID, department, or doctor..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {!isDoctor && (
          <div className="w-48">
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-700 bg-white font-medium"
            >
              <option value="All">All Departments</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Orthopaedics">Orthopaedics</option>
              <option value="Neurology">Neurology</option>
              <option value="Obstetrics & Gynaecology">Obstetrics & Gynaecology</option>
              <option value="Paediatrics">Paediatrics</option>
              <option value="Nephrology">Nephrology</option>
              <option value="Gastroenterology">Gastroenterology</option>
            </select>
          </div>
        )}

        <div className="w-36">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-700 bg-white font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Token No.</th>
                <th className="p-3">Date & Slot</th>
                <th className="p-3">Patient Name (UHID)</th>
                <th className="p-3">Consultant Doctor</th>
                <th className="p-3">Department</th>
                <th className="p-3">Type & Symptoms</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions & Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No matching appointments found.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition group">
                    <td className="p-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {apt.appointment_no}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{apt.appointment_date}</div>
                      <div className="text-[10px] text-slate-400">{apt.appointment_time}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{apt.patient_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{apt.patient_uhid}</div>
                      {apt.status === 'Appointment Pending' ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded font-bold w-fit">
                          <i className="fa-solid fa-clock text-amber-600 text-[9px]"></i>
                          <span>Awaiting Doctor &amp; Slot</span>
                        </div>
                      ) : apt.status === 'Appointment Confirmed' ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-sky-800 bg-sky-50 border border-sky-300 px-1.5 py-0.5 rounded font-bold w-fit">
                          <i className="fa-solid fa-calendar-check text-sky-600 text-[9px]"></i>
                          <span>Confirmed • Ready for Doctor</span>
                        </div>
                      ) : apt.status === 'Consultation In Progress' ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-800 bg-indigo-50 border border-indigo-300 px-1.5 py-0.5 rounded font-bold w-fit">
                          <i className="fa-solid fa-stethoscope text-indigo-600 text-[9px]"></i>
                          <span>In Consultation</span>
                        </div>
                      ) : apt.status === 'Consultation Completed' || apt.status === 'Payment Pending' ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-800 bg-purple-50 border border-purple-300 px-1.5 py-0.5 rounded font-bold w-fit">
                          <i className="fa-solid fa-file-invoice-dollar text-purple-600 text-[9px]"></i>
                          <span>Consultation Done • Fee Pending (₹945)</span>
                        </div>
                      ) : apt.status === 'Paid' || apt.status === 'Documents Ready' || apt.payment_status === 'Paid' ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded font-bold w-fit">
                          <i className="fa-solid fa-circle-check text-emerald-600 text-[9px]"></i>
                          <span>Paid ₹{getAppointmentInvoiceTotal(apt).toFixed(2)} • Documents Ready</span>
                        </div>
                      ) : apt.status === 'Printed' ? (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-800 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-bold w-fit">
                          <i className="fa-solid fa-print text-slate-600 text-[9px]"></i>
                          <span>Printed &amp; Archived</span>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-medium w-fit">
                          <span>{apt.status}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      <div>{apt.doctor_name || 'Unassigned Doctor'}</div>
                      {apt.patient_location && (
                        <div className="text-[10px] text-slate-400">{apt.patient_location}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded text-[10px] font-medium">
                        {apt.specialty || apt.department}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="font-medium text-slate-800">{apt.appointment_type}</div>
                      <div className="text-[10px] text-slate-400 truncate">{apt.symptoms || 'General OPD'}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {apt.status === 'Appointment Pending' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-300">
                          <i className="fa-solid fa-clock text-amber-600 text-[9px]"></i>
                          Appointment Pending
                        </span>
                      ) : apt.status === 'Appointment Confirmed' || apt.status === 'Confirmed' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border bg-sky-50 text-sky-800 border-sky-300">
                          <i className="fa-solid fa-calendar-check text-sky-600 text-[9px]"></i>
                          Appointment Confirmed
                        </span>
                      ) : apt.status === 'Consultation In Progress' || apt.status === 'Consultation Pending' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border bg-indigo-50 text-indigo-800 border-indigo-300">
                          <i className="fa-solid fa-stethoscope text-indigo-600 text-[9px]"></i>
                          {apt.status}
                        </span>
                      ) : apt.status === 'Consultation Completed' || apt.status === 'Payment Pending' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border bg-purple-50 text-purple-800 border-purple-300">
                          <i className="fa-solid fa-file-invoice-dollar text-purple-600 text-[9px]"></i>
                          Consultation Completed • Fee Pending
                        </span>
                      ) : apt.status === 'Paid' || apt.status === 'Documents Ready' || apt.status === 'Receipt Generated' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-300">
                          <i className="fa-solid fa-circle-check text-emerald-600 text-[9px]"></i>
                          Paid • Documents Ready
                        </span>
                      ) : apt.status === 'Cancelled' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border bg-rose-50 text-rose-800 border-rose-300">
                          <i className="fa-solid fa-ban text-rose-600 text-[9px]"></i>
                          Cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border bg-slate-50 text-slate-700 border-slate-300">
                          <i className="fa-solid fa-circle-check text-slate-500 text-[9px]"></i>
                          {apt.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* RECEPTIONIST ASSIGN DOCTOR & SLOT BUTTON FOR PENDING APPOINTMENTS */}
                        {apt.status === 'Appointment Pending' && !isDoctor && !isPatient && (
                          <button
                            type="button"
                            onClick={() => {
                              handleLoadPatientForScheduling(apt.patient_uhid || apt.appointment_no);
                              setIsSchedulingOpen(true);
                              window.scrollTo({ top: 120, behavior: 'smooth' });
                            }}
                            title="Assign Doctor, Date & Time Slot"
                            className="px-2.5 py-1 text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <i className="fa-solid fa-calendar-plus text-[10px] text-amber-700"></i>
                            <span>Assign Slot</span>
                          </button>
                        )}

                        {/* PRINT OFFICIAL TOKEN PASS BUTTON (Requirement 4 & 5) */}
                        <button
                          type="button"
                          onClick={() => handleOpenTokenModal(apt)}
                          title="Generate / Print Official Token Pass"
                          className="px-2 py-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <i className="fa-solid fa-ticket text-[10px] text-emerald-600"></i>
                          <span>Token</span>
                        </button>

                        {/* COLLECT OPD FEE BUTTON (ONLY ALLOWED AFTER DOCTOR COMPLETES CONSULTATION - Requirement 6 & 7) */}
                        {onCollectOPDFee && !isDoctor && !isPatient && (apt.status === 'Consultation Completed' || (apt.consultation_completed && apt.payment_status !== 'Paid')) && (
                          <button
                            type="button"
                            onClick={() => handleCollectFee(apt)}
                            title="Collect Post-Consultation Fee (₹700 + ₹200 Nursing + ₹45 Tax = ₹945)"
                            className="px-2.5 py-1 text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-lg transition font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs animate-pulse"
                          >
                            <i className="fa-solid fa-indian-rupee-sign text-[10px]"></i>
                            <span>Collect ₹945</span>
                          </button>
                        )}

                        {/* UPDATE / EDIT BUTTON */}
                        <button
                          onClick={() => handleOpenEdit(apt)}
                          disabled={isTokenFrozen(apt)}
                          title={isTokenFrozen(apt) ? 'Token frozen after consultation — editing not allowed' : 'Update Appointment & Token Details'}
                          className={`px-2 py-1 rounded-lg transition font-semibold text-[11px] flex items-center gap-1 ${isTokenFrozen(apt) ? 'text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed opacity-60' : 'text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 cursor-pointer'}`}
                        >
                          <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                          <span>Update</span>
                        </button>

                        {/* FEE RECEIPT BUTTON (ENABLED ONLY ONCE PAID) */}
                        {onPrintFeeReceipt && (apt.payment_status === 'Paid' || apt.status === 'Paid' || apt.status === 'Printed') && (
                          <button
                            type="button"
                            onClick={() => onPrintFeeReceipt(apt)}
                            title="Print Official Consultation Fee Receipt"
                            className="px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <i className="fa-solid fa-receipt text-[10px]"></i>
                            <span>Receipt</span>
                          </button>
                        )}

                        {/* DELETE / DUSTBIN BUTTON */}
                        <button
                          onClick={() => setAppointmentToDelete(apt)}
                          disabled={isTokenFrozen(apt)}
                          title={isTokenFrozen(apt) ? 'Token frozen after consultation — deletion not allowed' : 'Delete / Cancel Slot (Dustbin)'}
                          className={`p-1.5 rounded-lg transition text-xs flex items-center justify-center ${isTokenFrozen(apt) ? 'text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed opacity-60' : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer'}`}
                        >
                          <i className="fa-solid fa-trash-can text-rose-600"></i>
                        </button>

                        {/* CONSULT BUTTON (DOCTOR ROLE ONLY - NEVER LOCKED BY UNPAID FEE) */}
                        {currentUser?.role === 'DOCTOR' && (
                          apt.status === 'Appointment Pending' ? (
                            <span
                              title="Receptionist must assign Doctor & Slot first"
                              className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-medium"
                            >
                              Pending Slot
                            </span>
                          ) : apt.status === 'Consultation Completed' || apt.status === 'Payment Pending' || apt.consultation_completed ? (
                            <span
                              title="Consultation already completed. Further consultation is locked."
                              className="bg-purple-50 text-purple-800 border border-purple-300 px-2 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <i className="fa-solid fa-lock text-[10px]"></i>
                              <span>Completed {apt.total_amount ? `• ₹${apt.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Collected` : '• Fee Pending'}</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                if (onExaminePatient) {
                                  onExaminePatient(apt);
                                } else {
                                  onNavigate('consultations');
                                }
                              }}
                              title="Start Clinical Consultation (No upfront fee required)"
                              className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium transition shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <i className="fa-solid fa-stethoscope text-[10px]"></i>
                              <span>Consult</span>
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <i className="fa-solid fa-calendar-plus text-sky-400"></i> Schedule OPD Consultation Slot
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Patient *</label>
                {patients.length > 0 ? (
                  <select
                    value={patientId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPatientId(val === 'manual' ? 'manual' : Number(val));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white font-medium"
                    required
                  >
                    <option value="manual">+ Direct Entry / Walk-in Patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.uhid} - {p.phone})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs mb-2">
                    <span className="font-semibold text-slate-700 block">Direct Patient Walk-In Booking</span>
                    <span>No registered patients found. Enter patient details below directly:</span>
                  </div>
                )}
              </div>

              {(patientId === 'manual' || patients.length === 0) && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Patient Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={manualPatientName}
                        onChange={(e) => setManualPatientName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-800 outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9840012345"
                        value={manualPatientPhone}
                        onChange={(e) => setManualPatientPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-800 outline-none text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Age (Years)</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="e.g. 32"
                        value={manualPatientAge}
                        onChange={(e) => setManualPatientAge(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-800 outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Gender</label>
                      <select
                        value={manualPatientGender}
                        onChange={(e) => setManualPatientGender(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-800 outline-none text-xs"
                      >
                        <option value="" disabled>Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Consulting Doctor *</label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white font-medium"
                  required
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.department} - Fee: ₹{d.consultation_fee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Consultation Date *</label>
                  <input
                    type="date"
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time Slot *</label>
                  <select
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Appointment Type</label>
                <select
                  value={apptType}
                  onChange={(e) => setApptType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white"
                >
                  <option value="New Consultation">New Consultation</option>
                  <option value="Follow-up Visit">Follow-up Visit</option>
                  <option value="Report Review">Diagnostic Report Review</option>
                  <option value="Second Opinion">Second Opinion</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Chief Complaints / Symptoms</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Chest tightness on exertion, shortness of breath, mild fever..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 rounded-lg shadow-xs text-xs transition"
                >
                  Confirm Slot Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE / EDIT APPOINTMENT MODAL */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <i className="fa-solid fa-pen-to-square text-sky-400"></i> Update Appointment & Token Record
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5 font-mono">
                  Token: {editingAppointment.appointment_no} • {editingAppointment.patient_name} ({editingAppointment.patient_uhid})
                </p>
              </div>
              <button
                onClick={() => setEditingAppointment(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Slot Time *</label>
                  <select
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 bg-white"
                    required
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Consulting Doctor *</label>
                <select
                  value={editDoctorId}
                  onChange={(e) => setEditDoctorId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 bg-white"
                  required
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.department} - {d.opd_room})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status (Auto)</label>
                  <div
                    className={`w-full px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center gap-1.5 ${
                      editStatus === 'Appointment Pending'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : editStatus === 'Appointment Confirmed' || editStatus === 'Confirmed'
                        ? 'bg-sky-50 text-sky-800 border-sky-300'
                        : editStatus === 'Consultation Completed' || editStatus === 'Consultation In Progress' || editStatus === 'Consultation Pending'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                        : editStatus === 'Paid' || editStatus === 'Documents Ready' || editStatus === 'Receipt Generated'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <i className="fa-solid fa-mobile-screen-button text-[10px]"></i>
                    {editStatus}
                    <span className="ml-auto text-[9px] font-normal text-slate-500">
                      Auto-updated by system
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Visit Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 bg-white"
                  >
                    <option value="New Consultation">New Consultation</option>
                    <option value="Follow-up Visit">Follow-up Visit</option>
                    <option value="Routine Checkup">Routine Checkup</option>
                    <option value="Emergency Review">Emergency Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Symptoms / Chief Complaints</label>
                <textarea
                  rows={2}
                  value={editSymptoms}
                  onChange={(e) => setEditSymptoms(e.target.value)}
                  placeholder="Patient symptoms and medical concerns..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-4 py-1.5 rounded-lg shadow-xs text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE / DUSTBIN CONFIRMATION MODAL */}
      {appointmentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-trash-can text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Appointment Record?
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Are you sure you want to permanently delete this slot token:
                </p>
                <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 text-xs">Token: {appointmentToDelete.appointment_no}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Patient: {appointmentToDelete.patient_name} ({appointmentToDelete.patient_uhid})</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Doctor: {appointmentToDelete.doctor_name} • {appointmentToDelete.appointment_date} at {appointmentToDelete.appointment_time}</div>
                </div>
                <p className="text-[11px] text-rose-600 font-medium mt-2">
                  <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                  This slot will be removed from the appointment scheduler.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setAppointmentToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <i className="fa-solid fa-trash-can"></i>
                <span>{isDeleting ? 'Deleting...' : 'Delete Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENT TOKEN MODAL & PRINT SLIP (Requirement 4 & 5) */}
      <AppointmentTokenModal
        isOpen={isTokenModalOpen}
        onClose={() => {
          setIsTokenModalOpen(false);
          setSelectedApptForToken(null);
        }}
        appointment={selectedApptForToken}
        patient={patients.find((p) => p.id === selectedApptForToken?.patient_id || p.uhid === selectedApptForToken?.patient_uhid)}
        doctor={doctors.find((d) => d.id === selectedApptForToken?.doctor_id || d.full_name === selectedApptForToken?.doctor_name)}
      />
    </div>
  );
};
