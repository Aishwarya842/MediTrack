import React, { useState, useMemo } from 'react';
import { Patient, Doctor } from '../data/hospitalData';
import { dbService } from '../services/db';

interface PatientsViewProps {
  patients: Patient[];
  doctors?: Doctor[];
  currentUser?: any;
  onAddPatient: (patientData: any) => Promise<void>;
  onReceptionistRegister?: (registrationData: {
    patientData: Partial<Patient>;
    doctorId: number;
    department: string;
    appointmentType?: string;
    symptoms?: string;
  }) => Promise<{ success: boolean; error?: string; patient?: Patient; matchedPatient?: Patient }>;
  onUpdatePatient?: (patientData: Patient) => Promise<void> | void;
  onDeletePatient?: (patientId: number) => Promise<void> | void;
  onNavigate: (view: string) => void;
}

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Orthopaedics',
  'Neurosciences',
  'Obstetrics & Gynaecology',
  'Paediatrics',
  'Nephrology',
  'Gastroenterology',
  'Dermatology',
  'ENT & Head-Neck'
];

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  doctors = [],
  currentUser,
  onAddPatient,
  onReceptionistRegister,
  onUpdatePatient,
  onDeletePatient,
  onNavigate
}) => {
  const isDoctor = currentUser?.role === 'DOCTOR';
  const doctorDept = currentUser?.department || '';
  const doctorName = currentUser?.full_name || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    isDoctor ? doctorDept || 'General Medicine' : 'All'
  );
  const [selectedBlood, setSelectedBlood] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('1992-05-15');
  const [age, setAge] = useState<number>(34);
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [department, setDepartment] = useState(isDoctor ? doctorDept || 'General Medicine' : 'General Medicine');
  const [assignedDoctorId, setAssignedDoctorId] = useState<number>(currentUser?.doctor_id || 15);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Chennai');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [symptoms, setSymptoms] = useState('General health checkup / consultation');

  // Biological & Vitals State
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [pulse, setPulse] = useState<number>(76);
  const [temperature, setTemperature] = useState('98.4 °F');
  const [spo2, setSpo2] = useState('99%');
  const [allergies, setAllergies] = useState('No known drug allergies (NKDA)');
  const [history, setHistory] = useState('None reported');

  // Duplicate Check Feedback
  const [duplicateWarning, setDuplicateWarning] = useState<{
    isDuplicate: boolean;
    reason?: string;
    matchedPatient?: Patient;
  } | null>(null);

  // Success Feedback Modal
  const [registeredSuccessPatient, setRegisteredSuccessPatient] = useState<Patient | null>(null);

  // Update / Edit Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDob, setEditDob] = useState('1990-01-01');
  const [editAge, setEditAge] = useState(30);
  const [editGender, setEditGender] = useState('Male');
  const [editBloodGroup, setEditBloodGroup] = useState('O+');
  const [editDepartment, setEditDepartment] = useState('General Medicine');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('Chennai');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editHeight, setEditHeight] = useState<number>(170);
  const [editWeight, setEditWeight] = useState<number>(68);
  const [editBpSystolic, setEditBpSystolic] = useState<number>(120);
  const [editBpDiastolic, setEditBpDiastolic] = useState<number>(80);
  const [editPulse, setEditPulse] = useState<number>(76);
  const [editTemperature, setEditTemperature] = useState('98.4 °F');
  const [editSpo2, setEditSpo2] = useState('99%');
  const [editAllergies, setEditAllergies] = useState('');
  const [editHistory, setEditHistory] = useState('');

  // Delete Confirmation Modal State
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate live BMI
  const computedBmi = useMemo(() => {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return 0;
    const hM = heightCm / 100;
    return Number((weightKg / (hM * hM)).toFixed(1));
  }, [heightCm, weightKg]);

  const getBmiCategory = (bmiVal: number) => {
    if (bmiVal === 0) return { label: 'Not calculated', color: 'text-slate-400' };
    if (bmiVal < 18.5) return { label: 'Underweight', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (bmiVal < 25) return { label: 'Healthy Weight', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (bmiVal < 30) return { label: 'Overweight', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Obese', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  // Live Duplicate Check on Typing Phone / Full Name
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    const clean = val.replace(/\D/g, '').slice(-10);
    if (clean.length >= 10) {
      const check = dbService.checkDuplicatePatient(patients, { phone: val, full_name: fullName });
      if (check.isDuplicate) {
        setDuplicateWarning(check);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleNameChange = (val: string) => {
    setFullName(val);
    if (phone.length >= 10) {
      const check = dbService.checkDuplicatePatient(patients, { phone, full_name: val });
      if (check.isDuplicate) {
        setDuplicateWarning(check);
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  // Doctors matching selected department
  const filteredDoctorsForDept = useMemo(() => {
    if (!doctors || doctors.length === 0) return [];
    const deptMatch = doctors.filter((d) => d.department.toLowerCase().includes(department.toLowerCase()) || department.toLowerCase().includes(d.department.toLowerCase()));
    return deptMatch.length > 0 ? deptMatch : doctors;
  }, [doctors, department]);

  // Set default doctor whenever department changes
  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    const matchingDocs = doctors.filter((d) => d.department.toLowerCase().includes(newDept.toLowerCase()) || newDept.toLowerCase().includes(d.department.toLowerCase()));
    if (matchingDocs.length > 0) {
      setAssignedDoctorId(matchingDocs[0].id);
    }
  };

  // Filter Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchQuery =
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        (p.department && p.department.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDept =
        selectedDepartment === 'All' ||
        (p.department && p.department.toLowerCase() === selectedDepartment.toLowerCase());

      const matchBlood = !selectedBlood || p.blood_group === selectedBlood;

      return matchQuery && matchDept && matchBlood;
    });
  }, [patients, searchTerm, selectedDepartment, selectedBlood]);

  // Handle Form Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Please provide the patient full name and 10-digit mobile number.');
      return;
    }

    // Final Duplicate Check
    const dupCheck = dbService.checkDuplicatePatient(patients, { phone, full_name: fullName });
    if (dupCheck.isDuplicate) {
      setDuplicateWarning(dupCheck);
      alert(`⚠️ Duplicate Entry Blocked:\n\n${dupCheck.reason}\n\nPlease verify or select the existing patient record.`);
      return;
    }

    const docObj = doctors.find((d) => d.id === Number(assignedDoctorId)) || filteredDoctorsForDept[0] || doctors[0];

    const bpString = `${bpSystolic}/${bpDiastolic} mmHg`;

    if (onReceptionistRegister) {
      const res = await onReceptionistRegister({
        patientData: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          date_of_birth: dob,
          age: Number(age) || 30,
          gender,
          blood_group: bloodGroup,
          department,
          assigned_doctor_id: docObj?.id,
          assigned_doctor_name: docObj?.full_name,
          height_cm: Number(heightCm),
          weight_kg: Number(weightKg),
          bmi: computedBmi,
          bp_systolic: Number(bpSystolic),
          bp_diastolic: Number(bpDiastolic),
          bp: bpString,
          pulse: Number(pulse),
          temperature,
          spo2,
          allergies: allergies.trim() || 'No known drug allergies (NKDA)',
          medical_history: history.trim() || 'General OPD evaluation',
          address: address.trim() || 'Chennai',
          city: city.trim() || 'Chennai',
          emergency_contact_name: emergencyName.trim() || 'Family Relative',
          emergency_contact_phone: emergencyPhone.trim() || phone.trim()
        },
        doctorId: docObj ? docObj.id : 1,
        department,
        appointmentType: `${department} OPD Consultation`,
        symptoms
      });

      if (!res.success) {
        alert(`Error: ${res.error}`);
        return;
      }

      if (res.patient) {
        setRegisteredSuccessPatient(res.patient);
      }
    } else {
      const nextId = patients.length + 1;
      const uhid = `UHID-2026-${String(nextId).padStart(4, '0')}`;
      const newP: Patient = {
        id: nextId,
        uhid,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        date_of_birth: dob,
        age: Number(age) || 30,
        gender,
        blood_group: bloodGroup,
        department,
        assigned_doctor_id: docObj?.id,
        assigned_doctor_name: docObj?.full_name,
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        bmi: computedBmi,
        bp_systolic: Number(bpSystolic),
        bp_diastolic: Number(bpDiastolic),
        bp: bpString,
        pulse: Number(pulse),
        temperature,
        spo2,
        allergies: allergies.trim() || 'No known drug allergies (NKDA)',
        medical_history: history.trim() || 'Routine assessment',
        address: address.trim() || 'Chennai',
        city: city.trim() || 'Chennai',
        state: 'Tamil Nadu',
        emergency_contact_name: emergencyName.trim() || 'Relative',
        emergency_contact_phone: emergencyPhone.trim() || phone.trim(),
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      await onAddPatient(newP);
      setRegisteredSuccessPatient(newP);
    }

    setIsModalOpen(false);
    // Reset Form
    setFullName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setEmergencyName('');
    setEmergencyPhone('');
    setAllergies('No known drug allergies (NKDA)');
    setHistory('None reported');
    setDuplicateWarning(null);
  };

  // Open Edit Modal with Pre-filled Data
  const handleOpenEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setEditFullName(patient.full_name || '');
    setEditPhone(patient.phone || '');
    setEditEmail(patient.email || '');
    setEditDob(patient.date_of_birth || '1990-01-01');
    setEditAge(patient.age || 30);
    setEditGender(patient.gender || 'Male');
    setEditBloodGroup(patient.blood_group || 'O+');
    setEditDepartment(patient.department || 'General Medicine');
    setEditAddress(patient.address || '');
    setEditCity(patient.city || 'Chennai');
    setEditEmergencyName(patient.emergency_contact_name || '');
    setEditEmergencyPhone(patient.emergency_contact_phone || '');
    setEditHeight(patient.height_cm || 170);
    setEditWeight(patient.weight_kg || 68);
    setEditBpSystolic(patient.bp_systolic || 120);
    setEditBpDiastolic(patient.bp_diastolic || 80);
    setEditPulse(patient.pulse || 76);
    setEditTemperature(patient.temperature || '98.4 °F');
    setEditSpo2(patient.spo2 || '99%');
    setEditAllergies(patient.allergies || '');
    setEditHistory(patient.medical_history || '');
    setIsEditModalOpen(true);
  };

  // Save Updated Patient Record
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    if (!editFullName.trim() || !editPhone.trim()) {
      alert('Please provide patient name and phone number.');
      return;
    }

    const hM = editHeight / 100;
    const computedEditBmi = hM > 0 && editWeight > 0 ? Number((editWeight / (hM * hM)).toFixed(1)) : undefined;

    const updatedData: Patient = {
      ...editingPatient,
      full_name: editFullName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      date_of_birth: editDob,
      age: Number(editAge) || 30,
      gender: editGender,
      blood_group: editBloodGroup,
      department: editDepartment,
      height_cm: Number(editHeight),
      weight_kg: Number(editWeight),
      bmi: computedEditBmi,
      bp_systolic: Number(editBpSystolic),
      bp_diastolic: Number(editBpDiastolic),
      bp: `${editBpSystolic}/${editBpDiastolic} mmHg`,
      pulse: Number(editPulse),
      temperature: editTemperature,
      spo2: editSpo2,
      address: editAddress.trim(),
      city: editCity.trim(),
      emergency_contact_name: editEmergencyName.trim(),
      emergency_contact_phone: editEmergencyPhone.trim(),
      allergies: editAllergies.trim(),
      medical_history: editHistory.trim()
    };

    if (onUpdatePatient) {
      await onUpdatePatient(updatedData);
    }
    setIsEditModalOpen(false);
    setEditingPatient(null);
  };

  // Delete Patient
  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    setIsDeleting(true);
    try {
      if (onDeletePatient) {
        await onDeletePatient(patientToDelete.id);
      }
      setPatientToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Direct CSV Export of filtered patient records
  const handleExportFilteredCSV = () => {
    if (!filteredPatients || filteredPatients.length === 0) {
      alert('No patient records to export.');
      return;
    }

    const headers = [
      'UHID',
      'Full Name',
      'Age',
      'Gender',
      'Date of Birth',
      'Mobile Number',
      'Email Address',
      'Blood Group',
      'Department',
      'City',
      'Address',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Height (cm)',
      'Weight (kg)',
      'BMI',
      'BMI Status',
      'Blood Pressure',
      'Pulse Rate (bpm)',
      'Temperature (°F)',
      'SpO2 (%)',
      'Drug Allergies',
      'Medical History',
      'Registration Date'
    ];

    const rows = filteredPatients.map((p) => [
      p.uhid,
      p.full_name,
      p.age,
      p.gender,
      p.dob || '',
      p.phone,
      p.email || '',
      p.blood_group,
      p.department,
      p.city || '',
      p.address || '',
      p.emergency_contact?.name || '',
      p.emergency_contact?.phone || '',
      p.vitals?.height_cm ?? '',
      p.vitals?.weight_kg ?? '',
      p.vitals?.bmi ?? '',
      p.vitals?.bmi_category ?? '',
      p.vitals?.blood_pressure ?? '',
      p.vitals?.pulse_rate ?? '',
      p.vitals?.temperature_f ?? '',
      p.vitals?.spo2 ?? '',
      Array.isArray(p.allergies) ? p.allergies.join('; ') : (p.allergies || 'None'),
      Array.isArray(p.medical_history) ? p.medical_history.join('; ') : (p.medical_history || 'None'),
      p.created_at || ''
    ]);

    const csvContent = [
      headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row
          .map((val) => {
            if (val === null || val === undefined) return '""';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `meditrack_patients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Doctor Department Isolation Banner */}
      {isDoctor && (
        <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse"></span>
            <span className="font-bold text-sky-950">
              Department Patient Roster: Filtered for {doctorName} ({doctorDept || 'General Medicine'}).
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-sky-900 bg-white px-2.5 py-0.5 rounded-md border border-sky-200 shadow-xs">
            {filteredPatients.length} Department Patients
          </span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Reception & Hospital Master
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total Patients: {patients.length}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Patient Master Registry & Vitals Station
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict department categorization, duplicate entry prevention, and full biological vitals collection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFilteredCSV}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2 shadow-2xs transition cursor-pointer"
            title="Export filtered patient list to CSV"
          >
            <i className="fa-solid fa-file-csv text-emerald-600"></i>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setDuplicateWarning(null);
              setIsModalOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <i className="fa-solid fa-user-plus text-sky-400"></i>
            <span>Register New Patient & Vitals</span>
          </button>
        </div>
      </div>

      {/* Department Filter Tabs (Strict Category Isolation) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase px-2 flex items-center gap-1">
          <i className="fa-solid fa-filter text-sky-500 text-[11px]"></i> Department:
        </span>
        <button
          onClick={() => setSelectedDepartment('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            selectedDepartment === 'All'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          All Departments ({patients.length})
        </button>
        {DEPARTMENTS.map((dept) => {
          const count = patients.filter((p) => p.department && p.department.toLowerCase() === dept.toLowerCase()).length;
          const isActive = selectedDepartment.toLowerCase() === dept.toLowerCase();
          return (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{dept}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isActive ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Secondary Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap justify-between items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search by Patient Name, UHID, Mobile Number, or Department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBlood}
            onChange={(e) => setSelectedBlood(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>

      {/* Patients Table / Grid */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="p-3.5">UHID & Identity</th>
                <th className="p-3.5">Department & Doctor</th>
                <th className="p-3.5">Biological Vitals (BP / Pulse / Temp / SpO2)</th>
                <th className="p-3.5">BMI & Physical</th>
                <th className="p-3.5">Allergies & Medical History</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <i className="fa-solid fa-hospital-user text-3xl text-slate-300 mb-2 block"></i>
                    No patient records match the selected department or search filter.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const bmiInfo = p.bmi ? getBmiCategory(p.bmi) : null;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      {/* Identity */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{p.full_name}</span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                            {p.gender?.charAt(0)} / {p.age}y
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-emerald-700 font-bold mt-0.5">
                          {p.uhid}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <i className="fa-solid fa-phone text-[9px] text-slate-400"></i>
                          <span>{p.phone}</span>
                        </div>
                      </td>

                      {/* Department & Doctor */}
                      <td className="p-3.5">
                        <span className="inline-block bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          {p.department || 'General Medicine'}
                        </span>
                        <div className="text-[11px] text-slate-700 font-medium mt-1 flex items-center gap-1">
                          <i className="fa-solid fa-user-doctor text-slate-400 text-[10px]"></i>
                          <span>{p.assigned_doctor_name || 'Dr. Divya Radhakrishnan'}</span>
                        </div>
                        {p.registered_by && (
                          <div className="text-[10px] text-slate-400 mt-0.5 italic">
                            By: {p.registered_by}
                          </div>
                        )}
                      </td>

                      {/* Biological Vitals */}
                      <td className="p-3.5">
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] max-w-xs">
                          <div className="bg-slate-50 border border-slate-200/60 rounded px-1.5 py-0.5">
                            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Blood Press.</span>
                            <strong className="text-slate-900 font-mono">{p.bp || (p.bp_systolic && p.bp_diastolic ? `${p.bp_systolic}/${p.bp_diastolic}` : '120/80')}</strong>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/60 rounded px-1.5 py-0.5">
                            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Pulse Rate</span>
                            <strong className="text-slate-900 font-mono">{p.pulse || 76} bpm</strong>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/60 rounded px-1.5 py-0.5">
                            <span className="text-[9px] text-slate-400 uppercase font-semibold block">SpO2 Level</span>
                            <strong className="text-emerald-700 font-mono font-bold">{p.spo2 || '99%'}</strong>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/60 rounded px-1.5 py-0.5">
                            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Blood Group</span>
                            <strong className="text-rose-700 font-mono font-bold">{p.blood_group || 'O+'}</strong>
                          </div>
                        </div>
                      </td>

                      {/* BMI & Physical */}
                      <td className="p-3.5">
                        <div className="text-xs text-slate-800">
                          <span>{p.height_cm || 170} cm / {p.weight_kg || 68} kg</span>
                        </div>
                        {p.bmi && bmiInfo ? (
                          <div className="mt-1">
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border ${bmiInfo.color}`}>
                              BMI: {p.bmi} ({bmiInfo.label})
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 mt-1">Temp: {p.temperature || '98.4 °F'}</div>
                        )}
                      </td>

                      {/* Allergies & History */}
                      <td className="p-3.5 max-w-[200px]">
                        <div className="flex items-center gap-1 mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            p.allergies && !p.allergies.toLowerCase().includes('no known') && !p.allergies.toLowerCase().includes('nkda')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            <i className="fa-solid fa-triangle-exclamation text-[9px] mr-1"></i>
                            {p.allergies || 'NKDA'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate" title={p.medical_history}>
                          {p.medical_history || 'No chronic history recorded.'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPatientForDetail(p)}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg shadow-2xs font-semibold transition cursor-pointer"
                          title="View Full Health Card & Vitals"
                        >
                          <i className="fa-solid fa-id-card text-sky-500 mr-1"></i> Health Card
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg shadow-2xs font-semibold transition cursor-pointer"
                          title="Edit Patient Details"
                        >
                          <i className="fa-solid fa-pen-to-square text-slate-400"></i>
                        </button>

                        {onDeletePatient && (
                          <button
                            onClick={() => setPatientToDelete(p)}
                            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs px-2.5 py-1.5 rounded-lg shadow-2xs font-semibold transition cursor-pointer"
                            title="Delete Patient Record"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Health Card Modal */}
      {selectedPatientForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#004b91] text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-hospital-user text-sky-300"></i>
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">MediTrack Hospital Patient Identity Card</h3>
                  <p className="text-xs text-sky-200">NABH Accredited Tertiary Multispeciality Medical Centre</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientForDetail(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Top Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Patient Full Name</div>
                  <div className="text-lg font-bold text-slate-900">{selectedPatientForDetail.full_name}</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {selectedPatientForDetail.gender} / {selectedPatientForDetail.age} Years (DOB: {selectedPatientForDetail.date_of_birth})
                  </div>
                  <div className="text-xs font-mono text-emerald-700 font-bold mt-1">
                    UHID: {selectedPatientForDetail.uhid}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold px-3 py-1 rounded-full">
                    {selectedPatientForDetail.department || 'General Medicine'}
                  </span>
                  <div className="text-xs text-slate-600 mt-2">
                    Attending: <strong>{selectedPatientForDetail.assigned_doctor_name || 'Dr. Divya Radhakrishnan'}</strong>
                  </div>
                  <div className="text-xs font-mono text-rose-700 font-bold mt-1">
                    Blood Group: {selectedPatientForDetail.blood_group || 'O+'}
                  </div>
                </div>
              </div>

              {/* Biological Vitals Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">
                  Recorded Biological Vitals & Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Pressure</span>
                    <strong className="text-base font-bold text-slate-900 font-mono">
                      {selectedPatientForDetail.bp || '120/80'}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">mmHg (Standard)</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Pulse / Heart Rate</span>
                    <strong className="text-base font-bold text-slate-900 font-mono">
                      {selectedPatientForDetail.pulse || 76}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">beats per min</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Oxygen (SpO2)</span>
                    <strong className="text-base font-bold text-emerald-700 font-mono">
                      {selectedPatientForDetail.spo2 || '99%'}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Room Air</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Body Temp</span>
                    <strong className="text-base font-bold text-slate-900 font-mono">
                      {selectedPatientForDetail.temperature || '98.4 °F'}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Oral / Axillary</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Height & Weight</span>
                    <strong className="text-xs font-bold text-slate-900">
                      {selectedPatientForDetail.height_cm || 170} cm / {selectedPatientForDetail.weight_kg || 68} kg
                    </strong>
                    <span className="text-[10px] text-slate-500 block">BMI: {selectedPatientForDetail.bmi || '23.5'}</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs col-span-1 sm:col-span-3">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Allergies & Alerts</span>
                    <strong className="text-xs font-bold text-rose-700">
                      {selectedPatientForDetail.allergies || 'No known drug allergies (NKDA)'}
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      History: {selectedPatientForDetail.medical_history || 'Routine assessment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact & Address */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 flex flex-wrap justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Address & City</span>
                  <span>{selectedPatientForDetail.address || 'Chennai, Tamil Nadu'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Emergency Contact</span>
                  <span>{selectedPatientForDetail.emergency_contact_name} ({selectedPatientForDetail.emergency_contact_phone})</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <i className="fa-solid fa-print text-slate-500"></i> Print Official Card
              </button>
              <button
                onClick={() => setSelectedPatientForDetail(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Success Modal */}
      {registeredSuccessPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Patient Successfully Registered!</h3>
                <p className="text-xs text-slate-500">
                  Notification and OPD Token dispatched to assigned doctor.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient Name:</span>
                <strong className="text-slate-900">{registeredSuccessPatient.full_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Permanent UHID:</span>
                <strong className="font-mono text-emerald-700">{registeredSuccessPatient.uhid}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <strong className="text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">{registeredSuccessPatient.department}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Doctor:</span>
                <strong className="text-slate-900">{registeredSuccessPatient.assigned_doctor_name || 'Dr. Divya Radhakrishnan'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Vitals:</span>
                <span className="font-mono text-slate-700">BP: {registeredSuccessPatient.bp} | Pulse: {registeredSuccessPatient.pulse} bpm</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRegisteredSuccessPatient(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition cursor-pointer shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal with Biological Vitals & Real-Time Duplicate Prevention */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#004b91] text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-notes-medical text-sky-300"></i>
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">
                    Patient Registration & Biological Vitals Intake
                  </h3>
                  <p className="text-xs text-sky-200">
                    Front Desk Receptionist Station • Dispatches Live Notification to Doctor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegister} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
              {/* Duplicate Warning Banner */}
              {duplicateWarning?.isDuplicate && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-amber-900 animate-pulse">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-800 mb-1">
                    <i className="fa-solid fa-triangle-exclamation text-amber-600"></i>
                    <span>Duplicate Entry Alert!</span>
                  </div>
                  <p className="text-xs leading-relaxed">{duplicateWarning.reason}</p>
                  {duplicateWarning.matchedPatient && (
                    <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs">
                      <span>Existing UHID: <strong>{duplicateWarning.matchedPatient.uhid}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatientForDetail(duplicateWarning.matchedPatient!);
                          setIsModalOpen(false);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded text-[11px] shadow-2xs"
                      >
                        View Existing Patient Record
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 1: Patient Demographics */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-[11px]">
                    1
                  </span>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    Patient Demographics & Identification
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar Sundaram"
                      value={fullName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Mobile Number (10 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98840 12345"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Department & Doctor Dispatch */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-[11px]">
                    2
                  </span>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    Department Categorization & Doctor Assignment
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Speciality Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Patient details will be filed strictly under {department}.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Assigned Consultant Doctor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={assignedDoctorId}
                      onChange={(e) => setAssignedDoctorId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    >
                      {filteredDoctorsForDept.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name} ({d.department} - {d.room_number || 'OPD'})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-sky-700 font-medium mt-1 block">
                      Internal notification will be dispatched instantly to this doctor.
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Biological Vitals Intake */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                      3
                    </span>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                      Biological Details & Recorded Vitals
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Computed BMI: {computedBmi} ({getBmiCategory(computedBmi).label})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-rose-700"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Pulse (bpm)
                    </label>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      BP Systolic (mmHg)
                    </label>
                    <input
                      type="number"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      BP Diastolic (mmHg)
                    </label>
                    <input
                      type="number"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Temperature
                    </label>
                    <input
                      type="text"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      SpO2 (%)
                    </label>
                    <input
                      type="text"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Known Drug / Food Allergies
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Penicillin, Sulfa, Peanuts, or NKDA"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      Pre-existing Medical History
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Diabetes Mellitus 2 yrs, Hypertension, Thyroid"
                      value={history}
                      onChange={(e) => setHistory(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={duplicateWarning?.isDuplicate}
                  className={`font-bold px-6 py-2 rounded-lg transition shadow-xs flex items-center gap-2 cursor-pointer ${
                    duplicateWarning?.isDuplicate
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#004b91] hover:bg-[#00386c] text-white'
                  }`}
                >
                  <i className="fa-solid fa-paper-plane text-sky-300"></i>
                  <span>Register & Dispatch to Doctor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Edit Patient Record & Vitals</h3>
                <p className="text-xs text-slate-400">{editingPatient?.uhid}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:text-slate-300"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 mb-2">Biological Vitals</h4>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-500 text-[10px]">Height (cm)</label>
                    <input
                      type="number"
                      value={editHeight}
                      onChange={(e) => setEditHeight(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">Weight (kg)</label>
                    <input
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">BP Systolic</label>
                    <input
                      type="number"
                      value={editBpSystolic}
                      onChange={(e) => setEditBpSystolic(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">BP Diastolic</label>
                    <input
                      type="number"
                      value={editBpDiastolic}
                      onChange={(e) => setEditBpDiastolic(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Delete Patient Record</h3>
                <p className="text-xs text-slate-500">{patientToDelete.uhid}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">{patientToDelete.full_name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition shadow-xs"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
