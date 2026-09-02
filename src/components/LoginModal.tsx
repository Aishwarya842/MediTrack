import React, { useState, useEffect } from 'react';
import { Doctor, Patient, Appointment } from '../data/hospitalData';
import { dbService } from '../services/db';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
  initialCategory?: 'STAFF' | 'PATIENT';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  initialCategory = 'STAFF'
}) => {
  const [activeTab, setActiveTab] = useState<'STAFF' | 'PATIENT'>(initialCategory);
  const [staffRole, setStaffRole] = useState<'DOCTOR' | 'ADMIN' | 'RECEPTIONIST'>('DOCTOR');
  
  // Doctor selection
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);

  // Admin & Receptionist Password-only fields (No Name required)
  const [adminPassword, setAdminPassword] = useState('');
  const [receptionistPassword, setReceptionistPassword] = useState('');

  // Patient Login fields (Mobile Number + Token / UHID)
  const [patientPhone, setPatientPhone] = useState('');
  const [patientToken, setPatientToken] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const docs = dbService.getDoctors();
      setDoctorsList(docs);
      if (docs.length > 0) {
        setSelectedDoctorId(docs[0].id);
      }
      setErrorMessage('');
      if (initialCategory) {
        setActiveTab(initialCategory);
      }
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (staffRole === 'DOCTOR') {
      const doc = doctorsList.find((d) => d.id === Number(selectedDoctorId)) || doctorsList[0];
      if (!doc) {
        setErrorMessage('Please select a valid doctor from the dropdown.');
        return;
      }
      onLogin({
        id: doc.id + 10,
        username: doc.full_name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        full_name: doc.full_name,
        doctor_id: doc.id,
        role: 'DOCTOR',
        department: doc.department,
        qualification: doc.qualification,
        registration_no: doc.registration_no,
        email: doc.email
      });
      onClose();
      return;
    }

    if (staffRole === 'ADMIN') {
      if (!adminPassword.trim()) {
        setErrorMessage('Please enter the Admin security password.');
        return;
      }
      // Accept admin, admin123 or standard pass
      if (adminPassword.trim() !== 'admin' && adminPassword.trim() !== 'admin123' && adminPassword.trim() !== 'meditrack') {
        setErrorMessage('Invalid Admin Password. (Default: admin or admin123)');
        return;
      }
      onLogin({
        id: 1,
        username: 'admin',
        full_name: 'Medical Director (Admin)',
        role: 'ADMIN',
        department: 'Hospital Administration & Governance',
        email: 'admin@meditrack.in'
      });
      onClose();
      return;
    }

    if (staffRole === 'RECEPTIONIST') {
      if (!receptionistPassword.trim()) {
        setErrorMessage('Please enter the Receptionist desk password.');
        return;
      }
      // Accept reception, reception123, 1234 or desk
      if (
        receptionistPassword.trim() !== 'reception' &&
        receptionistPassword.trim() !== 'reception123' &&
        receptionistPassword.trim() !== '1234'
      ) {
        setErrorMessage('Invalid Receptionist Password. (Default: reception or reception123)');
        return;
      }
      onLogin({
        id: 4,
        username: 'reception_opd',
        full_name: 'Front Desk OPD Receptionist',
        role: 'RECEPTIONIST',
        department: 'Front Desk & Patient Token Station',
        email: 'reception@meditrack.in'
      });
      onClose();
      return;
    }
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhone = patientPhone.replace(/\D/g, '');
    const cleanToken = patientToken.trim().toUpperCase();

    if (!cleanPhone || cleanPhone.length < 5) {
      setErrorMessage('Please enter a valid patient mobile number.');
      return;
    }

    if (!cleanToken) {
      setErrorMessage('Please enter your Appointment Token No. or Patient UHID.');
      return;
    }

    const allPatients = dbService.getPatients();
    const allAppointments = dbService.getAppointments();

    // Check matching appointment by token or uhid
    const matchedAppt = allAppointments.find(
      (a) =>
        a.appointment_no.toUpperCase() === cleanToken ||
        a.appointment_no.toUpperCase().endsWith(cleanToken) ||
        a.patient_uhid.toUpperCase() === cleanToken
    );

    // Check matching patient by phone or uhid
    const matchedPatient = allPatients.find(
      (p) =>
        p.phone.replace(/\D/g, '').includes(cleanPhone) ||
        p.uhid.toUpperCase() === cleanToken
    );

    const displayName = matchedAppt?.patient_name || matchedPatient?.full_name || `Patient (${cleanPhone.slice(-4)})`;
    const patientUhid = matchedAppt?.patient_uhid || matchedPatient?.uhid || (cleanToken.startsWith('UHID') ? cleanToken : `UHID-2026-${cleanPhone.slice(-4)}`);
    const patientId = matchedPatient?.id || matchedAppt?.patient_id || 1;

    onLogin({
      id: patientId,
      username: `patient_${cleanPhone}`,
      full_name: displayName,
      phone: patientPhone,
      patient_id: patientId,
      patient_uhid: patientUhid,
      token_no: matchedAppt?.appointment_no || cleanToken,
      role: 'PATIENT',
      email: `${cleanPhone}@patient.meditrack.in`
    });

    onClose();
  };

  const currentSelectedDoc = doctorsList.find((d) => d.id === Number(selectedDoctorId));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-950 text-white px-6 py-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 flex items-center justify-center text-lg shadow-xs">
              <i className="fa-solid fa-heart-pulse"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>MEDI TRACK PORTAL</span>
              </h3>
              <p className="text-xs text-slate-400">
                Hospital Intranet &amp; Patient Live Status Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
            aria-label="Close dialog"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Top Level Category Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('STAFF');
                setErrorMessage('');
              }}
              className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'STAFF'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-user-shield text-sky-600"></i>
              <span>Hospital Staff</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('PATIENT');
                setErrorMessage('');
              }}
              className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'PATIENT'
                  ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-solid fa-hospital-user text-emerald-600"></i>
              <span>Patient (Outsider)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 font-medium leading-relaxed">
              <i className="fa-solid fa-circle-exclamation text-rose-500 mt-0.5 shrink-0"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: HOSPITAL STAFF */}
          {activeTab === 'STAFF' && (
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              {/* Sub-Role Selector: Doctor / Admin / Receptionist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Staff Role
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffRole('DOCTOR');
                      setErrorMessage('');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      staffRole === 'DOCTOR'
                        ? 'bg-white text-sky-900 shadow-xs border border-sky-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <i className="fa-solid fa-user-doctor text-sky-600"></i>
                    <span>Doctor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStaffRole('ADMIN');
                      setErrorMessage('');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      staffRole === 'ADMIN'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <i className="fa-solid fa-shield-halved text-slate-700"></i>
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStaffRole('RECEPTIONIST');
                      setErrorMessage('');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      staffRole === 'RECEPTIONIST'
                        ? 'bg-white text-amber-900 shadow-xs border border-amber-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <i className="fa-solid fa-headset text-amber-600"></i>
                    <span>Reception</span>
                  </button>
                </div>
              </div>

              {/* 1. DOCTOR: DROPDOWN OF ALL DOCTORS, NO PASSWORD REQUIRED */}
              {staffRole === 'DOCTOR' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
                      <span>Choose Doctor Name *</span>
                      <span className="text-[11px] font-normal text-sky-600">Direct Doctor Access</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 outline-none transition"
                        autoFocus
                      >
                        {doctorsList.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.full_name} – {doc.department} ({doc.room_number})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {currentSelectedDoc && (
                    <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs space-y-1 text-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sky-950">{currentSelectedDoc.full_name}</span>
                        <span className="text-[10px] font-mono font-semibold bg-white px-2 py-0.5 rounded border border-sky-200 text-sky-800">
                          {currentSelectedDoc.room_number}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {currentSelectedDoc.specialization} • TNMC: {currentSelectedDoc.registration_no}
                      </p>
                      <p className="text-[11px] text-sky-700 font-medium pt-1">
                        🗓️ Days: {currentSelectedDoc.available_days}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer mt-2"
                  >
                    <i className="fa-solid fa-stethoscope"></i>
                    <span>Log In as {currentSelectedDoc?.full_name?.split(' ')[1] || 'Doctor'}</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </div>
              )}

              {/* 2. ADMIN: ONLY PASSWORD, NO NAME REQUIRED */}
              {staffRole === 'ADMIN' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Admin Password * <span className="text-[11px] font-normal text-slate-400">(No username needed)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                        <i className="fa-solid fa-lock"></i>
                      </div>
                      <input
                        type="password"
                        placeholder="Enter Admin Password (e.g. admin or admin123)"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-medium text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Standard Default: <span className="font-mono font-semibold text-slate-600">admin</span> or <span className="font-mono font-semibold text-slate-600">admin123</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer mt-2"
                  >
                    <i className="fa-solid fa-shield-halved"></i>
                    <span>Sign In as Hospital Administrator</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </div>
              )}

              {/* 3. RECEPTIONIST: ONLY PASSWORD, NO NAME REQUIRED */}
              {staffRole === 'RECEPTIONIST' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Receptionist Desk Password * <span className="text-[11px] font-normal text-slate-400">(No name needed)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                        <i className="fa-solid fa-key"></i>
                      </div>
                      <input
                        type="password"
                        placeholder="Enter Receptionist Password (e.g. reception or reception123)"
                        value={receptionistPassword}
                        onChange={(e) => setReceptionistPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-medium text-slate-800 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Standard Default: <span className="font-mono font-semibold text-slate-600">reception</span> or <span className="font-mono font-semibold text-slate-600">reception123</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer mt-2"
                  >
                    <i className="fa-solid fa-headset"></i>
                    <span>Sign In to Receptionist Token Desk</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: PATIENT (OUTSIDER) VIA PHONE NUMBER AND TOKEN NUMBER */}
          {activeTab === 'PATIENT' && (
            <form onSubmit={handlePatientSubmit} className="space-y-3.5">
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-0.5">
                  <i className="fa-solid fa-satellite-dish text-emerald-600"></i>
                  <span>Patient Live Application &amp; Queue Tracker</span>
                </div>
                Enter your mobile number along with your Appointment Token No. or UHID to view your live consultation status.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Mobile Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. 9840012345 or +91 98400 12345"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-medium text-slate-800 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none transition"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Token No. or UHID *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs">
                    <i className="fa-solid fa-ticket"></i>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. APT-2026-1001 or UHID-2026-0001 or 1001"
                    value={patientToken}
                    onChange={(e) => setPatientToken(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono font-medium text-slate-800 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 outline-none transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sample Token: <span className="font-mono text-slate-600 font-semibold">APT-2026-1001</span> or UHID: <span className="font-mono text-slate-600 font-semibold">UHID-2026-0001</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer mt-2"
              >
                <i className="fa-solid fa-magnifying-glass-location"></i>
                <span>Track My Application &amp; View Status</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <i className="fa-solid fa-shield-halved text-slate-400"></i> NABH &amp; HIPAA Verified
          </span>
          <span className="text-slate-400">MediTrack Database v3.2</span>
        </div>

      </div>
    </div>
  );
};
