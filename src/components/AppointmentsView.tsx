import React, { useState } from 'react';
import { Appointment, Patient, Doctor } from '../data/hospitalData';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  currentUser?: any;
  onBookAppointment: (apptData: any) => Promise<{ success: boolean; appointment_no?: string; error?: string }>;
  onUpdateStatus: (id: number, newStatus: 'Confirmed' | 'Completed' | 'Cancelled') => void;
  onUpdateAppointment?: (appointment: Appointment) => Promise<void> | void;
  onDeleteAppointment?: (appointmentId: number) => Promise<void> | void;
  onNavigate: (view: string) => void;
  onExaminePatient?: (appt: Appointment) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  patients,
  doctors,
  currentUser,
  onBookAppointment,
  onUpdateStatus,
  onUpdateAppointment,
  onDeleteAppointment,
  onNavigate,
  onExaminePatient
}) => {
  const isDoctor = currentUser?.role === 'DOCTOR';
  const isPatient = currentUser?.role === 'PATIENT';
  const doctorDept = currentUser?.department || '';
  const doctorName = currentUser?.full_name || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(
    isDoctor ? doctorDept || 'General Medicine' : 'All'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const [manualPatientAge, setManualPatientAge] = useState(30);
  const [manualPatientGender, setManualPatientGender] = useState('Male');
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

  // Filter appointments strictly by Doctor / Department / Patient
  const filteredAppointments = appointments.filter((a) => {
    // 1. Role-specific department & doctor isolation
    if (isDoctor) {
      const matchDoc =
        (currentUser?.doctor_id && a.doctor_id === currentUser.doctor_id) ||
        (a.doctor_name && doctorName && a.doctor_name.toLowerCase().includes(doctorName.toLowerCase())) ||
        (doctorName && a.doctor_name && doctorName.toLowerCase().includes(a.doctor_name.toLowerCase())) ||
        (doctorDept && a.department && a.department.toLowerCase() === doctorDept.toLowerCase());
      if (!matchDoc) return false;
    } else if (isPatient) {
      const matchPat =
        (currentUser?.patient_uhid && a.patient_uhid === currentUser.patient_uhid) ||
        (currentUser?.full_name && a.patient_name.toLowerCase() === currentUser.full_name.toLowerCase());
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
        >
          <i className="fa-solid fa-calendar-plus text-slate-400"></i> Schedule New Slot
        </button>
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
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded font-semibold w-fit">
                        <i className="fa-solid fa-circle-check text-emerald-600 text-[9px]"></i>
                        <span>Paid: ₹500.00</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{apt.doctor_name}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded text-[10px] font-medium">
                        {apt.department}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="font-medium text-slate-800">{apt.appointment_type}</div>
                      <div className="text-[10px] text-slate-400 truncate">{apt.symptoms || 'General OPD'}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={apt.status}
                        onChange={(e) =>
                          onUpdateStatus(
                            apt.id,
                            e.target.value as 'Confirmed' | 'Completed' | 'Cancelled'
                          )
                        }
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border outline-none cursor-pointer ${
                          apt.status === 'Confirmed'
                            ? 'bg-sky-50 text-sky-800 border-sky-200/80'
                            : apt.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                            : 'bg-rose-50 text-rose-800 border-rose-200/80'
                        }`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* UPDATE / EDIT BUTTON */}
                        <button
                          onClick={() => handleOpenEdit(apt)}
                          title="Update Appointment & Token Details"
                          className="px-2 py-1 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                          <span>Update</span>
                        </button>

                        {/* DELETE / DUSTBIN BUTTON */}
                        <button
                          onClick={() => setAppointmentToDelete(apt)}
                          title="Delete / Cancel Slot (Dustbin)"
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition text-xs flex items-center justify-center cursor-pointer"
                        >
                          <i className="fa-solid fa-trash-can text-rose-600"></i>
                        </button>

                        {/* CONSULT BUTTON (DOCTOR ROLE ONLY) */}
                        {currentUser?.role === 'DOCTOR' && (
                          <button
                            onClick={() => {
                              if (onExaminePatient) {
                                onExaminePatient(apt);
                              } else {
                                onNavigate('consultations');
                              }
                            }}
                            title="Start Clinical Examination"
                            className="bg-slate-900 hover:bg-slate-800 text-white px-2 py-1 rounded-lg text-[11px] font-medium transition shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <i className="fa-solid fa-stethoscope text-[10px]"></i>
                            <span>Consult</span>
                          </button>
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
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 bg-white font-medium"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
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
    </div>
  );
};
