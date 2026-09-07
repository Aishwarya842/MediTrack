import React, { useState, useEffect, useMemo } from 'react';
import { Prescription, Patient, Doctor, Medicine, PrescribedMedicine, Appointment } from '../data/hospitalData';

export interface PrescriptionTarget {
  patientId?: number;
  doctorId?: number;
  diagnosis?: string;
  symptoms?: string;
  vitals?: { bp?: string; pulse?: number | string; temperature?: string; spo2?: string };
  notes?: string;
  autoOpen?: boolean;
}

interface PrescriptionsViewProps {
  prescriptions: Prescription[];
  patients: Patient[];
  doctors: Doctor[];
  medicines: Medicine[];
  appointments?: Appointment[];
  currentUser?: any;
  targetRx?: PrescriptionTarget | null;
  onClearTargetRx?: () => void;
  onAddPrescription: (data: any) => Promise<void>;
  onDeletePrescription?: (rxId: number) => Promise<void> | void;
  onNavigate: (view: string) => void;
}

export const PrescriptionsView: React.FC<PrescriptionsViewProps> = ({
  prescriptions,
  patients,
  doctors,
  medicines,
  appointments,
  currentUser,
  targetRx,
  onClearTargetRx,
  onAddPrescription,
  onDeletePrescription,
  onNavigate
}) => {
  const isDoctor = currentUser?.role === 'DOCTOR';
  const isPatient = currentUser?.role === 'PATIENT';
  const doctorDept = currentUser?.department || '';
  const doctorName = currentUser?.full_name || '';

  // Find matching doctor object for current doctor user
  const currentDoctorObj = doctors.find(
    (d) =>
      (currentUser?.doctor_id && d.id === currentUser.doctor_id) ||
      (doctorName && d.full_name.toLowerCase().includes(doctorName.toLowerCase())) ||
      (doctorName && doctorName.toLowerCase().includes(d.full_name.toLowerCase()))
  ) || doctors[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(
    isDoctor ? doctorDept || 'General Medicine' : 'All'
  );

  // Filtered prescriptions list
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      if (isPatient) {
        // STRICT PATIENT ISOLATION: Must match this patient's UHID or patient ID
        const matchPatient =
          (currentUser?.patient_uhid && rx.patient_uhid?.trim().toUpperCase() === currentUser.patient_uhid.trim().toUpperCase()) ||
          (currentUser?.patient_id && rx.patient_id === currentUser.patient_id);
        if (!matchPatient) return false;
      } else if (isDoctor) {
        const docId = currentUser?.doctor_id;
        const cleanDocName = doctorName?.trim().toLowerCase();
        const matchDoc =
          (docId && rx.doctor_id === docId) ||
          (cleanDocName && rx.doctor_name && rx.doctor_name.trim().toLowerCase() === cleanDocName);
        if (!matchDoc) return false;
      } else if (selectedDeptFilter !== 'All') {
        if (!rx.department || rx.department.toLowerCase() !== selectedDeptFilter.toLowerCase()) {
          return false;
        }
      }

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        rx.prescription_no.toLowerCase().includes(q) ||
        rx.patient_name.toLowerCase().includes(q) ||
        rx.patient_uhid.toLowerCase().includes(q) ||
        rx.doctor_name.toLowerCase().includes(q) ||
        (rx.diagnosis_summary && rx.diagnosis_summary.toLowerCase().includes(q))
      );
    });
  }, [prescriptions, isPatient, isDoctor, doctorName, doctorDept, currentUser, selectedDeptFilter, searchTerm]);

  const [selectedRx, setSelectedRx] = useState<Prescription | null>(filteredPrescriptions[0] || null);

  // Keep selectedRx strictly aligned with filteredPrescriptions
  React.useEffect(() => {
    if (filteredPrescriptions.length === 0) {
      setSelectedRx(null);
    } else if (!selectedRx || !filteredPrescriptions.some((r) => r.id === selectedRx.id)) {
      setSelectedRx(filteredPrescriptions[0]);
    }
  }, [filteredPrescriptions]);

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [rxToDelete, setRxToDelete] = useState<Prescription | null>(null);

  // New Prescription Generator State
  const [selectedPatientId, setSelectedPatientId] = useState<number | 'manual'>(
    patients[0]?.id || 'manual'
  );
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientAge, setManualPatientAge] = useState(30);
  const [manualPatientGender, setManualPatientGender] = useState('Male');
  const [manualPatientBloodGroup, setManualPatientBloodGroup] = useState('B+');
  const [manualPatientUhid, setManualPatientUhid] = useState('');
  const [manualPatientPhone, setManualPatientPhone] = useState('');
  const [manualPatientLocation, setManualPatientLocation] = useState('');
  const [manualOpdRegNo, setManualOpdRegNo] = useState('');
  const [manualNatureOfIssue, setManualNatureOfIssue] = useState('');

  const [doctorId, setDoctorId] = useState<number>(isDoctor ? currentDoctorObj.id : (doctors[0]?.id || 1));
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [carriedVitals, setCarriedVitals] = useState<{ bp?: string; pulse?: number | string; temperature?: string; spo2?: string } | null>(null);
  const [advice, setAdvice] = useState(
    'Follow prescribed dosage carefully. Avoid oily/spicy foods and maintain adequate hydration.'
  );
  const [followUpDays, setFollowUpDays] = useState(7);


  // Keep selectedRx valid when list updates
  useEffect(() => {
    if (filteredPrescriptions.length === 0) {
      setSelectedRx(null);
    } else if (!selectedRx || !filteredPrescriptions.find((r) => r.id === selectedRx.id)) {
      setSelectedRx(filteredPrescriptions[0]);
    }
  }, [filteredPrescriptions]);

  // Synchronize targetRx
  useEffect(() => {
    if (targetRx) {
      if (targetRx.patientId) {
        setSelectedPatientId(targetRx.patientId);
      }
      if (targetRx.doctorId) setDoctorId(targetRx.doctorId);
      if (targetRx.diagnosis) setDiagnosisSummary(targetRx.diagnosis);
      if (targetRx.symptoms) setManualNatureOfIssue(targetRx.symptoms);
      if (targetRx.notes) setAdvice(targetRx.notes);
      if (targetRx.vitals) {
        setCarriedVitals(targetRx.vitals);
      }
      if (targetRx.autoOpen !== false) setIsGeneratorOpen(true);
    }
  }, [targetRx]);

  // Medicine items in draft prescription
  const [draftMedicines, setDraftMedicines] = useState<PrescribedMedicine[]>([
    {
      medicine_id: medicines[0]?.id || 1,
      medicine_name: medicines[0]?.medicine_name || 'Dolo 650',
      strength: medicines[0]?.strength || '650mg',
      form: medicines[0]?.form || 'Tablet',
      dosage: '1 Tablet',
      frequency: '1-0-1',
      timing: 'After Food',
      duration: '5 Days',
      quantity: 10,
      instructions: ''
    }
  ]);

  // Selected patient object for vitals display
  const activePatientForDraft = useMemo(() => {
    if (selectedPatientId === 'manual') return null;
    return patients.find((p) => p.id === Number(selectedPatientId)) || null;
  }, [selectedPatientId, patients]);

  const activePatientAppt = useMemo(() => {
    if (!activePatientForDraft) return null;
    return appointments?.find(
      (a) => a.patient_id === activePatientForDraft.id || a.patient_uhid === activePatientForDraft.uhid
    ) || null;
  }, [activePatientForDraft, appointments]);

  // Calculate estimated medicine cost based on formulary pricing
  const estimatedMedicinesCost = useMemo(() => {
    return draftMedicines.reduce((total, item) => {
      const matched = medicines.find((m) => m.medicine_name.toLowerCase() === item.medicine_name.toLowerCase());
      const unitPrice = matched ? matched.unit_price : 12;
      return total + unitPrice * item.quantity;
    }, 0);
  }, [draftMedicines, medicines]);


  const addMedicineRow = () => {
    const defaultMed = medicines[0] || {
      id: 1,
      medicine_name: 'Paracetamol 650',
      strength: '650mg',
      form: 'Tablet'
    };
    setDraftMedicines([
      ...draftMedicines,
      {
        medicine_id: defaultMed.id,
        medicine_name: defaultMed.medicine_name,
        strength: defaultMed.strength,
        form: defaultMed.form,
        dosage: '1 Tablet',
        frequency: '1-0-1',
        timing: 'After Food',
        duration: '5 Days',
        quantity: 10,
        instructions: ''
      }
    ]);
  };

  const updateMedicineRow = (index: number, field: keyof PrescribedMedicine, value: any) => {
    const updated = [...draftMedicines];
    if (field === 'medicine_name') {
      const matched = medicines.find((m) => m.medicine_name === value);
      if (matched) {
        updated[index].medicine_id = matched.id;
        updated[index].medicine_name = matched.medicine_name;
        updated[index].strength = matched.strength;
        updated[index].form = matched.form;
      } else {
        updated[index].medicine_name = value;
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    setDraftMedicines(updated);
  };

  const removeMedicineRow = (index: number) => {
    if (draftMedicines.length > 1) {
      setDraftMedicines(draftMedicines.filter((_, i) => i !== index));
    }
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();

    let patName = manualPatientName.trim();
    let patUhid = manualPatientUhid.trim();
    let patAge = Number(manualPatientAge) || 30;
    let patGender = manualPatientGender;
    let patBlood = manualPatientBloodGroup;
    let patId = 0;
    let biologicalSummary = 'BP: 120/80 mmHg | Pulse: 76 bpm | Temp: 98.4 °F | SpO2: 99%';

    let patPhone = manualPatientPhone.trim() || '+91 98840 00000';
    let patLocation = manualPatientLocation.trim() || 'Vadapalani, Chennai';
    let patOpdRegNo = manualOpdRegNo.trim();
    let patNatureOfIssue = manualNatureOfIssue.trim() || 'Clinical OPD Assessment';

    if (selectedPatientId !== 'manual') {
      const p = patients.find((pat) => pat.id === Number(selectedPatientId));
      if (p) {
        patName = p.full_name;
        patUhid = p.uhid;
        patAge = p.age;
        patGender = p.gender;
        patBlood = p.blood_group;
        patId = p.id;
        patPhone = p.phone || patPhone;
        patLocation = p.location || p.address || p.city || patLocation;
        patNatureOfIssue = p.nature_of_health_issue || patNatureOfIssue;

        const pAppt = appointments?.find((a) => a.patient_id === p.id || a.patient_uhid === p.uhid);
        if (pAppt) {
          patOpdRegNo = pAppt.opd_reg_no || pAppt.appointment_no || patOpdRegNo;
          if (pAppt.nature_of_health_issue) patNatureOfIssue = pAppt.nature_of_health_issue;
          if (pAppt.patient_location) patLocation = pAppt.patient_location;
          if (pAppt.patient_phone) patPhone = pAppt.patient_phone;
        }

        const patVitals = [
          p.bp ? `BP: ${p.bp}` : '',
          p.pulse ? `Pulse: ${p.pulse} bpm` : '',
          p.temperature ? `Temp: ${p.temperature}` : '',
          p.spo2 ? `SpO2: ${p.spo2}` : '',
          p.allergies ? `Allergies: ${p.allergies}` : ''
        ].filter(Boolean).join(' | ');
        biologicalSummary = patVitals || 'Biological vitals pending manual intake';
      }
    }

    if (!patName) {
      alert('Please specify the patient name.');
      return;
    }

    const nextId = prescriptions.length > 0 ? Math.max(...prescriptions.map((r) => r.id)) + 1 : 1;
    if (!patUhid) {
      patUhid = `UHID-2026-${String(nextId).padStart(4, '0')}`;
    }
    if (!patOpdRegNo) {
      patOpdRegNo = `OPD-2026-${String(nextId).padStart(4, '0')}`;
    }

    const doctorObj = doctors.find((d) => d.id === Number(doctorId)) || doctors[0];
    const rxNo = `RX-2026-${String(nextId).padStart(4, '0')}`;
    const rxPrescriptionDate = new Date().toISOString().split('T')[0];
    const rxFollowUpDays = Number(followUpDays) || 7;
    const rxFollowUpDateObj = new Date(rxPrescriptionDate);
    rxFollowUpDateObj.setDate(rxFollowUpDateObj.getDate() + rxFollowUpDays);
    const rxFollowUpDate = rxFollowUpDateObj.toISOString().split('T')[0];

    const newRx: Prescription = {
      id: nextId,
      prescription_no: rxNo,
      opd_reg_no: patOpdRegNo,
      patient_id: patId || nextId,
      patient_name: patName,
      patient_uhid: patUhid,
      age: patAge,
      gender: patGender,
      blood_group: patBlood,
      phone: patPhone,
      location: patLocation,
      nature_of_health_issue: patNatureOfIssue,
      doctor_id: doctorObj.id,
      doctor_name: doctorObj.full_name,
      department: doctorObj.department,
      doc_reg_no: doctorObj.registration_no,
      prescription_date: rxPrescriptionDate,
      diagnosis_summary: diagnosisSummary || 'Clinical OPD Assessment',
      advice: advice || 'Follow prescribed dosage. Adequate hydration and healthy lifestyle.',
      follow_up_days: rxFollowUpDays,
      follow_up_date: rxFollowUpDate,
      medicines: draftMedicines,
      consultation_fee: 0,
      medicines_fee: 0,
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
      payment_status: 'Paid'
    };

    await onAddPrescription(newRx);
    setSelectedRx(newRx);
    setIsGeneratorOpen(false);
    if (onClearTargetRx) onClearTargetRx();

    // Reset manual form
    setManualPatientName('');
    setManualPatientUhid('');
    setDiagnosisSummary('');
  };

  const handleConfirmDeleteRx = async () => {
    if (rxToDelete && onDeletePrescription) {
      await onDeletePrescription(rxToDelete.id);
      if (selectedRx?.id === rxToDelete.id) {
        const remaining = prescriptions.filter((r) => r.id !== rxToDelete.id);
        setSelectedRx(remaining[0] || null);
      }
      setRxToDelete(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Find matching patient for selectedRx to show real biological vitals and phone
  const selectedRxPatientObj = useMemo(() => {
    if (!selectedRx) return null;
    return patients.find(
      (p) => p.uhid === selectedRx.patient_uhid || p.full_name.toLowerCase() === selectedRx.patient_name.toLowerCase()
    );
  }, [selectedRx, patients]);

  // Find matching appointment for selectedRx to extract OPD Reg No and Reception intake data
  const selectedRxPatientAppt = useMemo(() => {
    if (!selectedRx) return null;
    return appointments?.find(
      (a) =>
        (a.opd_reg_no && selectedRx.opd_reg_no && a.opd_reg_no === selectedRx.opd_reg_no) ||
        (a.patient_uhid && selectedRx.patient_uhid && a.patient_uhid.trim().toUpperCase() === selectedRx.patient_uhid.trim().toUpperCase()) ||
        (a.patient_name && a.patient_name.toLowerCase() === selectedRx.patient_name.toLowerCase())
    ) || null;
  }, [selectedRx, appointments]);

  // Find attending doctor details for selectedRx
  const rxDoctor = useMemo(() => {
    if (!selectedRx) return currentDoctorObj;
    const foundDoc = doctors.find(
      (d) =>
        d.id === selectedRx.doctor_id ||
        (selectedRx.doctor_name && d.full_name.toLowerCase() === selectedRx.doctor_name.toLowerCase()) ||
        (selectedRx.doctor_name && d.full_name.toLowerCase().includes(selectedRx.doctor_name.toLowerCase()))
    );
    if (foundDoc) return foundDoc;
    const deptDoc = doctors.find((d) => d.department.toLowerCase() === selectedRx.department?.toLowerCase()) || doctors[0];
    return {
      id: selectedRx.doctor_id || deptDoc.id,
      full_name: selectedRx.doctor_name || deptDoc.full_name,
      qualification: deptDoc.qualification,
      specialization: selectedRx.department || deptDoc.department,
      registration_no: selectedRx.doc_reg_no || deptDoc.registration_no,
      phone: deptDoc.phone,
      email: deptDoc.email,
      department: selectedRx.department || deptDoc.department
    };
  }, [selectedRx, doctors, currentDoctorObj]);

  // Format dynamic follow up date
  const followUpDate = useMemo(() => {
    if (!selectedRx) return '2026-03-14';
    if (selectedRx.follow_up_days) {
      try {
        const rxDate = new Date(selectedRx.prescription_date || '2026-03-08');
        rxDate.setDate(rxDate.getDate() + Number(selectedRx.follow_up_days));
        return rxDate.toISOString().split('T')[0];
      } catch {
        return `${selectedRx.follow_up_days} Days`;
      }
    }
    return '2026-03-14';
  }, [selectedRx]);

  const patientPhone = selectedRx?.phone || selectedRxPatientObj?.phone || selectedRxPatientAppt?.patient_phone || '+91 98840 12345';
  const patientLocation = selectedRx?.location || selectedRxPatientObj?.location || selectedRxPatientObj?.address || selectedRxPatientAppt?.patient_location || 'Vadapalani, Chennai';
  const opdRegNo = selectedRx?.opd_reg_no || selectedRxPatientAppt?.opd_reg_no || selectedRxPatientAppt?.appointment_no || selectedRx?.patient_uhid || 'OPD-2026-0001';
  const natureOfHealthIssue = selectedRx?.nature_of_health_issue || selectedRxPatientAppt?.nature_of_health_issue || selectedRxPatientAppt?.symptoms || selectedRxPatientObj?.nature_of_health_issue || selectedRxPatientObj?.medical_history || 'Routine OPD Evaluation';

  return (
    <div className="space-y-4 print:space-y-0 print:p-0 print:m-0">
      {/* Patient Isolation Banner */}
      {isPatient && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-bold text-emerald-950">
              Personal Health Records: Showing official digital prescriptions issued exclusively for {currentUser?.full_name} ({currentUser?.patient_uhid}).
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-900 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-xs">
            {filteredPrescriptions.length} Records Verified
          </span>
        </div>
      )}

      {/* Doctor Department Isolation Banner */}
      {isDoctor && (
        <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse"></span>
            <span className="font-bold text-sky-950">
              Prescription Roster: Showing prescriptions issued by {doctorName} ({doctorDept || 'General Medicine'}).
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-sky-900 bg-white px-2.5 py-0.5 rounded-md border border-sky-200 shadow-xs">
            {filteredPrescriptions.length} Records Active
          </span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
              Clinical Medical Prescriptions &amp; Formulations
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total Shown: {filteredPrescriptions.length}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isPatient ? 'My Digital Prescriptions (Rx)' : 'Digital Prescription Studio (Rx)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isPatient
              ? 'Official verified medical prescriptions and doctor treatment instructions for your consultation.'
              : 'NABH-Compliant Electronic Formulations, biological vitals check, and itemized billing breakdown.'}
          </p>
        </div>
        {!isPatient && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (patients.length > 0) {
                  setSelectedPatientId(patients[0].id);
                } else {
                  setSelectedPatientId('manual');
                }
                setIsGeneratorOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <i className="fa-solid fa-plus text-sky-400"></i> Issue Digital Prescription
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start print:block print:w-full">
        {/* Left 4 Cols: Prescriptions List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3 print:hidden">
          <div className="font-bold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex justify-between items-center">
            <span>Prescription Records</span>
            <span className="text-slate-500 font-mono font-bold">{filteredPrescriptions.length} Records</span>
          </div>

          {/* Search and Dept Filter in Prescriptions View */}
          <div className="space-y-2">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder={
                  isPatient
                    ? 'Search my prescriptions...'
                    : isDoctor
                    ? `Search ${doctorDept || 'General Medicine'} Rx...`
                    : 'Search Rx by patient, UHID, Rx No...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {!isDoctor && !isPatient && (
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-700 bg-white font-medium"
              >
                <option value="All">All Departments</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopaedics">Orthopaedics</option>
                <option value="Neurology">Neurology</option>
                <option value="Obstetrics & Gynaecology">Obstetrics &amp; Gynaecology</option>
                <option value="Paediatrics">Paediatrics</option>
                <option value="Nephrology">Nephrology</option>
                <option value="Gastroenterology">Gastroenterology</option>
              </select>
            )}
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="py-10 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-lg">
                <i className="fa-solid fa-prescription-bottle-medical"></i>
              </div>
              <h3 className="text-xs font-semibold text-slate-800 mb-1">0 Prescriptions Found</h3>
              <p className="text-[11px] text-slate-500 mb-4">
                {isPatient
                  ? `No electronic prescriptions have been issued for ${currentUser?.full_name} (${currentUser?.patient_uhid}) yet. Prescriptions issued by your doctor will appear here automatically.`
                  : 'No matching prescriptions for this doctor or department.'}
              </p>
              {!isPatient && (
                <button
                  onClick={() => {
                    setSelectedPatientId('manual');
                    setIsGeneratorOpen(true);
                  }}
                  className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800 transition shadow-xs inline-flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-plus text-[10px]"></i> Issue Prescription
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
              {filteredPrescriptions.map((rx) => {
                const isSelected = selectedRx?.id === rx.id;
                return (
                  <div
                    key={rx.id}
                    onClick={() => setSelectedRx(rx)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-xs relative group ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-bold text-sky-800">{rx.prescription_no}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono">{rx.prescription_date}</span>
                        {onDeletePrescription && !isPatient && (
                          <button
                            title="Delete Prescription"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRxToDelete(rx);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{rx.patient_name}</div>
                    <div className="text-[11px] text-emerald-700 font-mono font-bold">{rx.patient_uhid}</div>
                    <div className="text-[11px] text-slate-600 font-medium mt-1">
                      <i className="fa-solid fa-user-doctor mr-1 text-slate-400"></i> {rx.doctor_name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      Diagnosis: {rx.diagnosis_summary}
                    </div>

                    {/* Clinical Details Badge (No Fee/Payment Info) */}
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {rx.medicines?.length || 0} Medicines Prescribed
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                        Clinical Rx
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 8 Cols: Official Hospital Printable Prescription Sheet */}
        <div className="lg:col-span-8 space-y-4 print:w-full print:block print:p-0 print:m-0">
          {selectedRx ? (
            <div
              id="printable-prescription-sheet"
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 relative print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print-page-break-inside-avoid"
            >
              {/* Action Toolbar on Preview (Hidden when printing) */}
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4 pb-3 border-b border-slate-100 print:hidden">
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-file-prescription text-sky-600"></i>
                    Prescription #{selectedRx.prescription_no} (MediConnect OPD)
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    💡 Tip: In your browser print dialog, uncheck &quot;Headers and footers&quot; for a clean, borderless single sheet.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onDeletePrescription && !isPatient && (
                    <button
                      onClick={() => setRxToDelete(selectedRx)}
                      className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      title="Delete this Prescription"
                    >
                      <i className="fa-solid fa-trash-can text-red-500"></i> Delete
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <i className="fa-solid fa-print text-white"></i> Print 1-Page Prescription
                  </button>
                </div>
              </div>

              {/* Exact Clean MediConnect Letterhead Header */}
              <div className="flex items-start gap-4 pb-1">
                {/* Rounded Blue MediConnect Logo with White Medical Cross */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex flex-col items-center justify-center p-1.5 shadow-2xs shrink-0 print:bg-sky-600">
                  <div className="w-6 h-6 border-2 border-white rounded-xs flex items-center justify-center font-bold text-base leading-none mb-0.5">
                    +
                  </div>
                  <span className="text-[7.5px] font-black uppercase tracking-tighter leading-none text-center">
                    Medi
                    <br />
                    Connect
                  </span>
                </div>

                {/* Hospital & Doctor Details */}
                <div className="space-y-0.5 text-slate-800 flex-1">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-sky-600 tracking-tight leading-tight">
                      MediConnect Hospital
                    </h1>
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                      NABH ACCREDITED • ISO 9001:2015
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 leading-snug">
                    {rxDoctor.full_name}
                  </div>
                  <div className="text-[11.5px] text-slate-600 font-medium">
                    {rxDoctor.qualification || 'MBBS, MD (General Medicine)'} | Reg: {rxDoctor.registration_no || selectedRx.doc_reg_no || 'TNMC-74512'}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    100 Feet Bypass Road, Vadapalani, Chennai, Tamil Nadu – 600026
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-3 pt-0.5 font-medium">
                    <span>
                      <i className="fa-solid fa-phone text-slate-400 mr-1 text-[10px]"></i>
                      {rxDoctor.phone || '+91 44 2483 3415'}
                    </span>
                    <span>
                      <i className="fa-solid fa-envelope text-slate-400 mr-1 text-[10px]"></i>
                      {rxDoctor.email || 'opd@mediconnect.in'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Blue Top Divider Bar */}
              <div className="border-b-2 border-sky-400 my-2.5"></div>

              {/* OPD Registration & Clinical Header Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 my-2 font-mono text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">OPD Reg No:</span>
                  <strong className="text-blue-900 font-bold text-xs">{opdRegNo}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Patient UHID:</span>
                  <strong className="text-emerald-800 font-bold text-xs">{selectedRx.patient_uhid}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Prescription No:</span>
                  <strong className="text-slate-900 font-bold text-xs">{selectedRx.prescription_no}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">OPD Department:</span>
                  <strong className="text-slate-900 text-xs">{selectedRx.department || rxDoctor.department}</strong>
                </div>
              </div>

              {/* Patient Information & Demographics (Requirements 6 & 9) */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="text-sm">
                    <span className="text-slate-500 font-medium">Patient: </span>
                    <strong className="text-slate-900 font-bold text-sm">{selectedRx.patient_name}</strong>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium text-xs">
                    <span><strong>Age:</strong> {selectedRx.age} Yrs</span>
                    <span className="text-slate-300">|</span>
                    <span><strong>Gender:</strong> {selectedRx.gender}</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-phone text-slate-400 text-[10px]"></i>
                      <strong className="font-mono">{patientPhone}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-2 pt-1 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-500">Patient Location: </span>
                    <strong className="text-slate-800">{patientLocation}</strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-slate-700 font-medium">
                      Date: <span className="font-mono text-slate-900 font-bold">{selectedRx.prescription_date}</span>
                    </div>
                    <div className="text-amber-600 font-semibold">
                      Follow Up: <span className="font-mono font-bold">{followUpDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nature of Health Issue & Clinical Diagnosis Box */}
              <div className="bg-sky-50/40 border border-sky-200/80 rounded-xl p-3 my-2 text-xs text-slate-800 space-y-1">
                <div className="text-slate-600">
                  Nature of Health Issue (Reception Intake): <strong className="text-sky-950 font-semibold">{natureOfHealthIssue}</strong>
                </div>
                <div className="text-slate-900 pt-0.5 border-t border-sky-100">
                  <strong className="font-bold text-slate-900">Clinical Diagnosis: </strong>
                  <span className="text-sky-900 font-bold">{selectedRx.diagnosis_summary || 'Clinical Evaluation Completed'}</span>
                </div>
              </div>

              {/* ℞ Prescription Table Section */}
              <div className="my-2.5">
                <div className="text-2xl font-serif font-black text-sky-600 mb-1 leading-none">
                  ℞
                </div>

                <div className="border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-sky-50/80 text-slate-900 text-xs font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 font-bold">Medicine</th>
                        <th className="py-2 px-3 font-bold">Dosage</th>
                        <th className="py-2 px-3 font-bold">Duration</th>
                        <th className="py-2 px-3 font-bold">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {selectedRx.medicines.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {med.medicine_name} {med.strength ? `${med.strength}` : ''}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-700">
                            {med.dosage || med.frequency || '1-0-0'}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-700">
                            {med.duration || '5 Days'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-medium">
                            {med.instructions || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Notes & Dietary Advice */}
                <div className="text-xs text-slate-700 mt-2 font-medium">
                  Notes: <span className="text-slate-600">{selectedRx.advice || 'Follow prescribed dosage carefully. Avoid cold drinks/spicy food and maintain adequate hydration.'}</span>
                </div>
              </div>

              {/* Bottom Divider & Footer: Doctor Signature & Clinical Certification */}
              <div className="border-t border-slate-200 mt-6 pt-3 flex justify-between items-end">
                {/* Left: Medical Certification Notice (Strictly No Consultation Fee / Billing Info) */}
                <div className="space-y-0.5 text-[11px] text-slate-500 font-sans">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <i className="fa-solid fa-file-waveform text-sky-600"></i> Official Doctor Clinical Prescription
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dispense only as prescribed. Valid across all certified healthcare &amp; pharmacy centers.
                  </div>
                </div>

                {/* Right: Doctor's Italicised Signature */}
                <div className="text-right">
                  <div className="font-serif italic font-semibold text-slate-800 text-lg pr-2">
                    {rxDoctor.full_name}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
              <i className="fa-solid fa-prescription-bottle-medical text-3xl text-slate-300 mb-3 block"></i>
              No prescription selected. Issue a new prescription or choose one from the list.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {rxToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Delete Digital Prescription</h3>
                <p className="text-xs text-slate-500">{rxToDelete.prescription_no}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the prescription issued for{' '}
              <strong className="text-slate-900">{rxToDelete.patient_name}</strong> by{' '}
              <strong className="text-slate-900">{rxToDelete.doctor_name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRxToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRx}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <i className="fa-solid fa-trash-can text-[11px]"></i> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Digital Prescription Generator Modal (Strictly Clinical Content) */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#004b91] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <i className="fa-solid fa-file-prescription text-sky-300"></i> Doctor's Digital Prescription Studio (Rx)
                </h3>
                <p className="text-xs text-sky-200">Issue official clinical prescription: diagnosis, prescribed medicines, dosages, and medical advice</p>
              </div>
              <button onClick={() => setIsGeneratorOpen(false)} className="text-white hover:text-sky-200 cursor-pointer">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Patient Selection & Vitals Strip */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedPatientId(val === 'manual' ? 'manual' : Number(val));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:bg-white outline-none text-slate-800 bg-white font-bold"
                    >
                      <option value="manual">+ Enter Patient Details Manually</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.uhid}) - {p.department} - {p.gender}/{p.age}Y
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prescribing Doctor *</label>
                    <select
                      value={doctorId}
                      onChange={(e) => setDoctorId(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:bg-white outline-none text-slate-800 bg-white font-bold"
                    >
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name} ({d.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activePatientForDraft && (
                  <div className="space-y-2">
                    <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-2.5 flex flex-wrap justify-between items-center text-[11px]">
                      <div>
                        <span className="text-slate-500 font-medium">OPD Reg No: </span>
                        <strong className="text-blue-900 font-mono font-bold">
                          {activePatientAppt?.opd_reg_no || activePatientAppt?.appointment_no || `OPD-2026-${activePatientForDraft.uhid}`}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Contact: </span>
                        <strong className="text-slate-800 font-mono">{activePatientForDraft.phone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Location: </span>
                        <strong className="text-slate-800">{activePatientForDraft.location || activePatientForDraft.address || 'Chennai'}</strong>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Intake Complaints (Reception): </span>
                      <strong className="text-slate-800">{activePatientAppt?.nature_of_health_issue || activePatientAppt?.symptoms || activePatientForDraft.nature_of_health_issue || 'Clinical OPD Assessment'}</strong>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-wrap justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-500 font-sans font-bold">Recorded Biological Vitals:</span>
                      <span>BP: <strong>{activePatientForDraft.bp || '—'}</strong></span>
                      <span>Pulse: <strong>{activePatientForDraft.pulse || '—'}</strong></span>
                      <span>SpO2: <strong className="text-emerald-700">{activePatientForDraft.spo2 || '—'}</strong></span>
                      <span>Blood: <strong className="text-rose-700">{activePatientForDraft.blood_group || '—'}</strong></span>
                      <span>Allergies: <strong>{activePatientForDraft.allergies || '—'}</strong></span>
                    </div>
                  </div>
                )}

                {selectedPatientId === 'manual' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Patient Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Patient Full Name"
                        value={manualPatientName}
                        onChange={(e) => setManualPatientName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-medium text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Age &amp; Gender</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="number"
                          placeholder="Age"
                          value={manualPatientAge}
                          onChange={(e) => setManualPatientAge(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded font-medium text-xs"
                        />
                        <select
                          value={manualPatientGender}
                          onChange={(e) => setManualPatientGender(e.target.value)}
                          className="w-full px-1 py-1.5 bg-white border border-slate-200 rounded text-xs"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Contact Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98840 00000"
                        value={manualPatientPhone}
                        onChange={(e) => setManualPatientPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-medium text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Patient Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Vadapalani, Chennai"
                        value={manualPatientLocation}
                        onChange={(e) => setManualPatientLocation(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-medium text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">OPD Reg Number</label>
                      <input
                        type="text"
                        placeholder="OPD-2026-XXXX"
                        value={manualOpdRegNo}
                        onChange={(e) => setManualOpdRegNo(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-medium text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nature of Health Issue</label>
                      <input
                        type="text"
                        placeholder="Initial Symptoms / Complaints"
                        value={manualNatureOfIssue}
                        onChange={(e) => setManualNatureOfIssue(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-medium text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Diagnosis & Findings *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Bronchitis with Mild Pyrexia"
                  value={diagnosisSummary}
                  onChange={(e) => setDiagnosisSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:bg-white outline-none text-slate-800 font-bold"
                />
              </div>

              {/* Vitals carried over from Consultations */}
              {carriedVitals && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg bg-rose-50/70 border border-rose-200 p-3">
                  {carriedVitals.bp && (
                    <div>
                      <div className="text-[10px] font-bold text-rose-400 uppercase">Blood Pressure</div>
                      <div className="text-sm font-bold text-slate-800">{carriedVitals.bp}</div>
                    </div>
                  )}
                  {carriedVitals.pulse != null && carriedVitals.pulse !== '' && (
                    <div>
                      <div className="text-[10px] font-bold text-rose-400 uppercase">Heart Rate</div>
                      <div className="text-sm font-bold text-slate-800">{carriedVitals.pulse} bpm</div>
                    </div>
                  )}
                  {carriedVitals.temperature && (
                    <div>
                      <div className="text-[10px] font-bold text-rose-400 uppercase">Temp</div>
                      <div className="text-sm font-bold text-slate-800">{carriedVitals.temperature}</div>
                    </div>
                  )}
                  {carriedVitals.spo2 && (
                    <div>
                      <div className="text-[10px] font-bold text-rose-400 uppercase">SpO2</div>
                      <div className="text-sm font-bold text-slate-800">{carriedVitals.spo2}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Medicine Formulations Builder */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold text-slate-800 text-xs">Prescribed Formulations</label>
                  <button
                    type="button"
                    onClick={addMedicineRow}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1 rounded-lg text-[11px]"
                  >
                    + Add Medication
                  </button>
                </div>

                <div className="space-y-2">
                  {draftMedicines.map((med, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <div className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">Medicine</div>
                          <select
                            value={med.medicine_name}
                            onChange={(e) => updateMedicineRow(idx, 'medicine_name', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-bold cursor-pointer"
                          >
                            {medicines.length === 0 && (
                              <option value={med.medicine_name}>{med.medicine_name}</option>
                            )}
                            {medicines.map((m) => (
                              <option key={m.id} value={m.medicine_name}>
                                {m.medicine_name} ({m.form} {m.strength})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <div className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">Dosage</div>
                          <input
                            type="text"
                            placeholder="e.g. 1 Tablet"
                            value={med.dosage}
                            onChange={(e) => updateMedicineRow(idx, 'dosage', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">Frequency</div>
                          <input
                            type="text"
                            placeholder="0-0-1"
                            value={med.frequency}
                            onChange={(e) => updateMedicineRow(idx, 'frequency', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="text-[9px] font-bold text-slate-500 uppercase mb-0.5">Duration</div>
                          <input
                            type="text"
                            placeholder="5 Days"
                            value={med.duration}
                            onChange={(e) => updateMedicineRow(idx, 'duration', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-center"
                          />
                        </div>
                        <div className="col-span-1">
                          <div className="text-[9px] font-bold text-slate-500 uppercase mb-1 text-center">Qty</div>
                          <input
                            type="number"
                            value={med.quantity}
                            onChange={(e) => updateMedicineRow(idx, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-mono text-center"
                          />
                        </div>
                        <div className="col-span-1 text-center pb-0.5">
                          <button
                            type="button"
                            onClick={() => removeMedicineRow(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-12">
                          <input
                            type="text"
                            placeholder="Instructions (optional) — type only if you want to add medicine instructions for the patient"
                            value={med.instructions || ''}
                            onChange={(e) => updateMedicineRow(idx, 'instructions', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dietary & Lifestyle Advice</label>
                <textarea
                  rows={2}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:bg-white outline-none"
                />
              </div>

              {/* Clinical Verification Notice (No Billing / Fee Information) */}
              <div className="bg-sky-50 border border-sky-200 text-sky-950 p-4 rounded-xl flex items-start gap-3 text-xs">
                <i className="fa-solid fa-stethoscope text-sky-700 text-base mt-0.5 shrink-0"></i>
                <div className="space-y-1">
                  <div className="font-bold text-sky-950">Clinical-Only Digital Prescription Policy:</div>
                  <p className="text-sky-800 text-[11px] leading-relaxed">
                    This digital prescription records medical diagnoses, formulations, and care instructions exclusively. Per NABH hospital policy, all consultation fees (₹700 consultation + ₹200 Clinical Nursing + applicable tax) and payment settlements are handled at the Front Desk Receptionist station after consultation completion.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#004b91] hover:bg-[#00386c] text-white font-bold rounded-lg shadow-xs flex items-center gap-2 cursor-pointer text-xs"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Complete &amp; Submit Digital Prescription</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
