import React, { useState } from 'react';
import { Payment, Appointment, Invoice, Patient, Doctor } from '../data/hospitalData';
import { ConsultationFeeReceiptModal } from './ConsultationFeeReceiptModal';

interface PaymentsViewProps {
  payments: Payment[];
  appointments?: Appointment[];
  invoices?: Invoice[];
  patients?: Patient[];
  doctors?: Doctor[];
  currentUser?: any;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  appointments,
  invoices,
  patients,
  doctors,
  currentUser
}) => {
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null);
  const role = currentUser?.role || 'ADMIN';
  const isReceptionist = role === 'RECEPTIONIST';
  const isAdmin = role === 'ADMIN';
  const isPatient = role === 'PATIENT';

  const displayedPayments = payments.filter((p) => {
    if (isPatient) {
      const u = currentUser?.patient_uhid?.trim().toUpperCase();
      const pUhid = p.patient_uhid?.trim().toUpperCase();
      return Boolean(u && pUhid && u === pUhid);
    }
    return true;
  });

  const totalCollections = displayedPayments.reduce((acc, p) => acc + p.amount_paid, 0);

  return (
    <div className="space-y-4">
      {/* Patient Isolation Banner */}
      {isPatient && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-bold text-emerald-950">
              Personal Payment Log: Showing payment receipts exclusively for {currentUser?.full_name} ({currentUser?.patient_uhid}).
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-900 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-xs">
            {displayedPayments.length} Receipts
          </span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {isPatient ? 'My Payment Receipts & Transaction Log' : 'Collections & Payment Transactions Log'}
            </h2>
            {isReceptionist ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                RECEPTIONIST MONEY SETTLEMENT DESK
              </span>
            ) : isAdmin ? (
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200">
                ADMIN AUDIT (VIEW TOTAL AMOUNT PAID)
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            UPI / Dynamic QR Receipts, POS Credit/Debit Cards, NetBanking &amp; Cash Records
          </p>
        </div>
        <div className="text-right bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {isPatient ? 'Total Amount Paid by You' : 'Total Amount Paid by Patients'}
          </span>
          <span className="text-lg font-bold text-slate-900">
            ₹{totalCollections.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {displayedPayments.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-lg">
              <i className="fa-solid fa-receipt"></i>
            </div>
            <h3 className="text-xs font-semibold text-slate-800 mb-1">0 Payment Transactions Found</h3>
            <p className="text-[11px] text-slate-500">
              {isPatient
                ? `No payment receipts on record for ${currentUser?.full_name} (${currentUser?.patient_uhid}) yet.`
                : 'No payment transaction logs recorded in the system yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Receipt No.</th>
                  <th className="p-3">Payment Date &amp; Time</th>
                  <th className="p-3">Patient Name (UHID)</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Transaction Reference</th>
                  <th className="p-3 text-right">Amount Paid (₹)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayedPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono font-semibold text-slate-900">{p.receipt_no}</td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">{p.payment_date}</td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{p.patient_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.patient_uhid}</div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[10px] border border-slate-200/60">
                        {p.payment_mode}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{p.transaction_reference}</td>
                    <td className="p-3 text-right font-semibold text-slate-900 text-xs whitespace-nowrap">
                      ₹{p.amount_paid.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[10px] border border-slate-200/60">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentForReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 shadow-xs transition"
                        title="Print Official Consultation Fee Receipt"
                      >
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                        <span>Fee Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Render Consultation Fee Receipt Modal */}
      {selectedPaymentForReceipt && (() => {
        const inv = invoices?.find(
          (i) => i.id === selectedPaymentForReceipt.invoice_id || i.invoice_no === selectedPaymentForReceipt.receipt_no.replace('REC', 'INV')
        );
        const appt = appointments?.find(
          (a) => a.id === inv?.appointment_id || (selectedPaymentForReceipt.patient_uhid && a.patient_uhid === selectedPaymentForReceipt.patient_uhid)
        );
        const pat = patients?.find(
          (pt) => pt.uhid === selectedPaymentForReceipt.patient_uhid || pt.full_name === selectedPaymentForReceipt.patient_name
        );
        const doc = doctors?.find((d) => d.id === appt?.doctor_id || d.full_name === appt?.doctor_name);

        const fallbackAppt: Appointment = appt || {
          id: 9999,
          appointment_no: selectedPaymentForReceipt.receipt_no.replace('REC', 'APT'),
          opd_reg_no: `OPD-${selectedPaymentForReceipt.receipt_no}`,
          patient_id: pat?.id || 1,
          patient_name: selectedPaymentForReceipt.patient_name,
          patient_uhid: selectedPaymentForReceipt.patient_uhid,
          doctor_id: doc?.id || 1,
          doctor_name: doc?.full_name || 'Dr. Kavitha Ramanathan',
          department: doc?.department || 'General Medicine',
          appointment_date: selectedPaymentForReceipt.payment_date.split(' ')[0] || new Date().toISOString().split('T')[0],
          appointment_time: selectedPaymentForReceipt.payment_date.split(' ')[1] || '10:00 AM',
          time_slot: '10:00 AM - 10:15 AM',
          status: 'COMPLETED',
          type: 'IN_PERSON',
          fee_amount: selectedPaymentForReceipt.amount_paid,
          payment_status: 'PAID',
          payment_mode: (selectedPaymentForReceipt.payment_mode as any) || 'UPI',
          receipt_no: selectedPaymentForReceipt.receipt_no,
          patient_location: pat?.location || pat?.address || 'Chennai',
          nature_of_health_issue: 'Consultation & Medical Review',
          notes: `Transaction ref: ${selectedPaymentForReceipt.transaction_reference}`
        };

        return (
          <ConsultationFeeReceiptModal
            isOpen={true}
            onClose={() => setSelectedPaymentForReceipt(null)}
            appointment={appt || fallbackAppt}
            invoice={inv}
            patient={pat}
            doctor={doc}
            currentUser={currentUser}
          />
        );
      })()}
    </div>
  );
};
