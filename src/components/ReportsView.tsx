import React from 'react';
import { AuditLog, Patient, Invoice, Medicine } from '../data/hospitalData';

interface ReportsViewProps {
  auditLogs: AuditLog[];
  patients: Patient[];
  invoices: Invoice[];
  medicines: Medicine[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  auditLogs,
  patients,
  invoices,
  medicines
}) => {
  // Generic robust CSV file exporter
  const triggerCSVDownload = (rows: Record<string, any>[], filename: string) => {
    if (!rows || rows.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            if (val === null || val === undefined) return '""';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ].join('\r\n');

    // \uFEFF BOM ensures Microsoft Excel & Google Sheets correctly decode UTF-8 characters and formatting
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 150);
  };

  // 1. Patient Master Registry Exporter (Flattens all demographics, biological vitals, and emergency contacts)
  const handleExportPatients = () => {
    const formattedPatients = patients.map((p) => ({
      'UHID': p.uhid,
      'Full Name': p.full_name,
      'Age': p.age,
      'Gender': p.gender,
      'Date of Birth': p.dob || '',
      'Mobile Number': p.phone,
      'Email Address': p.email || '',
      'Blood Group': p.blood_group,
      'Department': p.department,
      'City': p.city || '',
      'Address': p.address || '',
      'Emergency Contact Name': p.emergency_contact?.name || '',
      'Emergency Contact Phone': p.emergency_contact?.phone || '',
      'Height (cm)': p.vitals?.height_cm ?? '',
      'Weight (kg)': p.vitals?.weight_kg ?? '',
      'BMI': p.vitals?.bmi ?? '',
      'BMI Status': p.vitals?.bmi_category ?? '',
      'Blood Pressure': p.vitals?.blood_pressure ?? '',
      'Pulse Rate (bpm)': p.vitals?.pulse_rate ?? '',
      'Temperature (°F)': p.vitals?.temperature_f ?? '',
      'SpO2 (%)': p.vitals?.spo2 ?? '',
      'Drug Allergies': Array.isArray(p.allergies) ? p.allergies.join('; ') : (p.allergies || 'None'),
      'Medical History': Array.isArray(p.medical_history) ? p.medical_history.join('; ') : (p.medical_history || 'None'),
      'Registration Date': p.created_at || ''
    }));

    triggerCSVDownload(formattedPatients, `meditrack_patient_master_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 2. Revenue & Billing Ledger Exporter
  const handleExportInvoices = () => {
    const formattedInvoices = invoices.map((inv) => ({
      'Invoice No': inv.invoice_no,
      'Patient UHID': inv.patient_uhid,
      'Patient Name': inv.patient_name,
      'Consultant Doctor': inv.doctor_name,
      'Department': inv.department,
      'Invoice Date': inv.invoice_date,
      'Consultation Fee (INR)': inv.consultation_fee,
      'Pharmacy Total (INR)': inv.pharmacy_total,
      'Subtotal (INR)': inv.subtotal,
      'GST 5% (INR)': inv.tax_amount,
      'Discount (INR)': inv.discount || 0,
      'Grand Total Amount (INR)': inv.total_amount,
      'Payment Status': inv.payment_status,
      'Payment Method': inv.payment_method
    }));

    triggerCSVDownload(formattedInvoices, `meditrack_revenue_billing_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 3. Pharmacy Formulary & Inventory Exporter
  const handleExportMedicines = () => {
    const formattedMedicines = medicines.map((m) => ({
      'Item Code': m.item_code,
      'Medicine Name': m.name,
      'Generic Composition': m.generic_name,
      'Category': m.category,
      'Dosage Form': m.dosage_form,
      'Unit Price (INR)': m.unit_price,
      'Stock Units Available': m.stock_quantity,
      'Batch Number': m.batch_number,
      'Expiry Date': m.expiry_date,
      'Manufacturer': m.manufacturer
    }));

    triggerCSVDownload(formattedMedicines, `meditrack_pharmacy_inventory_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 4. NABH Audit Trail Exporter
  const handleExportAuditLogs = () => {
    const formattedLogs = auditLogs.map((log) => ({
      'Timestamp': log.created_at,
      'User / Actor': log.user_name,
      'Action Event': log.action,
      'Entity Type': log.entity_type,
      'IP Address & Terminal': log.ip_address,
      'Audit Details': log.details
    }));

    triggerCSVDownload(formattedLogs, `meditrack_security_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Hospital Reports & NABH Security Audit Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            CSV Spreadsheet Exports & Real-Time Role Access Audit Trails
          </p>
        </div>
        <button
          onClick={handleExportAuditLogs}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-slate-300 transition"
        >
          <i className="fa-solid fa-download text-slate-600"></i> Export Audit Logs CSV
        </button>
      </div>

      {/* CSV Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Patient Master */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-center hover:border-slate-300 transition">
          <div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center text-lg mx-auto mb-3 border border-sky-200/60">
              <i className="fa-solid fa-hospital-user"></i>
            </div>
            <h3 className="font-semibold text-xs text-slate-900 mb-1">Patient Master Registry</h3>
            <p className="text-slate-500 text-xs mb-4">
              Complete UHID database, demographic data, blood groups, biological vitals, and medical histories.
            </p>
          </div>
          <button
            onClick={handleExportPatients}
            className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <i className="fa-solid fa-file-csv text-sky-400"></i> Export Patients CSV
          </button>
        </div>

        {/* Card 2: Billing Ledger */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-center hover:border-slate-300 transition">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg mx-auto mb-3 border border-emerald-200/60">
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <h3 className="font-semibold text-xs text-slate-900 mb-1">Revenue & Billing Ledger</h3>
            <p className="text-slate-500 text-xs mb-4">
              Itemized patient bills, 5% GST breakdown, discount records, and payment modes.
            </p>
          </div>
          <button
            onClick={handleExportInvoices}
            className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <i className="fa-solid fa-file-csv text-emerald-400"></i> Export Invoices CSV
          </button>
        </div>

        {/* Card 3: Pharmacy Stock */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-center hover:border-slate-300 transition">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-lg mx-auto mb-3 border border-amber-200/60">
              <i className="fa-solid fa-pills"></i>
            </div>
            <h3 className="font-semibold text-xs text-slate-900 mb-1">Pharmacy Stock & Master</h3>
            <p className="text-slate-500 text-xs mb-4">
              Formulary drug composition, batch numbers, expiry dates, and current stock units.
            </p>
          </div>
          <button
            onClick={handleExportMedicines}
            className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <i className="fa-solid fa-file-csv text-amber-400"></i> Export Pharmacy CSV
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex justify-between items-center">
          <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-slate-400"></i> NABH Compliance Security Audit Trail
          </h3>
          <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[10px] border border-slate-200/60">
            Live Event Stream
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User / Actor</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">IP Address & Terminal</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.created_at}</td>
                  <td className="p-3 font-semibold text-slate-900">{log.user_name}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200/60">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-800">{log.entity_type}</td>
                  <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {log.ip_address}
                  </td>
                  <td className="p-3 text-slate-600 text-[11px]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

