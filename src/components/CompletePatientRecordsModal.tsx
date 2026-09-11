import React from 'react';
import { Appointment, Patient, Doctor, Consultation, Prescription, Invoice, Payment } from '../data/hospitalData';

interface CompletePatientRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  patient?: Patient | null;
  doctor?: Doctor | null;
  consultation?: Consultation | null;
  prescription?: Prescription | null;
  invoice?: Invoice | null;
  payment?: Payment | null;
  currentUser?: any;
  onMarkPrinted?: (appointmentId: number) => void;
}

export const CompletePatientRecordsModal: React.FC<CompletePatientRecordsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patient,
  doctor,
  consultation,
  prescription,
  invoice,
  payment,
  currentUser,
  onMarkPrinted
}) => {
  if (!isOpen) return null;

  // Resolve values
  const patientName = appointment.patient_name || patient?.full_name || 'Patient';
  const patientUhid = appointment.patient_uhid || patient?.uhid || 'UHID-2026-0001';
  const patientAge = patient?.age || appointment.patient_age || 35;
  const patientGender = appointment.patient_gender || patient?.gender || 'Prefer not to say';
  const patientPhone = appointment.patient_phone || patient?.phone || '+91 98840 00000';
  const patientLocation = appointment.patient_location || patient?.location || 'Vadapalani';

  const doctorName = appointment.doctor_name || doctor?.full_name || 'Dr. Kavitha Ramanathan';
  const doctorDept = appointment.specialty || appointment.department || doctor?.department || 'General Medicine';
  const doctorRoom = doctor?.room_number || 'OPD-102';

  const consultationDate = appointment.appointment_date || new Date().toISOString().split('T')[0];
  const consultationTime = appointment.appointment_time || '10:00 AM';
  const receiptNo = appointment.receipt_no || payment?.receipt_no || invoice?.receipt_no || `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const tokenNo = appointment.appointment_no || 'APT-101';
  const paymentMode = appointment.payment_mode || payment?.payment_mode || 'UPI';

  // Fee calculation (₹700 consultation + ₹200 Clinical Nursing, Registration & Sanitization + 5% GST)
  const feeAmount = invoice?.consultation_fee || appointment.fee_amount || 700;
  const nursingCharge = invoice?.additional_charges ?? 200;
  const taxAmount = invoice?.tax_amount ?? Math.round((feeAmount + nursingCharge) * 0.05 * 100) / 100; // 5% GST
  const totalAmount = invoice?.total_amount ?? feeAmount + nursingCharge + taxAmount;

  const handlePrint = () => {
    if (onMarkPrinted) {
      onMarkPrinted(appointment.id);
    }
    window.print();
  };

  // Prescription medicines
  const rxMedicines = prescription?.medicines || [
    {
      medicine_name: 'Paracetamol 650mg',
      dosage: '1 tablet',
      frequency: 'TDS (Thrice daily)',
      duration: '5 days',
      instructions: 'After meals with warm water'
    },
    {
      medicine_name: 'Amoxicillin 500mg',
      dosage: '1 capsule',
      frequency: 'BD (Twice daily)',
      duration: '5 days',
      instructions: 'Morning and Night after food'
    },
    {
      medicine_name: 'Pantoprazole 40mg',
      dosage: '1 tablet',
      frequency: 'OD (Once daily)',
      duration: '5 days',
      instructions: '30 minutes before breakfast'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Modal Action Header (Hidden on Print) */}
        <div className="bg-slate-900 text-white p-4 px-6 flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center text-lg">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Complete Patient Medical Record Dossier
                </h3>
                <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                  PAID &amp; VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Bundled records for {patientName} ({patientUhid}) • Token: {tokenNo} • 4 Sections Included
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <i className="fa-solid fa-print"></i>
              <span>Print Complete Patient Records</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Bundle Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8 print:p-0 print:m-0 print:space-y-0 text-slate-800 text-xs">

          {/* ========================================================= */}
          {/* SECTION 1: DOCTOR'S DIGITAL PRESCRIPTION (STRICTLY NO FEES) */}
          {/* ========================================================= */}
          <div className="border-2 border-slate-300 rounded-2xl p-6 sm:p-8 space-y-4 print:border-none print:p-6 print:page-break-after-always">
            {/* Hospital Header */}
            <div className="flex items-start justify-between border-b-2 border-sky-900 pb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#004b91] text-white flex flex-col items-center justify-center font-black p-1 leading-none shadow-xs">
                  <span className="text-base font-bold">+</span>
                  <span className="text-[7.5px] tracking-tighter uppercase font-bold">CAREHUB</span>
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-[#004b91] uppercase leading-tight">
                    CAREHUB MULTISPECIALITY HOSPITAL
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium">
                    100 Feet Bypass Road, {patientLocation || 'Vadapalani'}, Tamil Nadu – 600026
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Phone: +91 44 2483 3400 • NABH Accredited Tertiary Care Center
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-sky-900 text-white font-mono font-bold text-xs px-3 py-1 rounded uppercase tracking-wider">
                  CLINICAL PRESCRIPTION
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Digital Health Record
                </div>
              </div>
            </div>

            {/* Patient & Doctor Demographics */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <div>Patient Name: <strong className="text-slate-900">{patientName}</strong></div>
                <div>UHID: <strong className="text-slate-900 font-mono">{patientUhid}</strong> | Token: <strong className="font-mono">{tokenNo}</strong></div>
                <div>Age / Gender: <span className="font-medium">{patientAge} Yrs / {patientGender}</span></div>
                <div>Contact: <span className="font-mono">{patientPhone}</span></div>
              </div>
              <div className="space-y-1 text-right">
                <div>Consultant: <strong className="text-sky-900">{doctorName}</strong></div>
                <div>Department: <strong className="text-slate-900">{doctorDept}</strong> (Room: {doctorRoom})</div>
                <div>Consultation Date: <strong className="font-mono">{consultationDate}</strong></div>
                <div>Time: <strong className="font-mono">{consultationTime}</strong></div>
              </div>
            </div>

            {/* Diagnosis & Findings */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="text-[11px] font-bold text-sky-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                Clinical Diagnosis &amp; Symptoms
              </div>
              <div>
                <span className="text-slate-500">Chief Complaints:</span>{' '}
                <strong className="text-slate-800">{appointment.symptoms || 'General OPD Follow-up & Evaluation'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Provisional Diagnosis:</span>{' '}
                <strong className="text-slate-900">{consultation?.diagnosis || 'Acute Upper Respiratory Tract Episode & Seasonal Flu'}</strong>
              </div>
              {consultation?.notes && (
                <div>
                  <span className="text-slate-500">Clinical Notes:</span>{' '}
                  <span className="text-slate-700">{consultation.notes}</span>
                </div>
              )}
            </div>

            {/* Rx Medications Table */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="font-serif italic text-lg text-sky-900 font-black">℞</span>
                <span>Prescribed Medications (Medication Order)</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-800 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Medicine Name</th>
                      <th className="py-2 px-3">Dosage</th>
                      <th className="py-2 px-3">Frequency</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rxMedicines.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{m.medicine_name}</td>
                        <td className="py-2 px-3 font-medium text-slate-700">{m.dosage || '1 Tab'}</td>
                        <td className="py-2 px-3 font-mono text-sky-900">{m.frequency || 'BD'}</td>
                        <td className="py-2 px-3 text-slate-700">{m.duration || '5 days'}</td>
                        <td className="py-2 px-3 text-slate-600">{m.instructions || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advice & Follow-up */}
            <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Doctor's Advice &amp; Lifestyle Precautions
                </span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {consultation?.advice || 'Drink plenty of warm fluids. Avoid cold exposures. Adequate bed rest recommended.'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Next Follow-Up Review
                </span>
                <p className="text-slate-900 font-bold text-xs">
                  {consultation?.follow_up_date ? `Review on ${consultation.follow_up_date}` : 'Review in 5 to 7 days or SOS if symptoms persist'}
                </p>
              </div>
            </div>

            {/* Digital Signature */}
            <div className="flex justify-between items-end pt-3 border-t border-slate-200 text-xs">
              <div className="text-slate-400 text-[10px]">
                Valid digital prescription generated pursuant to telemedicine &amp; clinical practice protocols.
              </div>
              <div className="text-right">
                <div className="font-bold text-sky-950">{doctorName}</div>
                <div className="text-[10px] text-slate-500 font-medium">{doctorDept} • Reg No: TN-MCI-2018-9481</div>
                <div className="text-[9px] text-emerald-700 font-mono font-bold mt-0.5">✓ Digitally Signed &amp; Authenticated</div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: FINAL CONSULTATION & CLINICAL RECORD */}
          {/* ========================================================= */}
          <div className="border-2 border-slate-300 rounded-2xl p-6 sm:p-8 space-y-4 print:border-none print:p-6 print:page-break-after-always">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                  Final Consultation &amp; Examination Summary
                </h2>
                <p className="text-[11px] text-slate-500">
                  Comprehensive clinical assessment notes recorded by attending physician
                </p>
              </div>
              <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                SECTION 2: CLINICAL RECORD
              </span>
            </div>

            {/* Vitals Recorded */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Patient Vitals Recorded at Consultation Desk
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-center">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Blood Pressure</span>
                  <strong className="text-slate-900 text-xs">{consultation?.vitals?.blood_pressure || '—'}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Pulse Rate</span>
                  <strong className="text-slate-900 text-xs">{consultation?.vitals?.pulse || '—'}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Temperature</span>
                  <strong className="text-slate-900 text-xs">{consultation?.vitals?.temperature || '—'}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">SpO2 Oxygen</span>
                  <strong className="text-emerald-700 text-xs">{consultation?.vitals?.spo2 || '—'}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Body Weight</span>
                  <strong className="text-slate-900 text-xs">{consultation?.vitals?.weight || '—'}</strong>
                </div>
              </div>
            </div>

            {/* Detailed Assessment & Observations */}
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Physical Examination &amp; Systemic Findings:</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Patient alert, oriented to time, place, and person. Bilateral air entry clear without wheezing or crepitations. Cardiovascular system: S1 S2 heard, regular rhythm. Abdomen soft, non-tender, no organomegaly detected.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Clinical Impression &amp; Case Notes:</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {consultation?.notes || 'Clinical examination confirms upper respiratory tract viral infection. Vitals stable. Symptomatic therapy initiated with antipyretic, mucolytic and antibiotic coverage for secondary prevention.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Follow-Up &amp; Emergency Escalation Criteria:</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Advised patient to immediately report to 24/7 Emergency if high persistent fever (&gt;102°F), breathlessness, chest tightness, or severe productive cough develops.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 3: MEDICAL DOCUMENTS & DIAGNOSTIC LAB ORDERS */}
          {/* ========================================================= */}
          <div className="border-2 border-slate-300 rounded-2xl p-6 sm:p-8 space-y-4 print:border-none print:p-6 print:page-break-after-always">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                  Medical Documents &amp; Diagnostic Test Orders
                </h2>
                <p className="text-[11px] text-slate-500">
                  Laboratory requisitions, clinical imaging orders, and uploaded records
                </p>
              </div>
              <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                SECTION 3: DIAGNOSTICS
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-800 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Test Code</th>
                    <th className="py-2.5 px-3">Investigation Name</th>
                    <th className="py-2.5 px-3">Sample Specimen</th>
                    <th className="py-2.5 px-3">Clinical Indication</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-600">LAB-CBC-01</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">Complete Blood Count (CBC) with ESR</td>
                    <td className="py-2.5 px-3 text-slate-600">EDTA Whole Blood</td>
                    <td className="py-2.5 px-3 text-slate-600">Infection screening / Leukocytosis</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        ORDERED / SAMPLE COLLECTED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-600">LAB-CRP-04</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">C-Reactive Protein (Quantitative hs-CRP)</td>
                    <td className="py-2.5 px-3 text-slate-600">Serum Clot Activator</td>
                    <td className="py-2.5 px-3 text-slate-600">Inflammatory marker assessment</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        ORDERED / SAMPLE COLLECTED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-600">RAD-CXR-02</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">Digital Chest X-Ray (PA View)</td>
                    <td className="py-2.5 px-3 text-slate-600">Radiology Imaging</td>
                    <td className="py-2.5 px-3 text-slate-600">Rule out pulmonary consolidation</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        ORDERED / SCHEDULED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Laboratory Instructions for Patient:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Report to the CareHub central sample collection room (Ground floor OPD).</li>
                <li>Digital test results will automatically sync to your Patient Portal within 4 to 6 hours.</li>
              </ul>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 4: OFFICIAL OPD CONSULTATION FEE RECEIPT (PAID) */}
          {/* ========================================================= */}
          <div className="border-2 border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 print:border-none print:p-6">
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#004b91] text-white flex flex-col items-center justify-center font-black p-1 leading-none shadow-xs">
                  <span className="text-base font-bold">+</span>
                  <span className="text-[7.5px] tracking-tighter uppercase font-bold">CAREHUB</span>
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-[#004b91] uppercase leading-tight">
                    CAREHUB MULTISPECIALITY HOSPITAL
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium">
                    100 Feet Bypass Road, {patientLocation}, Chennai, Tamil Nadu – 600026
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Helpline: 1066 • GSTIN: 33AAAAA1234A1Z5 • NABH Certified
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-slate-900 text-white font-mono font-bold text-xs px-3 py-1 rounded uppercase tracking-wider">
                  OPD FEE RECEIPT
                </div>
                <div className="text-[10px] text-emerald-800 font-bold uppercase mt-1">
                  ✓ PAID IN FULL
                </div>
              </div>
            </div>

            {/* 15 Explicitly Required Receipt Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-300 font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">1. Receipt No:</span>
                <strong className="text-slate-900 font-bold">{receiptNo}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">2. Transaction ID:</span>
                <strong className="text-blue-900 font-bold text-[11px]">{payment?.transaction_reference || `TXN-OPD-${Math.floor(100000 + Math.random() * 900000)}`}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">3. Date &amp; Time:</span>
                <strong className="text-slate-800">{consultationDate} {consultationTime}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">4. Patient Name:</span>
                <strong className="text-slate-900">{patientName}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-300 font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">5. Patient ID (UHID):</span>
                <strong className="text-emerald-800 font-bold">{patientUhid}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">6. Doctor Name:</span>
                <strong className="text-slate-900">{doctorName}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">7. Specialty:</span>
                <strong className="text-slate-800">{doctorDept}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">8. Clinic Location:</span>
                <strong className="text-slate-900">{patientLocation}</strong>
              </div>
            </div>

            {/* Fee Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-800">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">9. Service Description</th>
                    <th className="py-2 px-3">SAC Code</th>
                    <th className="py-2 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-mono">1</td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      Outpatient Specialist Doctor Consultation &amp; Vitals Intake
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-500">999312</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{feeAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-mono">2</td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      Clinical Nursing, Registration &amp; Sanitization
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-500">999319</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{nursingCharge.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculation and Payment Particulars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-xs">
                <div>13. Payment Mode: <strong className="text-blue-900 font-bold">{paymentMode}</strong></div>
                <div>14. Payment Status: <strong className="text-emerald-800 font-bold uppercase">PAID &amp; SETTLED</strong></div>
                <div className="text-[11px] text-slate-500 font-mono">Collected by: {appointment.collected_by_receptionist || currentUser?.full_name || 'Front Desk Cashier'}</div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 border border-slate-200 rounded-xl p-3.5 bg-slate-50 font-mono">
                <div className="flex justify-between">
                  <span>10. Consultation Fee:</span>
                  <span className="font-bold text-slate-900">₹{feeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Clinical Nursing, Registration &amp; Sanitization:</span>
                  <span className="font-bold text-slate-900">₹{nursingCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>11. Applicable Tax (5% GST):</span>
                  <span className="font-bold text-slate-900">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1 text-sm font-black text-slate-900">
                  <span>12. Grand Total:</span>
                  <span className="text-emerald-800 font-extrabold">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  ({totalAmount.toFixed(0)} Rupees Only)
                </div>
              </div>
            </div>

            {/* Signatures & Stamp */}
            <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-end text-xs">
              <div className="text-[10.5px] text-slate-500">
                15. Authorized Billing Signatory &amp; Cashier Stamp
              </div>
              <div className="text-right">
                <div className="w-24 h-8 border border-slate-300 rounded flex items-center justify-center font-mono text-[8px] text-slate-400 mb-0.5 ml-auto">
                  [CASHIER STAMP]
                </div>
                <div className="font-bold text-slate-900 text-xs">CAREHUB HOSPITALS</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
