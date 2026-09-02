import React from 'react';
import { Payment } from '../data/hospitalData';

interface PaymentsViewProps {
  payments: Payment[];
  currentUser?: any;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ payments, currentUser }) => {
  const role = currentUser?.role || 'ADMIN';
  const isReceptionist = role === 'RECEPTIONIST';
  const isAdmin = role === 'ADMIN';

  const totalCollections = payments.reduce((acc, p) => acc + p.amount_paid, 0);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Collections & Payment Transactions Log
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
            UPI / Dynamic QR Receipts, POS Credit/Debit Cards, NetBanking & Cash Records
          </p>
        </div>
        <div className="text-right bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Amount Paid by Patients
          </span>
          <span className="text-lg font-bold text-slate-900">
            ₹{totalCollections.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Receipt No.</th>
                <th className="p-3">Payment Date & Time</th>
                <th className="p-3">Patient Name (UHID)</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3">Transaction Reference</th>
                <th className="p-3 text-right">Amount Paid (₹)</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {payments.map((p) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
