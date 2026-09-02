import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export const AnalyticsView: React.FC = () => {
  const patientChartRef = useRef<HTMLCanvasElement | null>(null);
  const revenueChartRef = useRef<HTMLCanvasElement | null>(null);
  const deptChartRef = useRef<HTMLCanvasElement | null>(null);

  const patientChartInstance = useRef<Chart | null>(null);
  const revenueChartInstance = useRef<Chart | null>(null);
  const deptChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // 1. Patient Footfall Chart
    if (patientChartRef.current) {
      if (patientChartInstance.current) patientChartInstance.current.destroy();
      const ctx = patientChartRef.current.getContext('2d');
      if (ctx) {
        patientChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            datasets: [
              {
                label: 'OPD Patients Registered',
                data: [1240, 1420, 1580, 1720, 1890, 2150],
                backgroundColor: '#0284C7',
                borderRadius: 6
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

    // 2. Revenue Trend Chart
    if (revenueChartRef.current) {
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      const ctx = revenueChartRef.current.getContext('2d');
      if (ctx) {
        revenueChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            datasets: [
              {
                label: 'Monthly Collections (₹ Lakhs)',
                data: [5.8, 6.4, 7.2, 7.9, 8.5, 9.2],
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

    // 3. Department Load Chart
    if (deptChartRef.current) {
      if (deptChartInstance.current) deptChartInstance.current.destroy();
      const ctx = deptChartRef.current.getContext('2d');
      if (ctx) {
        deptChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: [
              'Cardiology',
              'Obstetrics & Gyn',
              'Orthopaedics',
              'Neurology',
              'Paediatrics',
              'General Medicine'
            ],
            datasets: [
              {
                data: [32, 22, 18, 14, 8, 6],
                backgroundColor: [
                  '#0A3871',
                  '#0284C7',
                  '#38BDF8',
                  '#059669',
                  '#F59E0B',
                  '#64748B'
                ]
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
  }, []);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">
          Clinical & Financial Healthcare Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          NABH Quality Metrics, Patient Volume Footfall & Revenue Trajectory
        </p>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
              Monthly OPD Patient Footfall (2026)
            </h3>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">+13.7% MoM</span>
          </div>
          <canvas ref={patientChartRef} height={140}></canvas>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
              Monthly Revenue Collections (₹ in Lakhs)
            </h3>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">+8.2% Growth</span>
          </div>
          <canvas ref={revenueChartRef} height={140}></canvas>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-4">
            Clinical Specialty OPD Volume Distribution (%)
          </h3>
          <div className="max-w-xs mx-auto">
            <canvas ref={deptChartRef}></canvas>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider mb-2">
            NABH Hospital Quality Key Indicators (KPIs)
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-medium">Bed Occupancy Rate</strong>
                <span className="text-[11px] text-slate-500">ICU & Inpatient Wards</span>
              </div>
              <span className="text-sm font-bold text-slate-900">84.6%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-medium">Average OPD Wait Time</strong>
                <span className="text-[11px] text-slate-500">Registration to Consultation</span>
              </div>
              <span className="text-sm font-bold text-slate-900">14.2 Mins</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-medium">Prescription Fulfillment</strong>
                <span className="text-[11px] text-slate-500">In-House Pharmacy Availability</span>
              </div>
              <span className="text-sm font-bold text-slate-900">98.8%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-medium">Patient Satisfaction Score</strong>
                <span className="text-[11px] text-slate-500">Post-discharge surveys</span>
              </div>
              <span className="text-sm font-bold text-slate-900">4.9 / 5.0 ★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
