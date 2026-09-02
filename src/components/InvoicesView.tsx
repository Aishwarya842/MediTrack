import React, { useState } from 'react';
import { Invoice, Patient, Doctor } from '../data/hospitalData';

interface InvoicesViewProps {
  invoices: Invoice[];
  patients: Patient[];
  doctors: Doctor[];
  currentUser?: any;
  onAddInvoice: (invData: any) => Promise<void>;
  onRecordPayment: (payData: any) => Promise<void>;
  onDeleteInvoice?: (invoiceId: number) => Promise<void> | void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  patients,
  doctors,
  currentUser,
  onAddInvoice,
  onRecordPayment,
  onDeleteInvoice
}) => {
  const role = currentUser?.role || 'ADMIN';
  const isReceptionist = role === 'RECEPTIONIST';
  const isAdmin = role === 'ADMIN';

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Billing Generator Form state
  const [selectedPatientId, setSelectedPatientId] = useState<number | 'manual'>(
    patients[0]?.id || 'manual'
  );
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientPhone, setManualPatientPhone] = useState('+91 ');
  const [manualPatientUhid, setManualPatientUhid] = useState('');

  const [doctorId, setDoctorId] = useState<number>(doctors[0]?.id || 1);
  const [consultationFee, setConsultationFee] = useState(850.0);
  const [medicineFee, setMedicineFee] = useState(650.0);
  const [labFee, setLabFee] = useState(1200.0);
  const [additionalCharges, setAdditionalCharges] = useState(150.0);
  const [discountAmount, setDiscountAmount] = useState(0.0);
  const [paymentMode, setPaymentMode] = useState('UPI / QR Code');

  // Keep selectedInvoice valid if list changes
  React.useEffect(() => {
    if (invoices.length === 0) {
      setSelectedInvoice(null);
    } else if (!selectedInvoice || !invoices.find((inv) => inv.id === selectedInvoice.id)) {
      setSelectedInvoice(invoices[0]);
    }
  }, [invoices]);

  const subtotal = consultationFee + medicineFee + labFee + additionalCharges;
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxable * 0.05).toFixed(2));
  const grandTotal = Number((taxable + taxAmount).toFixed(2));

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    let patName = manualPatientName.trim();
    let patUhid = manualPatientUhid.trim();
    let patPhone = manualPatientPhone.trim();
    let patId = 0;

    if (selectedPatientId !== 'manual') {
      const p = patients.find((pat) => pat.id === Number(selectedPatientId));
      if (p) {
        patName = p.full_name;
        patUhid = p.uhid;
        patPhone = p.phone;
        patId = p.id;
      }
    }

    if (!patName) {
      alert('Please provide a patient name.');
      return;
    }

    const nextId = invoices.length > 0 ? Math.max(...invoices.map((i) => i.id)) + 1 : 1;
    if (!patUhid) {
      patUhid = `UHID-2026-${String(nextId).padStart(4, '0')}`;
    }

    const doctorObj = doctors.find((d) => d.id === Number(doctorId)) || doctors[0];
    const invNo = `INV-2026-${String(nextId).padStart(4, '0')}`;

    const newInvoice: Invoice = {
      id: nextId,
      invoice_no: invNo,
      patient_id: patId || nextId,
      patient_name: patName,
      patient_uhid: patUhid,
      patient_phone: patPhone || '+91 98840 00000',
      doctor_id: doctorObj.id,
      doctor_name: doctorObj.full_name,
      invoice_date: new Date().toISOString().split('T')[0],
      consultation_fee: Number(consultationFee),
      medicine_fee: Number(medicineFee),
      lab_fee: Number(labFee),
      additional_charges: Number(additionalCharges),
      discount_amount: Number(discountAmount),
      tax_amount: taxAmount,
      total_amount: grandTotal,
      payment_status: 'Paid',
      payment_mode: paymentMode
    };

    await onAddInvoice(newInvoice);

    // Also record settlement payment transaction
    await onRecordPayment({
      receipt_no: `REC-2026-${String(nextId).padStart(4, '0')}`,
      invoice_id: nextId,
      patient_name: patName,
      patient_uhid: patUhid,
      payment_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      amount_paid: grandTotal,
      payment_mode: paymentMode,
      transaction_reference:
        paymentMode.includes('UPI')
          ? `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/HOSP`
          : `POS-AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Settled'
    });

    setSelectedInvoice(newInvoice);
    setIsCreateOpen(false);
    // Reset form
    setManualPatientName('');
    setManualPatientPhone('+91 ');
    setManualPatientUhid('');
  };

  const handleConfirmDelete = async () => {
    if (invoiceToDelete && onDeleteInvoice) {
      await onDeleteInvoice(invoiceToDelete.id);
      if (selectedInvoice?.id === invoiceToDelete.id) {
        const remaining = invoices.filter((i) => i.id !== invoiceToDelete.id);
        setSelectedInvoice(remaining[0] || null);
      }
      setInvoiceToDelete(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalAmountPaid = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Hospital Billing & GST Tax Invoices
            </h2>
            {isReceptionist ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                RECEPTIONIST BILLING STATION (INVOICE CREATION & SETTLEMENT)
              </span>
            ) : isAdmin ? (
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200">
                ADMIN AUDIT (VIEW ONLY: AMOUNT PAID & INVOICES)
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            5% Healthcare GST Compliant (CGST 2.5% + SGST 2.5%), Instant UPI QR Code & Official SAC Codes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Total Amount Paid Summary Metric */}
          <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-lg text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Amount Paid by Patients
            </span>
            <span className="text-sm font-bold text-slate-900">
              ₹{totalAmountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Only Receptionist can create/generate new invoices */}
          {isReceptionist && (
            <button
              onClick={() => {
                if (patients.length > 0) {
                  setSelectedPatientId(patients[0].id);
                } else {
                  setSelectedPatientId('manual');
                }
                setIsCreateOpen(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <i className="fa-solid fa-file-invoice-dollar text-slate-400"></i> Generate New Invoice
            </button>
          )}

          {isAdmin && (
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <i className="fa-solid fa-eye text-purple-600"></i>
              <span className="text-[11px] font-medium text-slate-600">Admin Audit View (Read-Only)</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 4 Cols: Invoices List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 space-y-3">
          <div className="font-semibold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex justify-between">
            <span>Invoices Ledger</span>
            <span className="text-slate-400 font-normal">{invoices.length} Records</span>
          </div>

          {invoices.length === 0 ? (
            <div className="py-10 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-lg">
                <i className="fa-solid fa-file-invoice"></i>
              </div>
              <h3 className="text-xs font-semibold text-slate-800 mb-1">0 Invoices Registered</h3>
              <p className="text-[11px] text-slate-500 mb-4">
                All old billing records are cleared. Generate fresh invoices for newly registered patients.
              </p>
              <button
                onClick={() => {
                  setSelectedPatientId('manual');
                  setIsCreateOpen(true);
                }}
                className="bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800 transition shadow-xs inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus text-[10px]"></i> Create First Invoice
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {invoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-3 rounded-lg border transition cursor-pointer text-xs relative group ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-semibold text-slate-900">{inv.invoice_no}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[10px] border border-slate-200/60">
                          {inv.payment_status}
                        </span>
                        {onDeleteInvoice && (
                          <button
                            title="Delete Invoice"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInvoiceToDelete(inv);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="font-medium text-slate-900">{inv.patient_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.patient_uhid}</div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">{inv.payment_mode}</span>
                      <strong className="text-xs font-semibold text-slate-900">
                        ₹{inv.total_amount.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 8 Cols: Printable GST Tax Invoice Sheet */}
        <div className="lg:col-span-8 space-y-4">
          {selectedInvoice ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 sm:p-8 relative print:border-none print:shadow-none">
              {/* Action Toolbar on Preview */}
              <div className="flex flex-wrap justify-between items-center gap-2 mb-6 pb-4 border-b border-slate-100 print:hidden">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Official GST Tax Invoice Preview
                </span>
                <div className="flex items-center gap-2">
                  {onDeleteInvoice && (
                    <button
                      onClick={() => setInvoiceToDelete(selectedInvoice)}
                      className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition"
                      title="Delete this Invoice"
                    >
                      <i className="fa-solid fa-trash-can text-red-500"></i> Delete Invoice
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-xs font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition"
                  >
                    <i className="fa-solid fa-print text-slate-400"></i> Print / Download Invoice PDF
                  </button>
                </div>
              </div>

              {/* Invoice Header */}
              <div className="border-b border-slate-200 pb-5 mb-5 flex flex-wrap justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center text-lg shadow-xs">
                    <i className="fa-solid fa-heart-pulse"></i>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                      MEDI TRACK HOSPITAL
                    </h1>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      TAX INVOICE / HOSPITAL BILL
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      100 Feet Bypass Road, Vadapalani, Chennai - 600026
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="font-mono text-xs font-bold text-slate-900">
                    {selectedInvoice.invoice_no}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Date: {selectedInvoice.invoice_date}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    GSTIN: 33AAACM1234F1Z8<br />
                    SAC Code: 999312 (Healthcare Services)
                  </div>
                </div>
              </div>

              {/* Patient & Doctor Meta */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 mb-5 grid grid-cols-2 gap-3.5 text-xs">
                <div>
                  <span className="text-[10px] font-medium uppercase text-slate-400 block">Billed To (Patient)</span>
                  <strong className="text-slate-900 text-xs block font-semibold">{selectedInvoice.patient_name}</strong>
                  <span className="text-[11px] font-mono text-slate-400 block">UHID: {selectedInvoice.patient_uhid}</span>
                  <span className="text-[11px] text-slate-500 block">Phone: {selectedInvoice.patient_phone}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium uppercase text-slate-400 block">Consulting Specialist</span>
                  <strong className="text-slate-900 text-xs block font-semibold">{selectedInvoice.doctor_name}</strong>
                  <span className="text-[11px] text-slate-500 font-medium block">Department of Specialty Medicine</span>
                  <span className="text-[10px] bg-slate-100 border border-slate-200/60 text-slate-700 font-medium px-2 py-0.5 rounded inline-block mt-1">
                    PAYMENT STATUS: {selectedInvoice.payment_status}
                  </span>
                </div>
              </div>

              {/* Itemized Services Breakdown Table */}
              <div className="mb-5 overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200/80 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Clinical Service / Particulars</th>
                      <th className="p-2.5">SAC / HSN</th>
                      <th className="p-2.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 font-medium text-slate-400">1</td>
                      <td className="p-2.5 font-medium text-slate-900">Specialist Doctor OPD Consultation Fee</td>
                      <td className="p-2.5 font-mono text-slate-400">999312</td>
                      <td className="p-2.5 text-right font-medium text-slate-800">₹{selectedInvoice.consultation_fee.toFixed(2)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 font-medium text-slate-400">2</td>
                      <td className="p-2.5 font-medium text-slate-900">Hospital Pharmacy Formulations & Medicines</td>
                      <td className="p-2.5 font-mono text-slate-400">3004</td>
                      <td className="p-2.5 text-right font-medium text-slate-800">₹{selectedInvoice.medicine_fee.toFixed(2)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 font-medium text-slate-400">3</td>
                      <td className="p-2.5 font-medium text-slate-900">Pathology Lab Investigations & Diagnostic Imaging</td>
                      <td className="p-2.5 font-mono text-slate-400">999313</td>
                      <td className="p-2.5 text-right font-medium text-slate-800">₹{selectedInvoice.lab_fee.toFixed(2)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-2.5 font-medium text-slate-400">4</td>
                      <td className="p-2.5 font-medium text-slate-900">Clinical Nursing, Registration & Sanitization</td>
                      <td className="p-2.5 font-mono text-slate-400">999319</td>
                      <td className="p-2.5 text-right font-medium text-slate-800">₹{selectedInvoice.additional_charges.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invoice Calculations and UPI QR Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center pt-2 mb-5">
                {/* Left: UPI QR Payment Stamp */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 flex items-center gap-3.5">
                  <div className="w-16 h-16 bg-white p-1 rounded border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-qrcode text-3xl text-slate-900"></i>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <strong className="text-slate-900 block font-semibold">Instant UPI Verification</strong>
                    <div className="text-[11px] text-slate-500 font-mono">VPA: meditrack@icici</div>
                    <div className="text-[11px] text-slate-500">Mode: {selectedInvoice.payment_mode}</div>
                    <span className="text-[10px] text-slate-700 font-medium bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded inline-block">
                      VERIFIED SETTLEMENT
                    </span>
                  </div>
                </div>

                {/* Right: Calculations Summary */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Subtotal:</span>
                    <span>
                      ₹
                      {(
                        selectedInvoice.consultation_fee +
                        selectedInvoice.medicine_fee +
                        selectedInvoice.lab_fee +
                        selectedInvoice.additional_charges
                      ).toFixed(2)}
                    </span>
                  </div>
                  {selectedInvoice.discount_amount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600 font-medium">
                      <span>Hospital Concession / Discount:</span>
                      <span>-₹{selectedInvoice.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Healthcare GST (2.5% CGST + 2.5% SGST):</span>
                    <span>₹{selectedInvoice.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Grand Total:</span>
                    <span>₹{selectedInvoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Authorized Hospital Seal & Signature */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-end text-xs text-slate-400">
                <div>
                  <div className="font-mono text-[10px]">E-Invoice IRN: 8a93bf102...</div>
                  <div className="text-[10px]">Thank you for choosing MediTrack Healthcare. Get well soon!</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900 text-xs">MEDI TRACK HOSPITALS</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Authorized Billing Signatory</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
              <i className="fa-solid fa-file-invoice text-3xl text-slate-300 mb-3 block"></i>
              No invoice selected. Generate a new invoice or choose one from the list.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Delete GST Tax Invoice</h3>
                <p className="text-xs text-slate-500">{invoiceToDelete.invoice_no}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this billing record for{' '}
              <strong className="text-slate-900">{invoiceToDelete.patient_name}</strong> (₹
              {invoiceToDelete.total_amount.toFixed(2)})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <i className="fa-solid fa-trash-can text-[11px]"></i> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl border border-slate-200/80 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <i className="fa-solid fa-file-invoice-dollar text-sky-400"></i> Create GST Healthcare Tax Invoice
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="space-y-3">
                {patients.length > 0 && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Select Registered Patient or New Entry</label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedPatientId(val === 'manual' ? 'manual' : Number(val));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 bg-white font-medium"
                    >
                      <option value="manual">+ Enter Patient Details Manually</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.uhid}) - {p.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedPatientId === 'manual' && (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2.5">
                    <div className="font-semibold text-slate-800 text-[11px]">Patient Details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Patient Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={manualPatientName}
                          onChange={(e) => setManualPatientName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Phone Number</label>
                        <input
                          type="text"
                          placeholder="+91 98400 12345"
                          value={manualPatientPhone}
                          onChange={(e) => setManualPatientPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-800 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Attending Specialist Doctor *</label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 bg-white"
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

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
                <h4 className="font-semibold text-slate-900 text-xs">Itemized Service Charges</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pharmacy / Medicines (₹)</label>
                    <input
                      type="number"
                      value={medicineFee}
                      onChange={(e) => setMedicineFee(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Pathology Lab / Diagnostics (₹)</label>
                    <input
                      type="number"
                      value={labFee}
                      onChange={(e) => setLabFee(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Nursing & Procedures (₹)</label>
                    <input
                      type="number"
                      value={additionalCharges}
                      onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white outline-none text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Discount / Concession (₹)</label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white outline-none font-medium text-slate-800"
                    >
                      <option value="UPI / QR Code">UPI / QR Code</option>
                      <option value="POS Card (HDFC)">POS Card (HDFC)</option>
                      <option value="Cash Receipt">Cash Receipt</option>
                      <option value="NetBanking">NetBanking</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Breakdown Preview */}
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-500">Taxable Value: ₹{taxable.toFixed(2)}</span> |{' '}
                  <span className="text-slate-500">5% GST: ₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900">
                  Grand Total: ₹{grandTotal.toFixed(2)}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 rounded-lg shadow-xs text-xs transition"
                >
                  Authorize & Issue GST Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
