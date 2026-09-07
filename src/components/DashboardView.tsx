import React, { useState, useMemo } from 'react';
import { Patient, Doctor, Appointment, Invoice, Prescription, Medicine, OPD_CONSULTATION_FEE, IPD_PACKAGES } from '../data/hospitalData';
import { AppointmentTokenModal } from './AppointmentTokenModal';
import DatePickerCalendar from './DatePickerCalendar';

interface DashboardViewProps {
  currentUser: any;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  invoices: Invoice[];
  prescriptions?: Prescription[];
  medicines?: Medicine[];
  notifications?: any[];
  onNavigate: (view: string) => void;
  onExaminePatient?: (appointment: Appointment) => void;
  onUpdateAppointment?: (appointment: Appointment) => Promise<void> | void;
  onDeleteAppointment?: (appointmentId: number) => Promise<void> | void;
  onUpdatePatient?: (patient: Patient) => Promise<void> | void;
  onDeletePatient?: (patientId: number) => Promise<void> | void;
  onReceptionistRegister?: (data: any) => Promise<any>;
  onCollectReceptionFee?: (data: any) => Promise<any> | void;
  onUpdateNotificationStatus?: (id: number, status: 'Unread' | 'Read' | 'Attending') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  patients,
  doctors,
  appointments,
  invoices,
  prescriptions = [],
  medicines = [],
  notifications = [],
  onNavigate,
  onExaminePatient,
  onUpdateAppointment,
  onDeleteAppointment,
  onReceptionistRegister,
  onCollectReceptionFee,
  onUpdateNotificationStatus
}) => {
  const role = currentUser?.role || 'ADMIN';
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total_amount, 0);

  // Admin Department Filter State
  const [adminSelectedDept, setAdminSelectedDept] = useState<string>('All');

  // Patient Token View Modal
  const [tokenViewAppt, setTokenViewAppt] = useState<Appointment | null>(null);

  // Fast Receptionist Registration Modal from Dashboard
  const [isQuickRegOpen, setIsQuickRegOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickDob, setQuickDob] = useState('');
  const [quickAge, setQuickAge] = useState('');
  const [quickGender, setQuickGender] = useState('');
  const [quickBlood, setQuickBlood] = useState('');
  const [quickDept, setQuickDept] = useState('General Medicine');
  const [quickDocId, setQuickDocId] = useState<number>(15);
  const [quickBp, setQuickBp] = useState('');
  const [quickPulse, setQuickPulse] = useState('');
  const [quickTemp, setQuickTemp] = useState('');
  const [quickSpo2, setQuickSpo2] = useState('');
  const [quickAllergies, setQuickAllergies] = useState('');
  const [quickSymptoms, setQuickSymptoms] = useState('');
  const [quickDupAlert, setQuickDupAlert] = useState<string | null>(null);

  // Quick Walk-In Category & Fee
  const [quickCategory, setQuickCategory] = useState<'OPD Consultation' | 'IPD Surgical & ICU'>('OPD Consultation');
  const [quickIpdPackage, setQuickIpdPackage] = useState<string>(IPD_PACKAGES[0]?.title || 'Critical Care & Intensive Care Unit (ICU)');
  const [quickFeeAmount, setQuickFeeAmount] = useState<number>(OPD_CONSULTATION_FEE);
  const [quickPaymentMode, setQuickPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Insurance / TPA'>('Cash');

  // Reception Fee Collection Modal for Online Unpaid Bookings
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [targetApptForPayment, setTargetApptForPayment] = useState<Appointment | null>(null);
  const [feeHeight, setFeeHeight] = useState('');
  const [feeWeight, setFeeWeight] = useState('');
  const [feeBpSystolic, setFeeBpSystolic] = useState('');
  const [feeBpDiastolic, setFeeBpDiastolic] = useState('');
  const [feePulse, setFeePulse] = useState('');
  const [feeTemp, setFeeTemp] = useState('');
  const [feeSpo2, setFeeSpo2] = useState('');
  const [feeBloodGroup, setFeeBloodGroup] = useState('');
  const [feeAllergies, setFeeAllergies] = useState('');
  const [feeMedicalHistory, setFeeMedicalHistory] = useState('');
  const [feePaymentMode, setFeePaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Insurance / TPA'>('Cash');
  const [feeAmountInput, setFeeAmountInput] = useState<number>(OPD_CONSULTATION_FEE);
  const [feeLabAmount, setFeeLabAmount] = useState<number>(0);
  const [issuedMedicineQtys, setIssuedMedicineQtys] = useState<Record<number, number>>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Auto-calculate age from quick DOB
  useMemo(() => {
    if (!quickDob) {
      setQuickAge('');
      return;
    }
    const today = new Date();
    const [y, m, d] = quickDob.split('-').map(Number);
    let ageCalc = today.getFullYear() - y;
    const monthDiff = today.getMonth() - (m - 1);
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
      ageCalc--;
    }
    setQuickAge(ageCalc >= 0 ? String(ageCalc) : '');
  }, [quickDob]);

  // Post-Consultation Fee Collection Queue (Requirement 6 & 7)
  const pendingFeeAppointments = useMemo(() => {
    return appointments.filter(
      (a) =>
        (a.status === 'Consultation Completed' || a.consultation_completed) &&
        a.payment_status !== 'Paid'
    );
  }, [appointments]);

  const handleOpenFeeModal = (appt: Appointment) => {
    setTargetApptForPayment(appt);
    const isIpd = Boolean(
      appt.service_category === 'IPD Surgical & ICU' ||
      appt.ipd_package_name ||
      (appt.appointment_type && appt.appointment_type.includes('IPD'))
    );
    const matchedIpd = isIpd && appt.ipd_package_name
      ? IPD_PACKAGES.find((p) => p.title.toLowerCase().includes(appt.ipd_package_name!.toLowerCase()))
      : null;
    const initialFee = appt.fee_amount || (isIpd ? (matchedIpd?.fee || 175000) : OPD_CONSULTATION_FEE);
    setFeeAmountInput(initialFee);

    const pat = patients.find((p) => p.uhid === appt.patient_uhid || p.full_name === appt.patient_name);
    if (pat) {
      if (pat.height_cm) setFeeHeight(String(pat.height_cm));
      if (pat.weight_kg) setFeeWeight(String(pat.weight_kg));
      if (pat.bp_systolic) setFeeBpSystolic(String(pat.bp_systolic));
      if (pat.bp_diastolic) setFeeBpDiastolic(String(pat.bp_diastolic));
      if (pat.pulse) setFeePulse(String(pat.pulse));
      if (pat.temperature) setFeeTemp(pat.temperature);
      if (pat.spo2) setFeeSpo2(pat.spo2);
      if (pat.blood_group) setFeeBloodGroup(pat.blood_group);
      if (pat.allergies) setFeeAllergies(pat.allergies);
      if (pat.medical_history) setFeeMedicalHistory(pat.medical_history);
    }
    setFeeLabAmount(0);
    setIssuedMedicineQtys({});
    setIsFeeModalOpen(true);
  };

  // Latest digital prescription for the patient being billed
  const targetPrescription = useMemo(() => {
    if (!targetApptForPayment) return undefined;
    return prescriptions
      .filter(
        (rx) =>
          rx.patient_uhid?.toUpperCase() === targetApptForPayment.patient_uhid?.toUpperCase() ||
          rx.patient_id === targetApptForPayment.patient_id
      )
      .sort((a, b) => b.id - a.id)[0];
  }, [prescriptions, targetApptForPayment]);

  // Prescribed drugs matched against hospital pharmacy formulary
  const formularyRows = useMemo(() => {
    if (!targetPrescription) return [];
    const norm = (s?: string) => (s || '').trim().toLowerCase();
    return targetPrescription.medicines.map((med) => {
      const name = norm(med.medicine_name);
      const match =
        medicines.find((m) => norm(m.medicine_name) === name || norm(m.generic_name) === name) ||
        medicines.find(
          (m) => (name.length >= 3 && norm(m.medicine_name).includes(name)) || (name.length >= 3 && norm(m.generic_name).includes(name))
        );
      return { med, match };
    });
  }, [targetPrescription, medicines]);

  // Pharmacy dispatch total from checked medicines
  const pharmacyTotal = formularyRows.reduce((sum, row, i) => {
    const qty = issuedMedicineQtys[i];
    if (!qty || !row.match || qty <= 0) return sum;
    return sum + qty * row.match.unit_price;
  }, 0);

  // 5% Healthcare GST on the combined bill
  const isFeeModalIpd = Boolean(
    targetApptForPayment?.service_category === 'IPD Surgical & ICU' ||
    targetApptForPayment?.ipd_package_name ||
    (targetApptForPayment?.appointment_type && targetApptForPayment.appointment_type.includes('IPD'))
  );
  const feeNursingCharge = isFeeModalIpd ? 0 : 200; // Clinical Nursing, Registration & Sanitization (SAC 999319)
  const feeSubtotal = (Number(feeAmountInput) || 0) + feeNursingCharge + pharmacyTotal + feeLabAmount;
  const feeGst = Math.round(feeSubtotal * 0.05 * 100) / 100;
  const feeGrandTotal = feeSubtotal + feeGst;

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetApptForPayment) return;
    setIsProcessingPayment(true);

    try {
      const h = Number(feeHeight);
      const w = Number(feeWeight);
      const hM = h / 100;
      const computedBmi = hM > 0 && w > 0 ? Number((w / (hM * hM)).toFixed(1)) : undefined;
      const sys = Number(feeBpSystolic) || undefined;
      const dia = Number(feeBpDiastolic) || undefined;
      const feebpStr = sys && dia ? `${sys}/${dia} mmHg` : undefined;

      if (onCollectReceptionFee) {
        const pharmacyItems = formularyRows.flatMap((row, i) => {
          const qty = issuedMedicineQtys[i];
          if (!qty || !row.match || qty <= 0) return [];
          return [{
            medicineId: row.match.id,
            medicineName: row.med.medicine_name,
            quantity: qty,
            unitPrice: row.match.unit_price
          }];
        });

        await onCollectReceptionFee({
          appointmentId: targetApptForPayment.id,
          vitals: {
            height_cm: h || undefined,
            weight_kg: w || undefined,
            bmi: computedBmi,
            bp: feebpStr,
            bp_systolic: sys,
            bp_diastolic: dia,
            pulse: Number(feePulse) || undefined,
            temperature: feeTemp.trim() || undefined,
            spo2: feeSpo2.trim() || undefined,
            blood_group: feeBloodGroup,
            allergies: feeAllergies.trim() || undefined,
            medical_history: feeMedicalHistory.trim() || undefined
          },
          feeAmount: feeAmountInput,
          paymentMode: feePaymentMode,
          receptionistName: currentUser?.full_name || 'Front Desk Receptionist',
          pharmacyItems,
          labFee: feeLabAmount
        });
      }

      setIsFeeModalOpen(false);
      setTargetApptForPayment(null);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Filtered Appointments based on Role
  const relevantAppointments = useMemo(() => {
    if (role === 'DOCTOR') {
      const docId = currentUser?.doctor_id;
      const cleanDocName = currentUser?.full_name?.trim().toLowerCase();
      return appointments.filter(
        (a) =>
          (docId && a.doctor_id === docId) ||
          (cleanDocName && a.doctor_name && a.doctor_name.trim().toLowerCase() === cleanDocName)
      );
    }
    if (role === 'PATIENT') {
      const u = currentUser?.patient_uhid?.trim().toUpperCase();
      const pId = currentUser?.patient_id;
      return appointments.filter((a) => {
        const aptUhid = a.patient_uhid?.trim().toUpperCase();
        if (u && aptUhid && u === aptUhid) return true;
        if (pId && a.patient_id === pId) return true;
        return false;
      });
    }
    if (role === 'ADMIN' && adminSelectedDept !== 'All') {
      return appointments.filter((a) => a.department.toLowerCase() === adminSelectedDept.toLowerCase());
    }
    return appointments;
  }, [appointments, role, currentUser, adminSelectedDept]);

  // Strictly Isolated Invoices for Citizen Patient
  const patientInvoices = useMemo(() => {
    if (role !== 'PATIENT') return [];
    const u = currentUser?.patient_uhid?.trim().toUpperCase();
    const pId = currentUser?.patient_id;
    return invoices.filter((inv) => {
      const invUhid = inv.patient_uhid?.trim().toUpperCase();
      if (u && invUhid && u === invUhid) return true;
      if (pId && inv.patient_id === pId) return true;
      return false;
    });
  }, [invoices, role, currentUser]);

  // Strictly Isolated Prescriptions for Citizen Patient
  const patientPrescriptions = useMemo(() => {
    if (role !== 'PATIENT') return [];
    const u = currentUser?.patient_uhid?.trim().toUpperCase();
    const pId = currentUser?.patient_id;
    return prescriptions.filter((rx) => {
      const rxUhid = rx.patient_uhid?.trim().toUpperCase();
      if (u && rxUhid && u === rxUhid) return true;
      if (pId && rx.patient_id === pId) return true;
      return false;
    });
  }, [prescriptions, role, currentUser]);

  // Matched Patient Registry Record
  const currentPatientProfile = useMemo(() => {
    if (role !== 'PATIENT') return null;
    const u = currentUser?.patient_uhid?.trim().toUpperCase();
    const pId = currentUser?.patient_id;
    return (
      patients.find((p) => {
        if (u && p.uhid?.trim().toUpperCase() === u) return true;
        if (pId && p.id === pId) return true;
        return false;
      }) || null
    );
  }, [patients, role, currentUser]);

  // Doctor's Notifications
  const doctorNotifications = useMemo(() => {
    if (role === 'DOCTOR') {
      const docId = currentUser?.doctor_id;
      const cleanDocName = currentUser?.full_name?.trim().toLowerCase();
      return notifications.filter(
        (n) =>
          (docId && n.doctor_id === docId) ||
          (cleanDocName && n.doctor_name && n.doctor_name.trim().toLowerCase() === cleanDocName)
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
    if (!quickDob || !quickAge || Number(quickAge) <= 0 || !quickGender) {
      alert('Please select the patient date of birth and gender.');
      return;
    }

    if (onReceptionistRegister) {
      const isIpd = quickCategory === 'IPD Surgical & ICU';
      const matchedIpdObj = isIpd ? IPD_PACKAGES.find((p) => p.title === quickIpdPackage) : null;
      const finalFee = isIpd ? (matchedIpdObj?.fee || quickFeeAmount) : OPD_CONSULTATION_FEE;

      const res = await onReceptionistRegister({
        patientData: {
          full_name: quickName.trim(),
          phone: quickPhone.trim(),
          date_of_birth: quickDob,
          age: Number(quickAge),
          gender: quickGender,
          blood_group: quickBlood,
          department: quickDept,
          bp: quickBp.trim() ? `${quickBp.trim()} mmHg` : undefined,
          pulse: Number(quickPulse) || undefined,
          temperature: quickTemp.trim() || undefined,
          spo2: quickSpo2.trim() || undefined,
          allergies: quickAllergies.trim() || undefined,
          medical_history: 'Walk-in registration from Reception Station'
        },
        doctorId: Number(quickDocId),
        department: quickDept,
        appointmentType: isIpd ? `IPD - ${quickIpdPackage}` : 'Walk-in OPD Consultation',
        symptoms: quickSymptoms,
        serviceCategory: quickCategory,
        ipdPackageName: isIpd ? quickIpdPackage : undefined,
        feeAmount: finalFee,
        paymentMode: quickPaymentMode
      });

      if (!res.success) {
        setQuickDupAlert(res.error || 'Duplicate record detected.');
        return;
      }

      alert(`✅ Patient Registered Successfully!\nUHID: ${res.patient.uhid}\nToken: ${res.appointment.appointment_no}\nConsultation unlocked & Doctor notified.\nOPD fee (₹945 incl. ₹45 GST) will be collected at reception after the consultation is completed.`);
      setIsQuickRegOpen(false);
      setQuickName('');
      setQuickPhone('');
      setQuickDob('');
      setQuickAge('');
      setQuickBp('');
      setQuickPulse('');
      setQuickTemp('');
      setQuickSpo2('');
      setQuickAllergies('');
      setQuickSymptoms('');
      setQuickBlood('');
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

          {role === 'PATIENT' && (
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('appointments')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer"
              >
                <i className="fa-solid fa-calendar-check text-sm"></i>
                <span>My Appointments &amp; Tokens</span>
              </button>
              <button
                onClick={() => onNavigate('prescriptions')}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition border border-white/20 cursor-pointer"
              >
                <i className="fa-solid fa-prescription text-sm"></i>
                <span>My Prescriptions</span>
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

          {/* Post-Consultation Fee Collection Queue (Requirement 6 & 7) */}
          {pendingFeeAppointments.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                    <i className="fa-solid fa-receipt"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-950 text-base flex items-center gap-2">
                      <span>Post-Consultation Fee Collection Queue (₹700 + ₹200 Nursing + ₹45 Tax = ₹945)</span>
                      <span className="bg-emerald-200 text-emerald-900 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                        {pendingFeeAppointments.length} Ready for Billing
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Hospital Policy: Doctor consultation is completed. Front desk collects OPD consultation fee (₹700 + ₹200 Nursing + 5% GST = ₹945) and issues the printed receipt &amp; medical records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingFeeAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{apt.patient_name}</span>
                          <span className="text-[11px] font-mono text-slate-500">{apt.patient_uhid}</span>
                        </div>
                        <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                          {apt.appointment_no}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mt-2 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Doctor:</span>
                          <strong className="text-slate-800">{apt.doctor_name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Department:</span>
                          <span className="text-sky-800 font-semibold">{apt.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">OPD Fee + 5% GST:</span>
                          <strong className="text-emerald-800 font-mono text-sm">
                            {apt.fee_in_lakhs_text || '₹945 (₹700 + ₹200 Nursing + ₹45 GST)'}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Consultation:</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <i className="fa-solid fa-circle-check text-[10px]"></i> Completed by Doctor
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenFeeModal(apt)}
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <i className="fa-solid fa-file-invoice-dollar"></i>
                      <span>Collect ₹945 &amp; Generate Receipt</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                          {patObj && (patObj.bp || patObj.pulse) ? (
                            <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              BP: {patObj.bp || '—'} | Pls: {patObj.pulse || '—'}
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              Vitals pending manual intake
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {(() => {
                            const invTotal =
                              invoices.find(
                                (i) => i.appointment_id === apt.id || i.receipt_no === apt.receipt_no
                              )?.total_amount ||
                              invoices.find((i) => i.patient_uhid === apt.patient_uhid)?.total_amount ||
                              945;
                            const isPaid =
                              apt.status === 'Paid' ||
                              apt.status === 'Documents Ready' ||
                              apt.status === 'Receipt Generated' ||
                              apt.payment_status === 'Paid';
                            const cls = isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : apt.status === 'Confirmed' || apt.status === 'Appointment Confirmed'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : apt.status === 'Consultation Completed' || apt.status === 'Payment Pending'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : apt.status === 'Appointment Pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : apt.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600';
                            const label = isPaid
                              ? `Paid ₹${invTotal.toFixed(2)}`
                              : apt.status === 'Confirmed' || apt.status === 'Appointment Confirmed'
                              ? 'Waiting in OPD'
                              : apt.status === 'Consultation Completed' || apt.status === 'Payment Pending'
                              ? `Fee Pending (₹${invTotal.toFixed(2)})`
                              : apt.status;
                            return (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>
                                {isPaid && <i className="fa-solid fa-circle-check text-[9px]"></i>}
                                {label}
                              </span>
                            );
                          })()}
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
                      {(() => {
                        const matchingApt = appointments.find(
                          (a) => a.appointment_no === notif.token_no || a.patient_uhid === notif.patient_uhid
                        );
                        const isDone = matchingApt && (matchingApt.status === 'Consultation Completed' || matchingApt.consultation_completed);
                        if (isDone) {
                          return (
                            <span
                              title="Consultation completed & locked — cannot be examined again"
                              className="bg-purple-50 text-purple-800 border border-purple-300 px-3 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <i className="fa-solid fa-lock text-[10px]"></i>
                              {matchingApt.payment_status === 'Paid' && matchingApt.total_amount
                                ? `Completed • ₹${matchingApt.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Collected`
                                : 'Completed • Fee Pending'}
                            </span>
                          );
                        }
                        return (
                          <button
                            onClick={() => {
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
                        );
                      })()}
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
                    (p) =>
                      (apt.patient_uhid && p.uhid?.trim().toUpperCase() === apt.patient_uhid.trim().toUpperCase()) ||
                      (apt.patient_id && p.id === apt.patient_id)
                  );
                  const isFeePaid = apt.payment_status === 'Paid' || apt.payment_status === 'Paid (Collected by Receptionist)';
                  const isConsultCompleted = apt.status === 'Consultation Completed' || apt.consultation_completed;

                  const paidAmount = apt.fee_amount || (isFeePaid ? 700 : 0);
                  const totalPaid = apt.total_amount || (isFeePaid ? 945 : 0);

                  const isFullyCompleted = isConsultCompleted && isFeePaid;

                  if (isFullyCompleted) {
                    return (
                      <div
                        key={apt.id}
                        className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 shadow-2xs space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{apt.patient_name}</h4>
                              <span className="text-[11px] font-mono text-emerald-700 font-bold">
                                {apt.patient_uhid}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                              {apt.appointment_no}
                            </span>
                          </div>
                          <div className="mt-2 bg-emerald-100 border border-emerald-200 rounded-lg p-3 text-center">
                            <i className="fa-solid fa-circle-check text-emerald-600 text-lg block mb-1"></i>
                            <span className="text-xs font-bold text-emerald-900 block">
                              Amount collected from this patient: ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-medium">
                              {apt.payment_mode ? `Paid via ${apt.payment_mode}` : 'Fully Paid'} {apt.receipt_no ? `• Receipt: ${apt.receipt_no}` : ''} • Consultation & billing completed
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

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
                            {isConsultCompleted && !isFeePaid ? (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-800 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded font-bold w-fit">
                                <i className="fa-solid fa-circle-check text-purple-600 text-[9px]"></i>
                                <span>Consultation Completed — Fee Pending</span>
                              </div>
                            ) : isFeePaid ? (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold w-fit">
                                <i className="fa-solid fa-circle-check text-emerald-600 text-[9px]"></i>
                                <span>Fee Paid: {apt.fee_in_lakhs_text || `₹${paidAmount.toLocaleString('en-IN')}`}</span>
                              </div>
                            ) : (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-medium w-fit">
                                <i className="fa-solid fa-clock text-sky-600 text-[9px]"></i>
                                <span>OPD Fee: ₹700 + ₹200 Nursing + Tax (Payable Post-Consultation)</span>
                              </div>
                            )}
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
                            {patObj.bp || patObj.pulse || patObj.spo2 || patObj.blood_group ? (
                              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-800">
                                <div className="bg-slate-50 p-1 rounded border border-slate-200/60">
                                  BP: <strong>{patObj.bp || apt.bp || '—'}</strong>
                                </div>
                                <div className="bg-slate-50 p-1 rounded border border-slate-200/60">
                                  Pulse: <strong>{patObj.pulse || apt.pulse ? `${patObj.pulse || apt.pulse} bpm` : '—'}</strong>
                                </div>
                                <div className="bg-slate-50 p-1 rounded border border-slate-200/60">
                                  SpO2: <strong className="text-emerald-700">{patObj.spo2 || apt.spo2 || '—'}</strong>
                                </div>
                                <div className="bg-slate-50 p-1 rounded border border-slate-200/60">
                                  Blood: <strong className="text-rose-700">{patObj.blood_group || '—'}</strong>
                                </div>
                              </div>
                            ) : (
                              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 font-mono">
                                Vitals pending manual intake at the Front Desk
                              </div>
                            )}
                            {patObj.allergies && (
                              <div className="mt-1.5 text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-bold">
                                Allergy Alert: {patObj.allergies}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Button - Only show for non-completed consultations */}
                      {!isConsultCompleted && (
                        <button
                          onClick={() => {
                            if (onExaminePatient) {
                              onExaminePatient(apt);
                            } else {
                              onNavigate('consultations');
                            }
                          }}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs mt-2"
                        >
                          <i className="fa-solid fa-stethoscope"></i>
                          <span>Examine & Write Prescription</span>
                        </button>
                      )}
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

      {/* ========================================================================= */}
      {/* 4. CITIZEN PATIENT DASHBOARD SPECIFIC VIEW                                */}
      {/* ========================================================================= */}
      {role === 'PATIENT' && (
        <div className="space-y-6">
          {/* Patient Isolation Banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                <i className="fa-solid fa-shield-heart"></i>
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                  <span>Verified Citizen Health Profile</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                </div>
                <div className="text-xs text-emerald-800 font-medium">
                  Isolated EHR Portal for <strong className="text-emerald-950">{currentUser?.full_name}</strong> | UHID:{' '}
                  <span className="font-mono font-bold text-emerald-950">{currentUser?.patient_uhid}</span> | Phone:{' '}
                  <span className="font-mono text-emerald-950">{currentUser?.phone}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <i className="fa-solid fa-calendar-check"></i> My Appointments
            </button>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                My OPD Appointments
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {relevantAppointments.length}
              </div>
              <span className="text-xs text-emerald-600 font-medium">Verified tokens</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Digital Prescriptions
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {patientPrescriptions.length}
              </div>
              <span className="text-xs text-sky-600 font-medium">Issued by Doctors</span>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Amount Paid
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono text-emerald-700">
                ₹{patientInvoices.filter(i => i.payment_status === 'Paid').reduce((s, i) => s + i.total_amount, 0).toLocaleString('en-IN')}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {patientInvoices.length} receipt{patientInvoices.length === 1 ? '' : 's'} on file
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Blood Group &amp; BP
              </span>
              <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                {currentPatientProfile?.blood_group || 'Not recorded'} • {currentPatientProfile?.bp || 'Not recorded'}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                BMI: {currentPatientProfile?.bmi || 'Not recorded'}
              </span>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => onNavigate('appointments')}
              className="bg-white hover:border-emerald-500 border border-slate-200/80 p-5 rounded-2xl shadow-xs transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-3 group-hover:scale-105 transition">
                <i className="fa-solid fa-ticket"></i>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">My Appointments &amp; Tokens</h3>
              <p className="text-xs text-slate-500 mt-1">
                View doctor, confirmed date/time slot, and download OPD tokens.
              </p>
            </div>

            <div
              onClick={() => onNavigate('prescriptions')}
              className="bg-white hover:border-sky-500 border border-slate-200/80 p-5 rounded-2xl shadow-xs transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg mb-3 group-hover:scale-105 transition">
                <i className="fa-solid fa-file-prescription"></i>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Doctor Prescriptions</h3>
              <p className="text-xs text-slate-500 mt-1">
                View your medications, dosage timings, food instructions, and doctor remarks.
              </p>
            </div>

            <div
              onClick={() => onNavigate('appointments')}
              className="bg-white hover:border-purple-500 border border-slate-200/80 p-5 rounded-2xl shadow-xs transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg mb-3 group-hover:scale-105 transition">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Book Consultation</h3>
              <p className="text-xs text-slate-500 mt-1">
                Schedule an in-clinic consultation with top hospital specialists.
              </p>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-base">My Registered Appointments &amp; OPD Tokens</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Only displaying tokens linked to your verified UHID: <span className="font-mono font-bold text-slate-700">{currentUser?.patient_uhid}</span>
                </p>
              </div>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
              >
                View All Appointments <i className="fa-solid fa-arrow-right text-[10px] ml-1"></i>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Token No</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Consulting Doctor</th>
                    <th className="p-3">Date &amp; Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {relevantAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No appointments currently scheduled for {currentUser?.full_name}. Click "Book Slot" to schedule one.
                      </td>
                    </tr>
                  ) : (
                    relevantAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-mono font-bold text-emerald-800">{apt.appointment_no}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold text-[10px]">
                            {apt.department}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-800">{apt.doctor_name}</td>
                        <td className="p-3 text-slate-600">{apt.appointment_date} {apt.appointment_time}</td>
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
                            onClick={() => setTokenViewAppt(apt)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded font-bold transition cursor-pointer"
                          >
                            <i className="fa-solid fa-ticket text-[10px] mr-1"></i> View Token
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
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
                  <label className="block text-slate-700 font-bold mb-1">Date of Birth *</label>
                  <DatePickerCalendar
                    value={quickDob}
                    onChange={(date) => setQuickDob(date)}
                    placeholder="Select date of birth"
                    maxDate={new Date().toISOString().split('T')[0]}
                  />
                  {quickAge && (
                    <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                      <i className="fa-regular fa-calendar-check text-amber-500"></i>
                      Age: <span className="font-bold text-slate-700">{quickAge} years</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gender</label>
                  <select
                    required
                    value={quickGender}
                    onChange={(e) => setQuickGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="" disabled>Select gender</option>
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
                      onChange={(e) => setQuickPulse(e.target.value)}
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
      {/* Biological Intake & Fee Collection Modal */}
      {isFeeModalOpen && targetApptForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#004b91] text-white p-5 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                    {targetApptForPayment.appointment_no}
                  </span>
                  <h3 className="font-bold text-base">Post-Consultation Details Intake &amp; Fee Collection</h3>
                </div>
                <p className="text-xs text-sky-200 mt-0.5">
                  Patient: {targetApptForPayment.patient_name} • Doctor: {targetApptForPayment.doctor_name} ({targetApptForPayment.department})
                </p>
              </div>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleFeeSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-emerald-900 text-[11px] leading-relaxed">
                <strong>Post-Consultation Settlement:</strong> The doctor has already completed the consultation for this patient. The OPD fee ({targetApptForPayment.fee_in_lakhs_text || '₹700 for OPD'} + ₹200 Clinical Nursing + ₹45 GST = ₹945) is now payable at the Reception desk. Once collected, the receipts and medical records are unlocked for printing.
              </div>

              {/* Biological Intake Details */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  1. Biological Details &amp; Vitals Intake
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Height (cm)</label>
                    <input
                      type="number"
                      value={feeHeight}
                      onChange={(e) => setFeeHeight(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Weight (kg)</label>
                    <input
                      type="number"
                      value={feeWeight}
                      onChange={(e) => setFeeWeight(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">BP Systolic</label>
                    <input
                      type="number"
                      value={feeBpSystolic}
                      onChange={(e) => setFeeBpSystolic(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">BP Diastolic</label>
                    <input
                      type="number"
                      value={feeBpDiastolic}
                      onChange={(e) => setFeeBpDiastolic(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={feePulse}
                      onChange={(e) => setFeePulse(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Body Temp</label>
                    <input
                      type="text"
                      value={feeTemp}
                      onChange={(e) => setFeeTemp(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">SpO2 Oxygen</label>
                    <input
                      type="text"
                      value={feeSpo2}
                      onChange={(e) => setFeeSpo2(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-emerald-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Blood Group</label>
                    <select
                      value={feeBloodGroup}
                      onChange={(e) => setFeeBloodGroup(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-rose-600"
                    >
                      <option value="" disabled>Select blood group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Drug Allergies</label>
                    <input
                      type="text"
                      value={feeAllergies}
                      onChange={(e) => setFeeAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Sulfa, or NKDA"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Medical History / Reason</label>
                    <input
                      type="text"
                      value={feeMedicalHistory}
                      onChange={(e) => setFeeMedicalHistory(e.target.value)}
                      placeholder="e.g. Hypertension, Diabetes, Fever"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory Consultation Fee Collection */}
              <div className="space-y-3 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                  2. Mandatory Consultation Fee Collection
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Fee Amount to Collect (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        value={feeAmountInput}
                        onChange={(e) => setFeeAmountInput(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Standard OPD Fee: ₹700 + ₹200 Nursing | IPD Packages: As per selected tier
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Payment Collection Method
                    </label>
                    <select
                      value={feePaymentMode}
                      onChange={(e) => setFeePaymentMode(e.target.value as any)}
                      className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-bold text-slate-800 text-xs"
                    >
                      <option value="Cash">Cash at Counter</option>
                      <option value="UPI">UPI / QR Code Scan</option>
                      <option value="Card">Debit / Credit Card (POS)</option>
                      <option value="Insurance / TPA">Cashless TPA / Insurance Pre-auth</option>
                    </select>
                    <span className="text-[10px] text-emerald-700 mt-1 block">
                      Issues 5% GST receipt &amp; unblocks doctor consultation
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Pharmacy Dispatch & Lab Services (Optional add-ons) */}
              <div className="space-y-3 bg-sky-50/70 p-4 rounded-xl border border-sky-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 block">
                  3. Pharmacy Dispatch &amp; Lab Services (Optional add-ons)
                </span>

                {targetPrescription && formularyRows.length > 0 ? (
                  <div className="bg-white border border-sky-100 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {formularyRows.map((row, i) => {
                  const qty = issuedMedicineQtys[i];
                  const checked = Boolean(qty);
                  const noInventory = !row.match || !row.match.stock_quantity || row.match.stock_quantity <= 0;
                  return (
                    <div key={i} className="p-2.5 flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = { ...issuedMedicineQtys };
                          if (e.target.checked) {
                            next[i] = Math.max(1, row.med.quantity || 1);
                          } else {
                            delete next[i];
                          }
                          setIssuedMedicineQtys(next);
                        }}
                        className="w-4 h-4 accent-sky-600 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-xs truncate">
                          {row.med.medicine_name}
                          {row.med.dosage ? ` - ${row.med.dosage}` : ''}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {[row.med.frequency, row.med.duration].filter(Boolean).join(' • ')}
                          {row.match
                            ? ` • Stock: ${row.match.stock_quantity}${row.match.stock_quantity === 0 ? ' (OUT OF STOCK - no charge)' : ''}`
                            : ' • Not in hospital inventory (recorded, no charge)'}
                        </div>
                      </div>
                      {row.match && row.match.stock_quantity > 0 && (
                        <>
                          <div className="text-[10px] font-bold text-slate-500 shrink-0">MRP ₹{row.match.unit_price}/unit</div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-slate-400">Qty</span>
                            <input
                              type="number"
                              min={1}
                              max={row.match.stock_quantity}
                              value={qty || ''}
                              disabled={!checked}
                              onChange={(e) =>
                                setIssuedMedicineQtys({ ...issuedMedicineQtys, [i]: Math.max(1, Math.min(Number(e.target.value), row.match!.stock_quantity)) })
                              }
                              className="w-14 p-1 bg-slate-50 border border-slate-200 rounded text-center font-mono text-xs disabled:opacity-50"
                            />
                          </div>
                        </>
                      )}
                      {(!row.match || !row.match.stock_quantity || row.match.stock_quantity <= 0) && checked && (
                        <div className="text-[10px] font-bold text-slate-500 shrink-0">Qty: {qty}</div>
                      )}
                    </div>
                  );
                })}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    No prior digital prescription found for this patient. The doctor must prescribe medicines during the
                    consultation to enable pharmacy dispatch here.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">
                      Pathology Lab / Diagnostics Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={feeLabAmount}
                      onChange={(e) => setFeeLabAmount(Math.max(0, Number(e.target.value)))}
                      placeholder="0"
                      className="w-full p-2 bg-white border border-sky-200 rounded-lg font-mono font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Enter charges if the patient took lab tests / diagnostic imaging at the hospital.
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1 text-xs self-start">
                    <div className="flex justify-between text-slate-600">
                      <span>Consultation</span>
                      <span>₹{(Number(feeAmountInput) || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Clinical Nursing, Registration &amp; Sanitization</span>
                      <span>₹{feeNursingCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Pharmacy</span>
                      <span>₹{pharmacyTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Lab / Diagnostics</span>
                      <span>₹{feeLabAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>5% GST</span>
                      <span>₹{feeGst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                      <span>Grand Total</span>
                      <span>₹{feeGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <i className="fa-solid fa-circle-check"></i>
                  <span>{isProcessingPayment ? 'Processing...' : `Collect ₹${feeGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} & Issue GST Receipt`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Official Token Pass Modal */}
      {role === 'PATIENT' && tokenViewAppt && (
        <AppointmentTokenModal
          isOpen={true}
          onClose={() => setTokenViewAppt(null)}
          appointment={tokenViewAppt}
          patient={patients.find(
            (p) => p.uhid === tokenViewAppt.patient_uhid || p.id === tokenViewAppt.patient_id
          )}
          doctor={doctors.find(
            (d) => d.id === tokenViewAppt.doctor_id || d.full_name === tokenViewAppt.doctor_name
          )}
        />
      )}
    </div>
  );
};
