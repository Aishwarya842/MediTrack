import React, { useState, useMemo } from 'react';
import { Patient, Doctor, Appointment, Invoice, Prescription } from '../data/hospitalData';

interface DashboardViewProps {
  currentUser: any;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  invoices: Invoice[];
  prescriptions?: Prescription[];
  notifications?: any[];
  onNavigate: (view: string) => void;
  onExaminePatient?: (appointment: Appointment) => void;
  onUpdateAppointment?: (appointment: Appointment) => Promise<void> | void;
  onDeleteAppointment?: (appointmentId: number) => Promise<void> | void;
  onUpdatePatient?: (patient: Patient) => Promise<void> | void;
  onDeletePatient?: (patientId: number) => Promise<void> | void;
  onReceptionistRegister?: (data: any) => Promise<any>;
  onUpdateNotificationStatus?: (id: number, status: 'Unread' | 'Read' | 'Attending') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  patients,
  doctors,
  appointments,
  invoices,
  prescriptions = [],
  notifications = [],
  onNavigate,
  onExaminePatient,
  onUpdateAppointment,
  onDeleteAppointment,
  onReceptionistRegister,
  onUpdateNotificationStatus
}) => {
  const role = currentUser?.role || 'ADMIN';
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total_amount, 0);

  // Admin Department Filter State
  const [adminSelectedDept, setAdminSelectedDept] = useState<string>('All');

  // Fast Receptionist Registration Modal from Dashboard
  const [isQuickRegOpen, setIsQuickRegOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickAge, setQuickAge] = useState(32);
  const [quickGender, setQuickGender] = useState('Male');
  const [quickBlood, setQuickBlood] = useState('O+');
  const [quickDept, setQuickDept] = useState('General Medicine');
  const [quickDocId, setQuickDocId] = useState<number>(15);
  const [quickBp, setQuickBp] = useState('120/80');
  const [quickPulse, setQuickPulse] = useState(76);
  const [quickTemp, setQuickTemp] = useState('98.4 °F');
  const [quickSpo2, setQuickSpo2] = useState('99%');
  const [quickAllergies, setQuickAllergies] = useState('NKDA');
  const [quickSymptoms, setQuickSymptoms] = useState('General clinical evaluation');
  const [quickDupAlert, setQuickDupAlert] = useState<string | null>(null);

  // Filtered Appointments based on Role
  const relevantAppointments = useMemo(() => {
    if (role === 'DOCTOR') {
      // Filter by doctor's ID or doctor's full name or department
      return appointments.filter(
        (a) =>
          (currentUser?.doctor_id && a.doctor_id === currentUser.doctor_id) ||
          a.doctor_name.toLowerCase().includes(currentUser?.full_name?.toLowerCase() || '') ||
          (currentUser?.department && a.department.toLowerCase() === currentUser.department.toLowerCase())
      );
    }
    if (role === 'PATIENT') {
      return appointments.filter(
        (a) => a.patient_uhid === currentUser?.patient_uhid || a.patient_name === currentUser?.full_name
      );
    }
    if (role === 'ADMIN' && adminSelectedDept !== 'All') {
      return appointments.filter((a) => a.department.toLowerCase() === adminSelectedDept.toLowerCase());
    }
    return appointments;
  }, [appointments, role, currentUser, adminSelectedDept]);

  // Doctor's Notifications
  const doctorNotifications = useMemo(() => {
    if (role === 'DOCTOR') {
      return notifications.filter(
        (n) =>
          (currentUser?.doctor_id && n.doctor_id === currentUser.doctor_id) ||
          (n.doctor_name && n.doctor_name.toLowerCase().includes(currentUser?.full_name?.toLowerCase() || '')) ||
          (currentUser?.department && n.department && n.department.toLowerCase() === currentUser.department.toLowerCase())
      );
    }
    return notifications;
  }, [notifications, role, currentUser]);

  // Handle Fast Walk-in Registration
  const handleQuickRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !quickPhone.trim()) {
      alert('Please enter patient name and mobile number.');
      return;
    }

    if (onReceptionistRegister) {
      const res = await onReceptionistRegister({
        patientData: {
          full_name: quickName.trim(),
          phone: quickPhone.trim(),
          age: Number(quickAge),
          gender: quickGender,
          blood_group: quickBlood,
          department: quickDept,
          bp: `${quickBp} mmHg`,
          pulse: Number(quickPulse),
          temperature: quickTemp,
          spo2: quickSpo2,
          allergies: quickAllergies,
          medical_history: 'Walk-in registration from Reception Station'
        },
        doctorId: Number(quickDocId),
        department: quickDept,
        appointmentType: 'Walk-in OPD Consultation',
        symptoms: quickSymptoms
      });

      if (!res.success) {
        setQuickDupAlert(res.error || 'Duplicate record detected.');
        return;
      }

      alert(`✅ Patient Registered!\nUHID: ${res.patient.uhid}\nToken: ${res.appointment.appointment_no}\nNotification sent to Doctor.`);
      setIsQuickRegOpen(false);
      setQuickName('');
      setQuickPhone('');
      setQuickDupAlert(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                role === 'ADMIN'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : role === 'DOCTOR'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  : role === 'RECEPTIONIST'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {role === 'ADMIN' && 'Hospital Command Centre (Master Admin)'}
              {role === 'DOCTOR' && `Clinical OPD Station • ${currentUser?.department || 'General Medicine'}`}
              {role === 'RECEPTIONIST' && 'Front Desk • Walk-in Registration & Token Dispatch'}
              {role === 'PATIENT' && 'Citizen Health Portal'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Welcome back, {currentUser?.full_name || 'Staff Member'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {role === 'ADMIN' &&
              'Comprehensive operational oversight: Master patient database, department-wise patient isolation, live token queues, and prescription billing audit.'}
            {role === 'DOCTOR' &&
              `Receiving patients dispatched from Reception desk for ${currentUser?.department || 'General Medicine'}. Review biological vitals and issue digital prescriptions.`}
            {role === 'RECEPTIONIST' &&
              'Register walk-in patients, take biological vitals, prevent duplicate entries, assign departments, and notify doctors instantly.'}
            {role === 'PATIENT' &&
              'View your consultation tokens, track doctor appointments, and download official medical prescriptions.'}
          </p>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-2">
          {role === 'RECEPTIONIST' && (
            <button
              onClick={() => setIsQuickRegOpen(true)}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <i className="fa-solid fa-user-plus text-sm"></i>
              <span>New Walk-in Registration</span>
            </button>
          )}

          {role === 'DOCTOR' && (
            <button
              onClick={() => onNavigate('prescriptions')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <i className="fa-solid fa-prescription text-sm"></i>
              <span>Write Digital Rx (with Fee)</span>
            </button>
          )}

          {role === 'ADMIN' && (
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('patients')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-2 rounded-lg"
              >
                Patients ({patients.length})
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg"
              >
                Audit & Reports
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. RECEPTIONIST DASHBOARD SPECIFIC VIEW                                   */}
      {/* ========================================================================= */}
      {role === 'RECEPTIONIST' && (
        <div className="space-y-6">
          {/* Quick Action Navigation Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setIsQuickRegOpen(true)}
              className="bg-white hover:border-sky-400 border border-slate-200/80 p-5 rounded-2xl shadow-xs transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg mb-3 group-hover:scale-105 transition">
                <i className="fa-solid fa-user-plus"></i>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Walk-in Registration</h3>
              <p className="text-xs text-slate-500 mt-1">
                Collect vitals, assign department, and notify doctor.
              </p>
            </div>

            <div
              onClick={() => onNavigate('patients')}
              className="bg-white hover:border-emerald-400 border border-slate-200/80 p-5 rounded-2xl shadow-xs transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-3 group-hover:scale-105 transition">
                <i className="fa-solid fa-id-card"></i>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Patient Master Registry</h3>
              <p className="text-xs text-slate-500 mt-1">
                Check UHID, phone records, and search returning patients.
              </p>
            </div>

            <div
              onClick={() => onNavigate('appointments')}
              className="bg-white hover:border-amber-400 border border-slate-200/80 p-5 rounded-2xl shadow-xs transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg mb-3 group-hover:scale-105 transition">
                <i className="fa-solid fa-ticket"></i>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">OPD Token Queue</h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage token sequence and doctor room queue status.
              </p>
            </div>

            <div
              onClick={() => onNavigate('invoices')}
              className="bg-white hover:border-purple-400 border border-slate-200/80 p-5 rounded-2xl shadow-xs transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg mb-3 group-hover:scale-105 transition">
                <i className="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Billing & Payments</h3>
              <p className="text-xs text-slate-500 mt-1">
                Collect consultation and medicine fees with 5% GST receipt.
              </p>
            </div>
          </div>

          {/* Live Walk-In & Token Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Live Front-Desk Token Queue & Dispatches</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patients registered today and queued for doctor consultation.
                </p>
              </div>

              <button
                onClick={() => onNavigate('appointments')}
                className="text-xs text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1"
              >
                <span>View Full Queue</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="p-3">Token No</th>
                    <th className="p-3">Patient & UHID</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Consultant Doctor</th>
                    <th className="p-3">Vitals Check</th>
                    <th className="p-3">Queue Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {appointments.slice(0, 6).map((apt) => {
                    const patObj = patients.find((p) => p.uhid === apt.patient_uhid || p.full_name === apt.patient_name);
                    return (
                      <tr key={apt.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono font-bold text-sky-800">
                          {apt.appointment_no}
                        </td>
                        <td className="p-3">
                          <strong className="text-slate-900 block">{apt.patient_name}</strong>
                          <span className="text-[11px] font-mono text-slate-500">{apt.patient_uhid}</span>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                            {apt.department}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 font-medium">
                          {apt.doctor_name}
                        </td>
                        <td className="p-3">
                          {patObj ? (
                            <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              BP: {patObj.bp || '120/80'} | Pls: {patObj.pulse || 76}
                            </span>
                          ) : (
                            <span className="text-slate-400">Normal</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              apt.status === 'Confirmed'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : apt.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {apt.status === 'Confirmed' ? 'Waiting in OPD' : apt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DOCTOR DASHBOARD SPECIFIC VIEW                                         */}
      {/* ========================================================================= */}
      {role === 'DOCTOR' && (
        <div className="space-y-6">
          {/* Incoming Reception Notification Alert Box */}
          {doctorNotifications.length > 0 && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                  <i className="fa-solid fa-bell text-sky-600 text-base animate-bounce"></i>
                  <span>Internal Reception Alerts: Patients Dispatched to Your Room</span>
                </div>
                <span className="text-xs font-mono font-bold bg-sky-200 text-sky-900 px-2.5 py-0.5 rounded-full">
                  {doctorNotifications.filter((n) => n.status === 'Unread').length} New Dispatches
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doctorNotifications.slice(0, 4).map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-white border border-sky-100 rounded-xl p-3.5 shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-900">{notif.patient_name}</span>
                        <span className="font-mono text-[10px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                          {notif.token_no}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{notif.message}</p>
                      {notif.vitals_summary && (
                        <div className="mt-2 bg-slate-50 border border-slate-200/80 rounded p-2 text-[10px] font-mono text-slate-700">
                          {notif.vitals_summary}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      {onUpdateNotificationStatus && notif.status === 'Unread' && (
                        <button
                          onClick={() => onUpdateNotificationStatus(notif.id, 'Attending')}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition"
                        >
                          <i className="fa-solid fa-circle-check mr-1"></i> Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const matchingApt = appointments.find(
                            (a) => a.appointment_no === notif.token_no || a.patient_uhid === notif.patient_uhid
                          );
                          if (matchingApt && onExaminePatient) {
                            onExaminePatient(matchingApt);
                          } else {
                            onNavigate('consultations');
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1 rounded-lg transition"
                      >
                        <i className="fa-solid fa-stethoscope mr-1"></i> Start Examination
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department Patients Queue & Vitals Inspection */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Today's OPD Queue: {currentUser?.department || 'General Medicine'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Only showing patients allocated to your speciality. Click 'Examine & Write Rx' to consult and prescribe.
                </p>
              </div>

              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
                Total Patients in Queue: {relevantAppointments.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relevantAppointments.length === 0 ? (
                <div className="col-span-3 p-8 text-center text-slate-400">
                  <i className="fa-solid fa-user-check text-3xl text-slate-300 mb-2 block"></i>
                  No waiting patients in queue for your room right now.
                </div>
              ) : (
                relevantAppointments.map((apt) => {
                  const patObj = patients.find(
                    (p) => p.uhid === apt.patient_uhid || p.full_name.toLowerCase() === apt.patient_name.toLowerCase()
                  );
                  return (
                    <div
                      key={apt.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-sky-300 transition space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{apt.patient_name}</h4>
                            <span className="text-[11px] font-mono text-emerald-700 font-bold">
                              {apt.patient_uhid}
                            </span>
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold w-fit">
                              <i className="fa-solid fa-circle-check text-emerald-600 text-[9px]"></i>
                              <span>Amount Paid by Patient: ₹500.00</span>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded">
                            {apt.appointment_no}
                          </span>
                        </div>

                        {/* Symptoms */}
                        <div className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Chief Symptoms:</span>
                          <span>{apt.symptoms || 'General clinical assessment'}</span>
                        </div>

                        {/* Biological Vitals Strip */}
                        {patObj && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                              Biological Vitals from Reception:
                            </span>
                            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-800">
                              <div className="bg-slate-50 p-1 rounded border border-slate-200/60">
                                BP: <strong>{patObj.bp || '120/80'}</strong>
                              </div>
                              <div className="bg-slate-50 p-1 rounded border border-slate-200/60">
                                Pulse: <strong>{patObj.pulse || 76} bpm</strong>
                              </div>
                              <div className="bg-slate-50 p-1 rounded border border-slate-200/60">
                                SpO2: <strong className="text-emerald-700">{patObj.spo2 || '99%'}</strong>
                              </div>
                              <div className="bg-slate-50 p-1 rounded border border-slate-200/60">
                                Blood: <strong className="text-rose-700">{patObj.blood_group || 'O+'}</strong>
                              </div>
                            </div>
                            {patObj.allergies && (
                              <div className="mt-1.5 text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-bold">
                                Allergy Alert: {patObj.allergies}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          if (onExaminePatient) {
                            onExaminePatient(apt);
                          } else {
                            onNavigate('consultations');
                          }
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs mt-2"
                      >
                        <i className="fa-solid fa-stethoscope text-sky-400"></i>
                        <span>Examine & Write Prescription</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MASTER ADMIN DASHBOARD SPECIFIC VIEW                                   */}
      {/* ========================================================================= */}
      {role === 'ADMIN' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Patients Master
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{patients.length}</div>
              <span className="text-xs text-emerald-600 font-medium">Full database stored</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Today's OPD Tokens
              </span>
              <div className="text-2xl font-bold text-sky-700 mt-1 font-mono">{appointments.length}</div>
              <span className="text-xs text-slate-500 font-medium">All clinical departments</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Prescriptions Issued
              </span>
              <div className="text-2xl font-bold text-purple-700 mt-1 font-mono">{prescriptions.length}</div>
              <span className="text-xs text-slate-500 font-medium">Digital Rx with amounts</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Amount Paid by Patients
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
                ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-emerald-600 font-medium">Invoices Generated by Receptionist</span>
            </div>
          </div>

          {/* Department Filter for Admin View */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Filter Department Master:
              </span>
              <select
                value={adminSelectedDept}
                onChange={(e) => setAdminSelectedDept(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="All">All Departments (Hospital Master)</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopaedics">Orthopaedics</option>
                <option value="Neurosciences">Neurosciences</option>
                <option value="Obstetrics & Gynaecology">Obstetrics & Gynaecology</option>
                <option value="Paediatrics">Paediatrics</option>
                <option value="Nephrology">Nephrology</option>
              </select>
            </div>

            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-sky-700 hover:text-sky-800 font-bold"
            >
              Export System Audit Log <i className="fa-solid fa-arrow-right text-[10px] ml-1"></i>
            </button>
          </div>

          {/* Master Appointments & Department Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              All Hospital OPD Activities ({adminSelectedDept === 'All' ? 'Complete Master' : adminSelectedDept})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Token No</th>
                    <th className="p-3">Patient & UHID</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {relevantAppointments.slice(0, 8).map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-sky-800">{apt.appointment_no}</td>
                      <td className="p-3">
                        <strong className="text-slate-900 block">{apt.patient_name}</strong>
                        <span className="text-[11px] font-mono text-slate-500">{apt.patient_uhid}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded font-bold text-[10px]">
                          {apt.department}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800 font-medium">{apt.doctor_name}</td>
                      <td className="p-3 text-slate-600">{apt.appointment_type}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            apt.status === 'Confirmed'
                              ? 'bg-amber-100 text-amber-800'
                              : apt.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (onExaminePatient) onExaminePatient(apt);
                            else onNavigate('consultations');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded font-bold"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fast Registration Modal */}
      {isQuickRegOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#004b91] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Quick Walk-In Registration & Doctor Dispatch</h3>
                <p className="text-xs text-sky-200">Front Desk Station • Instantly generates token and notifies doctor</p>
              </div>
              <button
                onClick={() => setIsQuickRegOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleQuickRegisterSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
              {quickDupAlert && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-xl font-medium">
                  {quickDupAlert}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98840 00000"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Age</label>
                  <input
                    type="number"
                    value={quickAge}
                    onChange={(e) => setQuickAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gender</label>
                  <select
                    value={quickGender}
                    onChange={(e) => setQuickGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department Speciality *</label>
                  <select
                    value={quickDept}
                    onChange={(e) => setQuickDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopaedics">Orthopaedics</option>
                    <option value="Neurosciences">Neurosciences</option>
                    <option value="Obstetrics & Gynaecology">Obstetrics & Gynaecology</option>
                    <option value="Paediatrics">Paediatrics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Doctor *</label>
                  <select
                    value={quickDocId}
                    onChange={(e) => setQuickDocId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} ({d.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Biological Vitals */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Quick Biological Intake
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">BP (mmHg)</label>
                    <input
                      type="text"
                      value={quickBp}
                      onChange={(e) => setQuickBp(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={quickPulse}
                      onChange={(e) => setQuickPulse(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Temp</label>
                    <input
                      type="text"
                      value={quickTemp}
                      onChange={(e) => setQuickTemp(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">SpO2</label>
                    <input
                      type="text"
                      value={quickSpo2}
                      onChange={(e) => setQuickSpo2(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono text-emerald-700 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsQuickRegOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#004b91] hover:bg-[#00386c] text-white font-bold rounded-lg shadow-xs"
                >
                  Register & Dispatch Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
