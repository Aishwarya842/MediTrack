import React from 'react';
import { AuditLog, Patient, Invoice, Medicine, Appointment } from '../data/hospitalData';

interface ReportsViewProps {
  auditLogs: AuditLog[];
  patients: Patient[];
  invoices: Invoice[];
  medicines: Medicine[];
  appointments?: Appointment[];
  onResetAllData?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  auditLogs,
  patients,
  invoices,
  medicines,
  appointments,
  onResetAllData
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
      'Date of Birth': p.date_of_birth || '',
      'Gender': p.gender,
      'Mobile Number': p.phone,
      'Email Address': p.email || '',
      'Blood Group': p.blood_group,
      'Department': p.department || '',
      'Assigned Doctor': p.assigned_doctor_name || '',
      'Location / City': p.city || '',
      'Address': p.address || '',
      'State': p.state || '',
      'Emergency Contact Name': p.emergency_contact_name || '',
      'Emergency Contact Phone': p.emergency_contact_phone || '',
      'Height (cm)': p.height_cm ?? '',
      'Weight (kg)': p.weight_kg ?? '',
      'BMI': p.bmi ?? '',
      'BMI Status': p.bmi ? (p.bmi < 18.5 ? 'Underweight' : p.bmi < 25 ? 'Normal' : p.bmi < 30 ? 'Overweight' : 'Obese') : '',
      'Blood Pressure Systolic': p.bp_systolic ?? '',
      'Blood Pressure Diastolic': p.bp_diastolic ?? '',
      'Blood Pressure (Full)': p.bp || '',
      'Pulse Rate (bpm)': p.pulse ?? '',
      'Temperature (°F)': p.temperature || '',
      'SpO2 (%)': p.spo2 || '',
      'Drug Allergies': (p.allergies || 'None'),
      'Medical History': (p.medical_history || 'None'),
      'Nature of Health Issue': p.nature_of_health_issue || '',
      'Registration Date': p.created_at || ''
    }));

    triggerCSVDownload(formattedPatients, `carehub_patient_master_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 2. Revenue & Billing Ledger Exporter
  const handleExportInvoices = () => {
    const formattedInvoices = invoices.map((inv) => {
      const linkedAppt = appointments?.find(
        (a) =>
          (inv.appointment_id && a.id === inv.appointment_id) ||
          (a.patient_id === inv.patient_id && a.patient_uhid.toUpperCase() === inv.patient_uhid.toUpperCase())
      );
      const consultationTime =
        inv.consultation_time ||
        linkedAppt?.appointment_time ||
        linkedAppt?.time_slot ||
        '';

      return {
        'Invoice No': inv.invoice_no,
        'Receipt No': inv.receipt_no || '',
        'OPD Reg No': inv.opd_reg_no || '',
        'Patient UHID': inv.patient_uhid,
        'Patient Name': inv.patient_name,
        'Patient Phone': inv.patient_phone || '',
        'Patient Age': inv.patient_age ?? '',
        'Patient Location': inv.patient_location || '',
        'Consultant Doctor': inv.doctor_name,
        'Department': inv.department || '',
        'Invoice Date': inv.invoice_date,
        'Consultation Time': consultationTime,
        'Consultation Fee (INR)': inv.consultation_fee,
        'Medicine Fee (INR)': inv.medicine_fee,
        'Lab Fee (INR)': inv.lab_fee,
        'Additional Charges (INR)': inv.additional_charges,
        'Subtotal (INR)': inv.consultation_fee + inv.medicine_fee + inv.lab_fee + inv.additional_charges,
        'GST 5% (INR)': inv.tax_amount,
        'Discount (INR)': inv.discount_amount,
        'Grand Total Amount (INR)': inv.total_amount,
        'Payment Status': inv.payment_status,
        'Payment Mode': inv.payment_mode,
        'Collected By': inv.collected_by || ''
      };
    });

    triggerCSVDownload(formattedInvoices, `carehub_revenue_billing_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 3. Pharmacy Formulary & Inventory Exporter
  const handleExportMedicines = () => {
    const formattedMedicines = medicines.map((m) => ({
      'Brand Name': m.medicine_name,
      'Generic Salt / Composition': m.generic_name,
      'Therapeutic Class': m.category,
      'Dosage Form': m.form,
      'Strength': m.strength,
      'Form & Strength': `${m.form} • ${m.strength}`,
      'Manufacturer': m.manufacturer,
      'Batch Number': m.batch_number,
      'Expiry Date': m.expiry_date,
      'Unit MRP (INR)': m.unit_price.toFixed(2),
      'Stock Units Available': m.stock_quantity,
      'HSN Code': m.hsn_code
    }));

    triggerCSVDownload(formattedMedicines, `carehub_pharmacy_inventory_${new Date().toISOString().split('T')[0]}.csv`);
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

    triggerCSVDownload(formattedLogs, `carehub_security_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
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

      {/* Database Reset & Clean Slate Option for Admin */}
      {onResetAllData && (
        <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-lg flex-shrink-0 border border-red-200">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-950 uppercase tracking-wider">
                System Database Clean Slate &amp; Reset
              </h4>
              <p className="text-xs text-red-800 mt-0.5 max-w-xl">
                Wipe all registered patient records, appointments, consultations, prescriptions, invoices, and payment receipts.
              </p>
            </div>
          </div>
          <button
            onClick={onResetAllData}
            className="bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <i className="fa-solid fa-trash-can"></i> Reset to 100% Clean Slate
          </button>
        </div>
      )}

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

