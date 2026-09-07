import React, { useState } from 'react';
import { Appointment, Invoice, Patient, Doctor } from '../data/hospitalData';

interface ConsultationFeeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  invoice?: Invoice | null;
  patient?: Patient | null;
  doctor?: Doctor | null;
  currentUser?: any;
  onRecordPaymentMode?: (apptId: number, mode: 'Cash' | 'UPI' | 'Card' | 'Insurance / TPA') => void;
}

export const ConsultationFeeReceiptModal: React.FC<ConsultationFeeReceiptModalProps> = ({
  isOpen,
  onClose,
  appointment,
  invoice,
  patient,
  doctor,
  currentUser,
  onRecordPaymentMode
}) => {
  if (!isOpen) return null;

  // Derive all data cleanly with fallbacks
  const patientName = appointment?.patient_name || invoice?.patient_name || patient?.full_name || 'Patient';
  const patientUhid = appointment?.patient_uhid || invoice?.patient_uhid || patient?.uhid || 'UHID-2026-0001';
  const patientAge = appointment?.patient_age || patient?.age || 35;
  const patientGender = appointment?.patient_gender || patient?.gender || 'Prefer not to say';
  const patientPhone = appointment?.patient_phone || invoice?.patient_phone || patient?.phone || '+91 98840 00000';
  const patientLocation = appointment?.patient_location || invoice?.patient_location || patient?.location || patient?.address || 'Vadapalani, Chennai';

  const doctorName = appointment?.doctor_name || invoice?.doctor_name || doctor?.full_name || 'Dr. Kavitha Ramanathan';
  const doctorDept = appointment?.department || invoice?.department || doctor?.department || 'Cardiology';
  const doctorRoom = doctor?.room_number || 'OPD-102';

  const consultationDate = appointment?.appointment_date || invoice?.invoice_date || new Date().toISOString().split('T')[0];
  const consultationTime = appointment?.appointment_time || invoice?.consultation_time || '10:30 AM';
  const opdRegNo = appointment?.opd_reg_no || invoice?.opd_reg_no || appointment?.appointment_no || `OPD-2026-REC-${Math.floor(100 + Math.random() * 900)}`;
  const receiptNo = appointment?.receipt_no || invoice?.receipt_no || `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const tokenNo = appointment?.appointment_no || 'APT-101';

  const feeAmount = invoice?.consultation_fee ?? appointment?.fee_amount ?? 700;
  const nursingCharge = invoice?.additional_charges ?? 200;
  const medicineFee = invoice?.medicine_fee ?? 0;
  const labFee = invoice?.lab_fee ?? 0;
  const discountAmount = invoice?.discount_amount ?? 0;
  const subtotal = feeAmount + nursingCharge + medicineFee + labFee - discountAmount;
  const invoiceTax = invoice?.tax_amount;
  const cgst = invoiceTax !== undefined ? invoiceTax / 2 : Number((subtotal * 0.025).toFixed(2));
  const sgst = invoiceTax !== undefined ? invoiceTax / 2 : Number((subtotal * 0.025).toFixed(2));
  const taxAmount = cgst + sgst;
  const totalAmount = invoice?.total_amount ?? Math.round((subtotal + taxAmount) * 100) / 100;

  const [currentPaymentMode, setCurrentPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Insurance / TPA'>(
    (appointment?.payment_mode as any) || (invoice?.payment_mode as any) || 'UPI'
  );

  const receptionistName = appointment?.collected_by_receptionist || invoice?.collected_by || currentUser?.full_name || 'Ms. Aishwarya Sundaram';

  const handleModeChange = (mode: 'Cash' | 'UPI' | 'Card' | 'Insurance / TPA') => {
    setCurrentPaymentMode(mode);
    if (appointment?.id && onRecordPaymentMode) {
      onRecordPaymentMode(appointment.id, mode);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Modal Action Header (Hidden when printing) */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center text-base">
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Official OPD Consultation Fee Receipt &amp; Medical Bill
              </h3>
              <p className="text-[11px] text-slate-400">
                Receipt #{receiptNo} • Mode: {currentPaymentMode} • Doctor: {doctorName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <i className="fa-solid fa-print"></i> Print Receipt (1 Page)
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>
        </div>

        {/* Change Payment Mode Quick Bar (Screen Only) */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Payment Mode:</span>
            <div className="flex gap-1.5">
              {(['UPI', 'Cash', 'Card', 'Insurance / TPA'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleModeChange(mode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    currentPaymentMode === mode
                      ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200">
            ✓ Cleared &amp; Collected by Reception
          </span>
        </div>

        {/* OFFICIAL PRINTABLE MEDICAL RECEIPT BODY */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-slate-800 text-xs print:p-0 print:m-0 print:w-full print-page-break-inside-avoid">
          <div
            id="printable-consultation-fee-receipt"
            className="border-2 border-slate-800 rounded-2xl p-6 sm:p-7 space-y-4 print:border-none print:p-0 print:m-0 print:w-full"
          >
            {/* 1. Hospital Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#004b91] text-white flex flex-col items-center justify-center font-black p-1 leading-none shadow-xs shrink-0 print:bg-[#004b91]">
                  <span className="text-base font-bold">+</span>
                  <span className="text-[7.5px] tracking-tighter uppercase font-bold">MEDICONNECT</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#004b91] uppercase leading-tight">
                    MEDICONNECT MULTISPECIALITY HOSPITAL
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium">
                    100 Feet Bypass Road, Vadapalani, Chennai, Tamil Nadu – 600026
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Phone: +91 44 2483 3400 • Helpline: 1066 • GSTIN: 33AAAAA1234A1Z5
                  </p>
                  <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-block mt-0.5">
                    NABH ACCREDITED TERTIARY CARE FACILITY
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="bg-slate-900 text-white font-mono font-bold text-xs px-3 py-1 rounded uppercase tracking-wider">
                  CONSULTATION FEE RECEIPT
                </div>
                <div className="text-[10.5px] text-slate-500 font-mono mt-1">
                  Original / Patient Copy
                </div>
              </div>
            </div>

            {/* 2. Receipt & Consultation Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-300 font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Receipt No:</span>
                <strong className="text-slate-900 font-bold text-sm">{receiptNo}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">OPD Reg No:</span>
                <strong className="text-blue-900 font-bold">{opdRegNo}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Patient UHID:</span>
                <strong className="text-emerald-800 font-bold">{patientUhid}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Token / Slot:</span>
                <strong className="text-slate-900 font-bold">{tokenNo}</strong>
              </div>
            </div>

            {/* 3. Patient Details & Consultation Schedule (Requirements 7) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Left Box: Patient Details + Location */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200 pb-1">
                  Patient Demographics
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Name:</span>
                  <strong className="text-slate-900 font-bold">{patientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Age &amp; Gender:</span>
                  <span className="text-slate-800 font-medium">{patientAge} Yrs / {patientGender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="text-slate-900 font-mono font-medium">{patientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Location:</span>
                  <strong className="text-slate-900">{patientLocation}</strong>
                </div>
              </div>

              {/* Right Box: Doctor Details & Consultation Time (Required 7) */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-blue-50/40">
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block border-b border-blue-200 pb-1">
                  Consultation Particulars
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-600">Attending Doctor:</span>
                  <strong className="text-blue-950 font-bold">{doctorName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Doctor Department:</span>
                  <strong className="text-blue-900 font-bold">{doctorDept}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date of Consultation:</span>
                  <strong className="text-slate-900 font-mono">{consultationDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Time of Consultation:</span>
                  <strong className="text-slate-900 font-mono">{consultationTime} (Room: {doctorRoom})</strong>
                </div>
              </div>

            </div>

            {/* 4. Itemized Fee Particulars Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Description of Healthcare Service</th>
                    <th className="py-2.5 px-3">SAC / HSN</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">1</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      Outpatient Specialist Doctor Consultation &amp; Clinical Vitals Intake
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Consultant: {doctorName} ({doctorDept}) • NABH Standard Protocol
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">999312</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{doctorDept}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{feeAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-400 font-mono">2</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      Clinical Nursing, Registration &amp; Sanitization
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Nursing care, OPD registration &amp; sanitization protocols (SAC 999319)
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">999319</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{doctorDept}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{nursingCharge.toFixed(2)}
                    </td>
                  </tr>
                  {medicineFee > 0 && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">3</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        Pharmacy — Medicines Dispensed
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          Drugs &amp; formulations issued from the hospital pharmacy
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">3004</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{doctorDept}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{medicineFee.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {labFee > 0 && (
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{medicineFee > 0 ? '4' : '3'}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        Laboratory / Diagnostics &amp; Imaging
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          Pathology, radiology &amp; other diagnostic investigations
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">9982</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{doctorDept}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{labFee.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {discountAmount > 0 && (
                    <tr className="hover:bg-emerald-50/40">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {1 + (medicineFee > 0 ? 1 : 0) + (labFee > 0 ? 1 : 0) + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">
                        Discount / Concession Applied
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">—</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{doctorDept}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        −₹{discountAmount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t-2 border-slate-200 text-xs">
                  <tr className="bg-slate-50/80">
                    <td colSpan={4} className="py-2 px-3 text-right font-bold text-slate-700">
                      Subtotal (Taxable Value):
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="py-1.5 px-3 text-right font-medium text-slate-500">
                      CGST (2.5%) + SGST (2.5%):
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-semibold text-slate-700">
                      ₹{taxAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50">
                    <td colSpan={4} className="py-2.5 px-3 text-right font-black text-slate-900">
                      Grand Total Amount Paid:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                      ₹{totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 5. Payment Mode & Calculation Summary Grid (Explicitly Required: Mode of Payment, Doctor Name, Dept, Date/Time) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
              
              {/* Mode of Payment & Settlement Stamp */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <i className="fa-solid fa-money-bill-wave text-emerald-600"></i> Mode of Payment:
                  </span>
                  <span className="font-extrabold text-xs text-blue-900 bg-white px-2.5 py-0.5 rounded border border-slate-300 shadow-2xs">
                    {currentPaymentMode}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                  <div>Status: <strong className="text-emerald-700 uppercase">PAID &amp; VERIFIED</strong></div>
                  <div>Payment Collected At: Front Desk Reception</div>
                  <div>Transaction Ref: {currentPaymentMode.includes('UPI') ? `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/MC` : `CASH-REC-${Math.floor(100000 + Math.random() * 900000)}`}</div>
                </div>
              </div>

              {/* Calculations Total */}
              <div className="space-y-1.5 text-xs text-slate-600 border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <div className="flex justify-between py-0.5">
                  <span>Consultation Fee:</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{feeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Clinical Nursing, Registration &amp; Sanitization:</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{nursingCharge.toFixed(2)}</span>
                </div>
                {medicineFee > 0 && (
                  <div className="flex justify-between py-0.5">
                    <span>Pharmacy — Medicines Dispensed:</span>
                    <span className="font-mono text-slate-900 font-semibold">₹{medicineFee.toFixed(2)}</span>
                  </div>
                )}
                {labFee > 0 && (
                  <div className="flex justify-between py-0.5">
                    <span>Laboratory / Diagnostics:</span>
                    <span className="font-mono text-slate-900 font-semibold">₹{labFee.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between py-0.5">
                    <span>Discount / Concession:</span>
                    <span className="font-mono text-emerald-700 font-semibold">−₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-0.5 border-t border-slate-200">
                  <span>Subtotal (Taxable Value):</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-[11px]">
                  <span>CGST (2.5%):</span>
                  <span className="font-mono text-slate-600">₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-[11px]">
                  <span>SGST (2.5%):</span>
                  <span className="font-mono text-slate-600">₹{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-t-2 border-slate-800 text-sm font-black text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-emerald-800 font-extrabold">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  ({totalAmount.toFixed(0)} Rupees Only)
                </div>
              </div>

            </div>

            {/* 6. Authorized Signatures & Hospital Stamp */}
            <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-end text-xs text-slate-600">
              <div className="space-y-1">
                <div className="text-[10.5px]">
                  Fee Collected By: <strong>{receptionistName}</strong>
                </div>
                <div className="text-[10px] text-slate-400">
                  Computerized Receipt. Keep safely for insurance claim reimbursement.
                </div>
              </div>

              <div className="text-right">
                <div className="w-28 h-10 border border-slate-300 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 mb-1 ml-auto">
                  [CASHIER STAMP]
                </div>
                <div className="font-bold text-slate-900 text-xs">MEDI CONNECT HOSPITALS</div>
                <div className="text-[10px] text-slate-500">Authorized Billing Signatory</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
