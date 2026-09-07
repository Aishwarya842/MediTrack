import React, { useEffect, useMemo, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { Appointment, Consultation, Invoice, Patient, Prescription } from '../data/hospitalData';

interface AnalyticsViewProps {
  patients: Patient[];
  appointments: Appointment[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  invoices: Invoice[];
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthKeyOf = (dateStr?: string): string => {
  const m = (dateStr || '').match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : '';
};

const monthAbbrOf = (key: string): string => {
  const [, mm] = key.split('-');
  const idx = Number(mm);
  return idx >= 1 && idx <= 12 ? MONTH_ABBR[idx - 1] : key;
};

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  patients,
  appointments,
  consultations,
  prescriptions,
  invoices
}) => {
  const patientChartRef = useRef<HTMLCanvasElement | null>(null);
  const revenueChartRef = useRef<HTMLCanvasElement | null>(null);
  const deptChartRef = useRef<HTMLCanvasElement | null>(null);

  const patientChartInstance = useRef<Chart | null>(null);
  const revenueChartInstance = useRef<Chart | null>(null);
  const deptChartInstance = useRef<Chart | null>(null);

  // Department footfall from actual appointments
  const deptFootfall = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach((a) => {
      const d = (a.department || a.specialty || 'Unassigned').trim() || 'Unassigned';
      map.set(d, (map.get(d) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [appointments]);

  // Monthly revenue strictly from generated invoices
  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>();
    invoices.forEach((inv) => {
      const key = monthKeyOf(inv.invoice_date);
      if (!key) return;
      map.set(key, (map.get(key) || 0) + (Number(inv.total_amount) || 0));
    });
    return Array.from(map.entries())
      .map(([key, amount]) => ({ key, label: monthAbbrOf(key), amount }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [invoices]);

  // Real financial aggregates from invoices
  const finance = useMemo(() => {
    const paid = invoices.filter((i) => i.payment_status === 'Paid');
    const totalCollected = invoices.reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
    const medicineRevenue = invoices.reduce((s, i) => s + (Number(i.medicine_fee) || 0), 0);
    const labRevenue = invoices.reduce((s, i) => s + (Number(i.lab_fee) || 0), 0);
    const consultationRevenue = invoices.reduce((s, i) => s + (Number(i.consultation_fee) || 0), 0);
    const taxCollected = invoices.reduce((s, i) => s + (Number(i.tax_amount) || 0), 0);
    return {
      invoiceCount: invoices.length,
      paidCount: paid.length,
      totalCollected,
      medicineRevenue,
      labRevenue,
      consultationRevenue,
      taxCollected,
      avgBill: invoices.length > 0 ? totalCollected / invoices.length : 0
    };
  }, [invoices]);

  const vitalsRecorded = useMemo(
    () => appointments.filter((a) => a.vitals_recorded).length,
    [appointments]
  );

  useEffect(() => {
    if (patientChartRef.current) {
      if (patientChartInstance.current) patientChartInstance.current.destroy();
      const ctx = patientChartRef.current.getContext('2d');
      if (ctx && deptFootfall.length > 0) {
        patientChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: deptFootfall.map((d) => d.label),
            datasets: [
              {
                label: 'OPD Tokens Generated',
                data: deptFootfall.map((d) => d.count),
                backgroundColor: '#0284C7',
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { ticks: { precision: 0 } } }
          }
        });
      }
    }

    if (revenueChartRef.current) {
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      const ctx = revenueChartRef.current.getContext('2d');
      if (ctx && revenueByMonth.length > 0) {
        revenueChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: revenueByMonth.map((r) => r.label),
            datasets: [
              {
                label: 'Invoice Collections (₹)',
                data: revenueByMonth.map((r) => r.amount),
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                fill: true,
                tension: 0.3
              }
            ]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } }
          }
        });
      }
    }

    if (deptChartRef.current) {
      if (deptChartInstance.current) deptChartInstance.current.destroy();
      const ctx = deptChartRef.current.getContext('2d');
      if (ctx && deptFootfall.length > 0) {
        const palette = ['#0A3871', '#0284C7', '#38BDF8', '#059669', '#F59E0B', '#64748B', '#7C3AED', '#DB2777'];
        deptChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: deptFootfall.map((d) => d.label),
            datasets: [
              {
                data: deptFootfall.map((d) => d.count),
                backgroundColor: deptFootfall.map((_, i) => palette[i % palette.length])
              }
            ]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
          }
        });
      }
    }

    return () => {
      if (patientChartInstance.current) patientChartInstance.current.destroy();
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      if (deptChartInstance.current) deptChartInstance.current.destroy();
    };
  }, [deptFootfall, revenueByMonth]);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Clinical & Financial Healthcare Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Live figures computed strictly from actual registrations, tokens, consultations, prescriptions & invoices generated in this system.
        </p>
      </div>

      {/* Real KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Patients Master</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{patients.length}</div>
          <span className="text-xs text-slate-500">Registered registry records</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OPD Tokens Issued</span>
          <div className="text-2xl font-bold text-sky-700 mt-1 font-mono">{appointments.length}</div>
          <span className="text-xs text-slate-500">{vitalsRecorded} with vitals recorded</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consultations Done</span>
          <div className="text-2xl font-bold text-purple-700 mt-1 font-mono">{consultations.length}</div>
          <span className="text-xs text-slate-500">Completed examination records</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prescriptions Issued</span>
          <div className="text-2xl font-bold text-violet-700 mt-1 font-mono">{prescriptions.length}</div>
          <span className="text-xs text-slate-500">Digital Rx records</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Collections</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">{inr(finance.totalCollected)}</div>
          <span className="text-xs text-slate-500">{finance.invoiceCount} invoice{finance.invoiceCount === 1 ? '' : 's'}, {finance.paidCount} paid</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">OPD Footfall by Department</h3>
            <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">{appointments.length} tokens</span>
          </div>
          {deptFootfall.length > 0 ? (
            <canvas ref={patientChartRef} height={140}></canvas>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">No appointments generated yet.</div>
          )}
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Monthly Invoice Collections (₹)</h3>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">{inr(finance.totalCollected)} total</span>
          </div>
          {revenueByMonth.length > 0 ? (
            <canvas ref={revenueChartRef} height={140}></canvas>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">No invoices generated yet. Collections appear once the receptionist settles a fee.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-4">
            Clinical Specialty OPD Volume Distribution
          </h3>
          {deptFootfall.length > 0 ? (
            <div className="max-w-xs mx-auto">
              <canvas ref={deptChartRef}></canvas>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">No department data available yet.</div>
          )}
        </div>

        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-2">
            Revenue & Process Indicators (Actual)
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-medium">Consultation Fees Collected</strong>
                <span className="text-[11px] text-slate-500">From {finance.paidCount} settled invoices</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{inr(finance.consultationRevenue)}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-medium">Pharmacy Medicines Revenue</strong>
                <span className="text-[11px] text-slate-500">Stock dispensed against prescriptions</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{inr(finance.medicineRevenue)}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-medium">Pathology Lab & Diagnostics</strong>
                <span className="text-[11px] text-slate-500">Lab charges on invoices</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{inr(finance.labRevenue)}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-medium">GST Tax Collected</strong>
                <span className="text-[11px] text-slate-500">5% healthcare tax on combined bills</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{inr(finance.taxCollected)}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-medium">Average Bill Value</strong>
                <span className="text-[11px] text-slate-500">Per settled invoice</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{inr(Math.round(finance.avgBill))}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-medium">Vitals Recorded Rate</strong>
                <span className="text-[11px] text-slate-500">{vitalsRecorded} of {appointments.length} tokens</span>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {appointments.length > 0 ? `${Math.round((vitalsRecorded / appointments.length) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};