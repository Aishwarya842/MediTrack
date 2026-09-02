import React, { useState } from 'react';
import { Appointment, Patient, Doctor, Consultation, Prescription, Invoice } from '../data/hospitalData';

interface PatientApplicationTrackerProps {
  currentUser: any;
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  invoices: Invoice[];
  onUpdateStatus?: (id: number, status: 'Confirmed' | 'Completed' | 'Cancelled') => void;
  onNavigate?: (view: string) => void;
}

export const PatientApplicationTracker: React.FC<PatientApplicationTrackerProps> = ({
  currentUser,
  appointments,
  patients,
  doctors,
  consultations,
  prescriptions,
  invoices,
  onUpdateStatus,
  onNavigate
}) => {
  const role = currentUser?.role || 'PATIENT';
  const [searchQuery, setSearchQuery] = useState('');

  // Find the target appointment/application for the patient or searched token
  const defaultAppt = role === 'PATIENT'
    ? appointments.find(
        (a) =>
          a.patient_uhid === currentUser?.patient_uhid ||
          a.patient_name.toLowerCase() === currentUser?.full_name?.toLowerCase() ||
          a.appointment_no === currentUser?.token_no
      ) || appointments[0]
    : appointments[0];

  const [selectedApptId, setSelectedApptId] = useState<number>(defaultAppt?.id || 1);

  // Active appointment
  const currentAppt = appointments.find((a) => a.id === selectedApptId) || appointments[0];

  // Matched patient details
  const matchedPatient = patients.find(
    (p) =>
      p.id === currentAppt?.patient_id ||
      p.uhid === currentAppt?.patient_uhid ||
      p.full_name.toLowerCase() === currentAppt?.patient_name.toLowerCase()
  );

  // Matched doctor details
  const matchedDoctor = doctors.find((d) => d.id === currentAppt?.doctor_id);

  // Matched clinical consultation
  const matchedConsultation = consultations.find(
    (c) =>
      c.patient_uhid === currentAppt?.patient_uhid ||
      c.patient_name.toLowerCase() === currentAppt?.patient_name.toLowerCase()
  );

  // Matched prescription
  const matchedPrescription = prescriptions.find(
    (p) =>
      p.patient_uhid === currentAppt?.patient_uhid ||
      p.patient_name.toLowerCase() === currentAppt?.patient_name.toLowerCase()
  );

  // Matched invoice
  const matchedInvoice = invoices.find(
    (i) =>
      i.patient_uhid === currentAppt?.patient_uhid ||
      i.patient_name.toLowerCase() === currentAppt?.patient_name.toLowerCase()
  );

  // Filtered appointments for staff lookup
  const filteredAppointments = appointments.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.appointment_no.toLowerCase().includes(q) ||
      a.patient_name.toLowerCase().includes(q) ||
      a.patient_uhid.toLowerCase().includes(q) ||
      a.doctor_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Search Header for Staff Roles */}
      {role !== 'PATIENT' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-satellite-dish text-sky-600"></i>
              <span>Patient Application &amp; OPD Status Inspector</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time inspection of patient application tokens, queue states, and clinical outcomes
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search Token (e.g. APT-2026-1001), UHID, or Patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 font-medium focus:border-slate-800 outline-none text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Tracker Container */}
      {currentAppt ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Top Token Badge Bar */}
          <div className="bg-slate-950 text-white p-5 sm:p-6 flex flex-wrap justify-between items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                  TOKEN: {currentAppt.appointment_no}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  currentAppt.status === 'Confirmed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : currentAppt.status === 'Completed'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  ● Status: {currentAppt.status}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentAppt.patient_name}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                UHID: {currentAppt.patient_uhid} • OPD Category: {currentAppt.appointment_type}
              </p>
            </div>

            {/* Quick Status Control for Staff */}
            {role !== 'PATIENT' && onUpdateStatus && (
              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold px-1">Update Status:</span>
                <button
                  onClick={() => onUpdateStatus(currentAppt.id, 'Confirmed')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    currentAppt.status === 'Confirmed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => onUpdateStatus(currentAppt.id, 'Completed')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    currentAppt.status === 'Completed'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => onUpdateStatus(currentAppt.id, 'Cancelled')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    currentAppt.status === 'Cancelled'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            )}
          </div>

          {/* 5-Step Procedural Application Timeline */}
          <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">
              Procedural OPD Journey Timeline
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Step 1: Submission */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs relative">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Token Generated</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {currentAppt.appointment_no} registered on {currentAppt.appointment_date}
                </p>
              </div>

              {/* Step 2: OPD Slot & Doctor Allocation */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs relative">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Doctor Allocated</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {currentAppt.doctor_name} ({currentAppt.appointment_time})
                </p>
              </div>

              {/* Step 3: Clinical Consultation */}
              <div className={`p-3.5 rounded-xl border shadow-2xs relative ${
                matchedConsultation || currentAppt.status === 'Completed'
                  ? 'bg-white border-emerald-200 text-emerald-900'
                  : 'bg-slate-100/70 border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    matchedConsultation || currentAppt.status === 'Completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}>3</span>
                  <span>OPD Consultation</span>
                </div>
                <p className="text-[11px]">
                  {matchedConsultation ? matchedConsultation.diagnosis : 'Awaiting clinical exam'}
                </p>
              </div>

              {/* Step 4: Digital Prescription & Invoice */}
              <div className={`p-3.5 rounded-xl border shadow-2xs relative ${
                matchedPrescription
                  ? 'bg-white border-emerald-200 text-emerald-900'
                  : 'bg-slate-100/70 border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    matchedPrescription
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}>4</span>
                  <span>Rx &amp; Billing Issued</span>
                </div>
                <p className="text-[11px]">
                  {matchedPrescription ? matchedPrescription.prescription_no : 'Pending final Rx'}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Patient Profile Info */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="font-bold text-xs text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
                <i className="fa-solid fa-user-tag text-slate-500"></i>
                <span>Patient Demographics</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Full Name:</span>
                  <strong className="text-slate-900">{currentAppt.patient_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">UHID:</span>
                  <span className="font-mono font-bold text-slate-800">{currentAppt.patient_uhid}</span>
                </div>
                {matchedPatient && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-mono text-slate-800">{matchedPatient.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Age / Gender:</span>
                      <span>{matchedPatient.age} Yrs / {matchedPatient.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Blood Group:</span>
                      <span className="font-bold text-rose-600">{matchedPatient.blood_group}</span>
                    </div>
                  </>
                )}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Symptoms / Visit Reason:</span>
                  <p className="text-slate-800 font-medium bg-white p-2 rounded border border-slate-200 text-[11px]">
                    {currentAppt.symptoms || 'General OPD Consultation'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Doctor & Room Info */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="font-bold text-xs text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
                <i className="fa-solid fa-stethoscope text-sky-600"></i>
                <span>Assigned Medical Specialist</span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Doctor:</span>
                  <strong className="text-slate-900">{currentAppt.doctor_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-[10px]">
                    {currentAppt.department}
                  </span>
                </div>
                {matchedDoctor && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consultation Room:</span>
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {matchedDoctor.room_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Available Days:</span>
                      <span className="text-slate-700 font-medium text-[11px]">{matchedDoctor.available_days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">OPD Timings:</span>
                      <span className="text-slate-700 font-medium text-[11px]">{matchedDoctor.opd_timing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consultation Fee:</span>
                      <strong className="text-emerald-700 font-mono">₹{matchedDoctor.consultation_fee}</strong>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-400">Slot Date &amp; Time:</span>
                  <span className="font-bold text-slate-900">{currentAppt.appointment_date} at {currentAppt.appointment_time}</span>
                </div>
              </div>
            </div>

            {/* 3. Clinical Rx & Billing Outcome */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <div className="font-bold text-xs text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center gap-2">
                <i className="fa-solid fa-receipt text-emerald-600"></i>
                <span>Clinical &amp; Billing Outcome</span>
              </div>
              <div className="text-xs space-y-2 text-slate-700">
                {matchedPrescription ? (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-900 font-mono">{matchedPrescription.prescription_no}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">Rx Issued</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {matchedPrescription.medicines.length} Medicines Prescribed
                    </p>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('prescriptions')}
                        className="text-sky-600 hover:text-sky-800 text-[11px] font-bold mt-1 inline-flex items-center gap-1 cursor-pointer"
                      >
                        View &amp; Print Full Rx →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 bg-white rounded-lg border border-dashed border-slate-200 text-slate-400 text-center text-[11px]">
                    Prescription will appear here once doctor finishes consultation.
                  </div>
                )}

                {matchedInvoice ? (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-900 font-mono">{matchedInvoice.invoice_no}</span>
                      <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-semibold border border-sky-200">
                        {matchedInvoice.payment_status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Total Settled (5% GST):</span>
                      <strong className="text-slate-900 font-mono">₹{matchedInvoice.total_amount.toFixed(2)}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-white rounded-lg border border-dashed border-slate-200 text-slate-400 text-center text-[11px]">
                    Billing receipt is generated upon consultation completion.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* If Staff: List of All Bookings to Switch */}
          {role !== 'PATIENT' && filteredAppointments.length > 1 && (
            <div className="p-4 bg-slate-100/80 border-t border-slate-200">
              <div className="text-[11px] font-bold text-slate-600 uppercase mb-2">
                All Filtered Patient Tokens ({filteredAppointments.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredAppointments.map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => setSelectedApptId(apt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      apt.id === currentAppt.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono">{apt.appointment_no}</span>: {apt.patient_name}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
          No active patient application token found. Please enter a valid token number or phone number.
        </div>
      )}
    </div>
  );
};
