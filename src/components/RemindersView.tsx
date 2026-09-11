import React, { useMemo } from 'react';
import { Prescription, Patient, FollowUpReminder, FOLLOW_UP_REMINDER_WINDOW_DAYS } from '../data/hospitalData';

interface RemindersViewProps {
  currentUser?: any;
  patients: Patient[];
  prescriptions: Prescription[];
  reminders: FollowUpReminder[];
  onSendReminders?: () => number;
  onUpdateReminderStatus?: (id: number, status: 'SENT' | 'DELIVERED' | 'READ') => void;
}

const REMINDER_WINDOW_DAYS = FOLLOW_UP_REMINDER_WINDOW_DAYS;

const getFollowUpDate = (rx: Prescription): string | null => {
  if (rx.follow_up_date) return rx.follow_up_date;
  if (rx.follow_up_days) {
    try {
      const d = new Date(rx.prescription_date || new Date().toISOString().split('T')[0]);
      d.setDate(d.getDate() + Number(rx.follow_up_days));
      return d.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }
  return null;
};

const daysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};

const fmtDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const RemindersView: React.FC<RemindersViewProps> = ({
  currentUser,
  patients,
  prescriptions,
  reminders,
  onSendReminders,
  onUpdateReminderStatus
}) => {
  const isPatient = currentUser?.role === 'PATIENT';
  const isDoctor = currentUser?.role === 'DOCTOR';
  const isStaff = currentUser?.role === 'ADMIN' || currentUser?.role === 'RECEPTIONIST' || isDoctor;
  const patientUhid = currentUser?.patient_uhid?.trim().toUpperCase();
  const patientId = currentUser?.patient_id;

  const myPrescriptions = useMemo(() => {
    if (!isPatient) return prescriptions;
    return prescriptions.filter((rx) => {
      if (patientUhid && rx.patient_uhid?.trim().toUpperCase() === patientUhid) return true;
      if (patientId && rx.patient_id === patientId) return true;
      return false;
    });
  }, [prescriptions, isPatient, patientUhid, patientId]);

  const myReminders = useMemo(() => {
    if (!isPatient) return reminders;
    return reminders.filter((r) => {
      if (patientUhid && r.patient_uhid?.trim().toUpperCase() === patientUhid) return true;
      if (patientId && r.patient_id === patientId) return true;
      return false;
    });
  }, [reminders, isPatient, patientUhid, patientId]);

  const filteredReminders = isPatient ? myReminders : reminders;

  const dueQueue = useMemo(() => {
    return myPrescriptions
      .map((rx) => {
        const fud = getFollowUpDate(rx);
        if (!fud) return null;
        const days = daysUntil(fud);
        if (days < 0 || days > REMINDER_WINDOW_DAYS) return null;
        const alreadySent = filteredReminders.some(
          (r) => r.prescription_id === rx.id && r.follow_up_date === fud
        );
        const patient = patients.find((p) => p.id === rx.patient_id || p.uhid === rx.patient_uhid);
        return { rx, fud, days, alreadySent, phone: rx.phone || patient?.phone || '+91 98840 12345' };
      })
      .filter(Boolean)
      .sort((a, b) => (a?.days ?? 0) - (b?.days ?? 0)) as {
      rx: Prescription;
      fud: string;
      days: number;
      alreadySent: boolean;
      phone: string;
    }[];
  }, [myPrescriptions, patients, filteredReminders]);

  const nextFollowUp = useMemo(() => {
    return myPrescriptions
      .map((rx) => ({ rx, fud: getFollowUpDate(rx) }))
      .filter((x): x is { rx: Prescription; fud: string } => Boolean(x.fud) && daysUntil(x.fud!) >= 0)
      .sort((a, b) => daysUntil(a.fud) - daysUntil(b.fud))[0];
  }, [myPrescriptions]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
              Patient Follow-Up Reminder Centre
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredReminders.length} Sent
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {isPatient ? 'My Follow-Up Alerts' : 'Follow-Up Reminders (SMS / Call)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isPatient
              ? 'Scheduled follow-up visits and reminder messages sent to your registered mobile number.'
              : `Patients are auto-reminded ${REMINDER_WINDOW_DAYS} days before their follow-up date (e.g. follow-up 2026-09-14 → reminded from 2026-09-${String(14 - REMINDER_WINDOW_DAYS).padStart(2, '0')}).`}
          </p>
        </div>
        {isStaff && (
          <button
            onClick={() => {
              if (onSendReminders) {
                const count = onSendReminders();
                alert(count > 0 ? `✅ ${count} follow-up reminder(s) sent to patients.` : `ℹ️ No follow-ups are currently due for SMS / call reminder within the ${REMINDER_WINDOW_DAYS}-day window.`);
              }
            }}
            className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <i className="fa-solid fa-paper-plane"></i>
            <span>Send Follow-Up Reminders Now</span>
          </button>
        )}
      </div>

      {/* Patient: next follow-up summary card */}
      {isPatient && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-xs">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">My Next Follow-Up</div>
              {nextFollowUp ? (
                <>
                  <div className="text-sm font-bold text-emerald-900">
                    {fmtDate(nextFollowUp.fud)} with {nextFollowUp.rx.doctor_name}
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    {daysUntil(nextFollowUp.fud) === 0
                      ? 'Your follow-up is due TODAY. Please visit the hospital.'
                      : `In ${daysUntil(nextFollowUp.fud)} day(s) • ${nextFollowUp.rx.department} • ${nextFollowUp.rx.prescription_no}`}
                  </div>
                </>
              ) : (
                <div className="text-sm text-emerald-900">No upcoming follow-up scheduled.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: Due-soon queue (staff) / my next follow-ups (patient) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-bell text-sky-600"></i>
              Follow-Ups Due Now ({REMINDER_WINDOW_DAYS}-Day Window)
            </h3>
            <span className="text-[11px] font-mono font-bold bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
              {dueQueue.length} Due
            </span>
          </div>

          {dueQueue.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <i className="fa-solid fa-circle-check text-3xl text-slate-300 mb-2 block"></i>
              No follow-ups are due within the next {REMINDER_WINDOW_DAYS} days.
            </div>
          ) : (
            <div className="space-y-2.5">
              {dueQueue.map((item) => (
                <div key={item.rx.id} className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{item.rx.patient_name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.rx.patient_uhid} • {item.rx.prescription_no}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                        item.days <= 2
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {item.days === 0 ? 'Due TODAY' : `${item.days} day(s) left`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Follow-Up: <strong className="text-sky-800">{fmtDate(item.fud)}</strong> with {item.rx.doctor_name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">📱 {item.phone}</div>
                  <div
                    className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${
                      item.alreadySent
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.alreadySent ? <><i className="fa-solid fa-circle-check text-[9px]"></i> Reminder Sent</> : 'Not yet reminded'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Reminder log */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-message-sms text-emerald-600"></i>
                Reminder Message Log
              </h3>
            </div>
            <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              {filteredReminders.length} Sent
            </span>
          </div>

          {filteredReminders.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <i className="fa-solid fa-envelope-open-text text-3xl text-slate-300 mb-2 block"></i>
              No reminders sent yet. Click "Send Follow-Up Reminders Now" (staff) to dispatch due alerts.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Patient (UHID)</th>
                    <th className="p-3">Follow-Up Date</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Sent On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredReminders.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{r.patient_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.patient_uhid}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap font-medium text-sky-800">{fmtDate(r.follow_up_date)}</td>
                      <td className="p-3 font-mono text-[11px]">{r.patient_phone}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-200 bg-sky-50 text-sky-800">
                          <i className="fa-solid fa-mobile-screen-button text-[9px]"></i> {r.channel}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            onUpdateReminderStatus && onUpdateReminderStatus(r.id, r.status === 'SENT' ? 'DELIVERED' : 'READ')
                          }
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
                            r.status === 'READ'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : r.status === 'DELIVERED'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <i className={`fa-solid text-[9px] ${r.status === 'READ' ? 'fa-circle-check' : r.status === 'DELIVERED' ? 'fa-envelope-open-text' : 'fa-paper-plane'}`}></i>
                          {r.status}
                        </button>
                      </td>
                      <td className="p-3 text-right text-[11px] text-slate-500 whitespace-nowrap">{r.sent_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Previews of exact SMS text sent */}
          <div className="border-t border-slate-100 p-5 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sample Message Preview</div>
            {filteredReminders.slice(0, 2).map((r) => (
              <div key={r.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-700 leading-relaxed">
                📲 <strong>To {r.patient_phone}:</strong> "{r.message}"
              </div>
            ))}
            {filteredReminders.length === 0 && (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed">
                📲 Example: "Dear Aishwarya S, this is a friendly reminder from CareHub Hospital that your follow-up visit with Dr. R. Senthil Nathan is scheduled on 14 Sep 2026. Please visit us at your scheduled time. — CareHub Hospital"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};