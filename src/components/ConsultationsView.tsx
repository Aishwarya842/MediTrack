import React, { useState, useEffect } from 'react';
import { Consultation, Patient, Doctor } from '../data/hospitalData';

export interface ConsultationTarget {
  patientId?: number;
  doctorId?: number;
  appointmentId?: number;
  patientName?: string;
  patientUhid?: string;
  symptoms?: string;
  autoOpenModal?: boolean;
}

interface ConsultationsViewProps {
  consultations: Consultation[];
  patients: Patient[];
  doctors: Doctor[];
  currentUser?: any;
  targetPatient?: ConsultationTarget | null;
  onClearTarget?: () => void;
  onAddConsultation: (data: any) => Promise<void>;
  onUpdateConsultation?: (conData: Consultation) => Promise<void> | void;
  onDeleteConsultation?: (conId: number) => Promise<void> | void;
  onNavigate: (view: string) => void;
  onWritePrescription?: (target: { patientId: number; doctorId: number; diagnosis: string }) => void;
}

export const ConsultationsView: React.FC<ConsultationsViewProps> = ({
  consultations,
  patients,
  doctors,
  currentUser,
  targetPatient,
  onClearTarget,
  onAddConsultation,
  onUpdateConsultation,
  onDeleteConsultation,
  onNavigate,
  onWritePrescription
}) => {
  const isDoctor = currentUser?.role === 'DOCTOR';
  const doctorDept = currentUser?.department || '';
  const doctorName = currentUser?.full_name || '';

  // Find matching doctor object for current doctor user
  const currentDoctorObj = doctors.find(
    (d) =>
      (currentUser?.doctor_id && d.id === currentUser.doctor_id) ||
      (doctorName && d.full_name.toLowerCase().includes(doctorName.toLowerCase())) ||
      (doctorName && doctorName.toLowerCase().includes(d.full_name.toLowerCase()))
  ) || doctors[0];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(
    isDoctor ? doctorDept || 'General Medicine' : 'All'
  );

  // Form State
  const [patientId, setPatientId] = useState<number | 'manual'>(patients[0]?.id || 'manual');
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientUhid, setManualPatientUhid] = useState('');
  const [doctorId, setDoctorId] = useState<number>(isDoctor ? currentDoctorObj.id : (doctors[0]?.id || 1));
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState(72);
  const [temperature, setTemperature] = useState('98.4');
  const [spo2, setSpo2] = useState('99%');
  const [labTests, setLabTests] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Update / Edit State
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editSymptoms, setEditSymptoms] = useState('');
  const [editBp, setEditBp] = useState('120/80');
  const [editPulse, setEditPulse] = useState(72);
  const [editTemperature, setEditTemperature] = useState('98.4');
  const [editSpo2, setEditSpo2] = useState('99%');
  const [editLabTests, setEditLabTests] = useState('');
  const [editClinicalNotes, setEditClinicalNotes] = useState('');

  // Delete State
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter consultations strictly by Doctor / Department
  const filteredConsultations = consultations.filter((c) => {
    if (isDoctor) {
      const matchDoc =
        (currentUser?.doctor_id && c.doctor_id === currentUser.doctor_id) ||
        (c.doctor_name && doctorName && c.doctor_name.toLowerCase().includes(doctorName.toLowerCase())) ||
        (doctorName && c.doctor_name && doctorName.toLowerCase().includes(c.doctor_name.toLowerCase()));
      if (!matchDoc) return false;
    } else if (selectedDeptFilter !== 'All') {
      const doc = doctors.find((d) => d.id === c.doctor_id || d.full_name === c.doctor_name);
      if (doc && doc.department.toLowerCase() !== selectedDeptFilter.toLowerCase()) {
        return false;
      }
    }

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.patient_name.toLowerCase().includes(q) ||
      c.patient_uhid.toLowerCase().includes(q) ||
      c.doctor_name.toLowerCase().includes(q) ||
      c.diagnosis.toLowerCase().includes(q)
    );
  });

  // Sync target patient whenever target is passed from Doctor Dashboard or Appointment Examination
  useEffect(() => {
    if (targetPatient) {
      if (targetPatient.patientId) {
        setPatientId(targetPatient.patientId);
      } else if (targetPatient.patientUhid) {
        const found = patients.find((p) => p.uhid === targetPatient.patientUhid);
        if (found) {
          setPatientId(found.id);
        } else {
          setPatientId('manual');
          setManualPatientName(targetPatient.patientName || '');
          setManualPatientUhid(targetPatient.patientUhid || '');
        }
      } else if (targetPatient.patientName) {
        const found = patients.find((p) => p.full_name.toLowerCase() === targetPatient.patientName?.toLowerCase());
        if (found) {
          setPatientId(found.id);
        } else {
          setPatientId('manual');
          setManualPatientName(targetPatient.patientName || '');
        }
      }

      if (targetPatient.doctorId) {
        setDoctorId(targetPatient.doctorId);
      }

      if (targetPatient.symptoms) {
        setSymptoms(targetPatient.symptoms);
      }

      if (targetPatient.autoOpenModal !== false) {
        setIsModalOpen(true);
      }
    }
  }, [targetPatient, patients]);

  const selectedDoctorObj = doctors.find((d) => d.id === Number(doctorId)) || doctors[0];

  const handleSaveConsultation = async (e: React.FormEvent, proceedToRx: boolean = false) => {
    e.preventDefault();

    let patName = manualPatientName.trim();
    let patUhid = manualPatientUhid.trim();
    let patId = 0;

    if (patientId !== 'manual') {
      const p = patients.find((pat) => pat.id === Number(patientId));
      if (p) {
        patName = p.full_name;
        patUhid = p.uhid;
        patId = p.id;
      }
    }

    if (!patName) {
      alert('Please enter or select a patient name.');
      return;
    }

    if (!patUhid) {
      const nextNum = consultations.length + 1;
      patUhid = `UHID-2026-${String(nextNum).padStart(4, '0')}`;
    }

    const doctorObj = selectedDoctorObj;
    const recordedDiagnosis = diagnosis.trim() || 'Clinical OPD Assessment Done';

    await onAddConsultation({
      patient_id: patId || consultations.length + 1,
      patient_name: patName,
      patient_uhid: patUhid,
      doctor_id: doctorObj.id,
      doctor_name: doctorObj.full_name,
      consultation_date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      symptoms: symptoms || 'Routine Follow-up',
      diagnosis: recordedDiagnosis,
      bp: `${bp} mmHg`,
      pulse: Number(pulse) || 72,
      temperature: `${temperature}°F`,
      spo2,
      lab_tests_recommended: labTests,
      clinical_notes: clinicalNotes
    });

    setIsModalOpen(false);
    if (onClearTarget) onClearTarget();

    if (proceedToRx && onWritePrescription) {
      onWritePrescription({
        patientId: patId || consultations.length + 1,
        doctorId: doctorObj.id,
        diagnosis: recordedDiagnosis
      });
    } else {
      alert(`Consultation note recorded successfully for ${patName}!`);
    }
  };

  const handleOpenEdit = (con: Consultation) => {
    setEditingConsultation(con);
    setEditDiagnosis(con.diagnosis);
    setEditSymptoms(con.symptoms || '');
    setEditBp(con.bp?.replace(' mmHg', '') || '120/80');
    setEditPulse(con.pulse || 72);
    setEditTemperature(con.temperature?.replace('°F', '') || '98.4');
    setEditSpo2(con.spo2 || '99%');
    setEditLabTests(con.lab_tests_recommended || '');
    setEditClinicalNotes(con.clinical_notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConsultation) return;

    const updated: Consultation = {
      ...editingConsultation,
      diagnosis: editDiagnosis,
      symptoms: editSymptoms,
      bp: `${editBp} mmHg`,
      pulse: Number(editPulse) || 72,
      temperature: `${editTemperature}°F`,
      spo2: editSpo2,
      lab_tests_recommended: editLabTests,
      clinical_notes: editClinicalNotes
    };

    if (onUpdateConsultation) {
      await onUpdateConsultation(updated);
    }
    setEditingConsultation(null);
  };

  const handleConfirmDelete = async () => {
    if (!consultationToDelete) return;
    setIsDeleting(true);
    try {
      if (onDeleteConsultation) {
        await onDeleteConsultation(consultationToDelete.id);
      }
      setConsultationToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Target Patient Alert Banner */}
      {targetPatient && (
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <i className="fa-solid fa-user-injured text-lg"></i>
            </div>
            <div>
              <div className="text-xs font-bold text-sky-900">
                Active Clinical Examination Target
              </div>
              <div className="text-xs text-sky-700 font-medium">
                Patient: <span className="font-bold">{targetPatient.patientName || patients.find((p) => p.id === targetPatient.patientId)?.full_name || 'Patient'}</span> {targetPatient.patientUhid ? `(${targetPatient.patientUhid})` : ''} | Doctor: {selectedDoctorObj?.full_name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-notes-medical text-sky-400"></i> Open Examination Form
            </button>
            {onClearTarget && (
              <button
                onClick={onClearTarget}
                className="text-slate-400 hover:text-slate-600 px-2 py-2 text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Doctor OPD Clinical Consultation Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vital signs logging, clinical diagnostic assessments, record updates & management
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
        >
          <i className="fa-solid fa-stethoscope text-slate-400"></i> Record Consultation
        </button>
      </div>

      {/* Doctor Department Isolation Banner */}
      {isDoctor && (
        <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse"></span>
            <span className="font-bold text-sky-950">
              Doctor Clinical Workspace: Showing consultations for {doctorName} ({doctorDept || 'General Medicine'}).
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-sky-900 bg-white px-2.5 py-0.5 rounded-md border border-sky-200 shadow-xs">
            {filteredConsultations.length} Consultations Recorded
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
                ? `Search ${doctorDept || 'General Medicine'} consultations by patient, UHID, diagnosis...`
                : "Search consultations by patient, UHID, doctor, diagnosis..."
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
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Patient (UHID)</th>
                <th className="p-3">Consulting Doctor</th>
                <th className="p-3">Patient Vitals (BP / Pulse / Temp / SpO2)</th>
                <th className="p-3">Clinical Diagnosis</th>
                <th className="p-3">Lab Tests Ordered</th>
                <th className="p-3 text-right">Actions & Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredConsultations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No consultations found.
                  </td>
                </tr>
              ) : (
                filteredConsultations.map((con) => (
                  <tr key={con.id} className="hover:bg-slate-50/70 transition group">
                    <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">{con.consultation_date}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{con.patient_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{con.patient_uhid}</div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold w-fit">
                        <i className="fa-solid fa-circle-check text-emerald-600 text-[9px]"></i>
                        <span>Paid by Patient: ₹500.00</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{con.doctor_name}</td>
                    <td className="p-3">
                      <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-[11px] space-y-0.5">
                        <div className="text-slate-700">
                          <span className="text-slate-400 font-normal">BP:</span> {con.bp} | <span className="text-slate-400 font-normal">HR:</span> {con.pulse} bpm
                        </div>
                        <div className="text-slate-700">
                          <span className="text-slate-400 font-normal">Temp:</span> {con.temperature} | <span className="text-slate-400 font-normal">SpO2:</span> {con.spo2}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <strong className="text-slate-900 block font-semibold">{con.diagnosis}</strong>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{con.symptoms}</span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-600">
                      {con.lab_tests_recommended || 'None'}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* UPDATE / EDIT BUTTON */}
                        <button
                          onClick={() => handleOpenEdit(con)}
                          title="Update Consultation Details"
                          className="px-2 py-1 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                          <span>Update</span>
                        </button>

                        {/* DELETE / DUSTBIN BUTTON */}
                        <button
                          onClick={() => setConsultationToDelete(con)}
                          title="Delete Consultation Record (Dustbin)"
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition text-xs flex items-center justify-center cursor-pointer"
                        >
                          <i className="fa-solid fa-trash-can text-rose-600"></i>
                        </button>

                        {/* WRITE RX BUTTON */}
                        <button
                          onClick={() => {
                            if (onWritePrescription) {
                              onWritePrescription({
                                patientId: con.patient_id,
                                doctorId: con.doctor_id,
                                diagnosis: con.diagnosis
                              });
                            } else {
                              onNavigate('prescriptions');
                            }
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-2 py-1 rounded-lg text-[11px] font-medium shadow-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <i className="fa-solid fa-prescription text-[10px]"></i>
                          <span>Write Rx</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Consultation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-slate-200/80 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <i className="fa-solid fa-stethoscope text-sky-400"></i> Record Clinical Consultation
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form className="p-5 overflow-y-auto space-y-3.5 text-xs">
              {/* Receptionist Fee Settlement Confirmation Badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-emerald-600 text-sm"></i>
                  <div>
                    <span className="font-bold text-emerald-950">Front Desk Payment Verified:</span>{' '}
                    <span className="text-emerald-800">OPD consultation charges collected by Receptionist.</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block tracking-wider">
                    Amount Paid by Patient
                  </span>
                  <span className="font-bold text-sm text-emerald-950 font-mono">
                    ₹{(selectedDoctorObj?.consultation_fee || 500).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Patient (UHID) *</label>
                  {patients.length > 0 ? (
                    <select
                      value={patientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPatientId(val === 'manual' ? 'manual' : Number(val));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white font-medium"
                      required
                    >
                      <option value="manual">+ Enter Patient Details Manually</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.uhid} - {p.gender}, {p.age}y)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                      No registered patients. Enter details below:
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Consulting Doctor *</label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white font-medium"
                    required
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} ({d.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(patientId === 'manual' || patients.length === 0) && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">UHID (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. UHID-2026-0001 (Auto if blank)"
                      value={manualPatientUhid}
                      onChange={(e) => setManualPatientUhid(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-800 outline-none text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Patient Vitals Grid */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-heart-pulse text-rose-500"></i> Patient Clinical Vitals
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Blood Pressure (BP)</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pulse / Heart Rate</label>
                    <input
                      type="number"
                      placeholder="72 bpm"
                      value={pulse}
                      onChange={(e) => setPulse(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Temperature (°F)</label>
                    <input
                      type="text"
                      placeholder="98.4"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">SpO2 (Oxygen)</label>
                    <input
                      type="text"
                      placeholder="99%"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Chief Symptoms & Presentation *</label>
                <textarea
                  rows={2}
                  placeholder="Patient presented with..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Doctor's Provisional / Final Diagnosis *</label>
                <input
                  type="text"
                  placeholder="e.g. Type 2 Diabetes Mellitus with Essential Hypertension"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Lab / Diagnostic Tests Recommended</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count (CBC), HbA1c, Fasting Lipid Profile, ECG 12-Lead"
                  value={labTests}
                  onChange={(e) => setLabTests(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Clinical Assessment & Examination Notes</label>
                <textarea
                  rows={2}
                  placeholder="Physical examination notes, diet instructions, review interval..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveConsultation(e, false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 rounded-lg shadow-xs text-xs transition cursor-pointer"
                >
                  Save Consultation Note
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveConsultation(e, true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-1.5 rounded-lg shadow-xs text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-prescription"></i>
                  <span>Save & Prescribe Drugs</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE / EDIT CONSULTATION MODAL */}
      {editingConsultation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-slate-200/80 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <i className="fa-solid fa-pen-to-square text-sky-400"></i> Update Consultation & Diagnosis Record
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5 font-mono">
                  Patient: {editingConsultation.patient_name} ({editingConsultation.patient_uhid}) • Dr. {editingConsultation.doctor_name}
                </p>
              </div>
              <button onClick={() => setEditingConsultation(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-heart-pulse text-rose-500"></i> Update Patient Vitals
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={editBp}
                      onChange={(e) => setEditBp(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Heart Rate (Pulse)</label>
                    <input
                      type="number"
                      value={editPulse}
                      onChange={(e) => setEditPulse(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Temp (°F)</label>
                    <input
                      type="text"
                      value={editTemperature}
                      onChange={(e) => setEditTemperature(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">SpO2</label>
                    <input
                      type="text"
                      value={editSpo2}
                      onChange={(e) => setEditSpo2(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  value={editDiagnosis}
                  onChange={(e) => setEditDiagnosis(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Chief Symptoms & Presentation</label>
                <textarea
                  rows={2}
                  value={editSymptoms}
                  onChange={(e) => setEditSymptoms(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Lab / Diagnostic Tests Ordered</label>
                <input
                  type="text"
                  value={editLabTests}
                  onChange={(e) => setEditLabTests(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Clinical Assessment & Notes</label>
                <textarea
                  rows={2}
                  value={editClinicalNotes}
                  onChange={(e) => setEditClinicalNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-800 outline-none text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingConsultation(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-4 py-1.5 rounded-lg shadow-xs text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Update Consultation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE / DUSTBIN CONFIRMATION MODAL */}
      {consultationToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-trash-can text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Consultation Record?
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Are you sure you want to permanently delete this clinical consultation record:
                </p>
                <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 text-xs">{consultationToDelete.patient_name} ({consultationToDelete.patient_uhid})</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Diagnosis: {consultationToDelete.diagnosis}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Dr. {consultationToDelete.doctor_name} • {consultationToDelete.consultation_date}</div>
                </div>
                <p className="text-[11px] text-rose-600 font-medium mt-2">
                  <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                  This will remove the consultation and diagnostic note from the system.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setConsultationToDelete(null)}
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
