import React from 'react';
import { Appointment, Doctor, Patient } from '../data/hospitalData';

interface AppointmentTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  patient?: Patient | null;
  doctor?: Doctor | null;
}

export const AppointmentTokenModal: React.FC<AppointmentTokenModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patient,
  doctor
}) => {
  if (!isOpen || !appointment) return null;

  // Validation: Doctor + Appointment Date + Appointment Time must be assigned and not 'Pending'
  const isDocValid = Boolean(
    appointment.doctor_name &&
    appointment.doctor_name !== 'Pending Assignment' &&
    appointment.doctor_id &&
    appointment.doctor_id > 0
  );
  const isDateValid = Boolean(
    appointment.appointment_date &&
    appointment.appointment_date !== 'Pending'
  );
  const isTimeValid = Boolean(
    appointment.appointment_time &&
    appointment.appointment_time !== 'Pending'
  );

  const isValid = isDocValid && isDateValid && isTimeValid;

  const handlePrint = () => {
    if (!isValid) {
      alert('Please assign a doctor appointment date and time before generating the token.');
      return;
    }
    window.print();
  };

  // The 8 mandatory fields
  const patientId = appointment.patient_uhid || patient?.uhid || 'UHID-2026-0001';
  const patientName = appointment.patient_name || patient?.full_name || 'Patient';
  const tokenNumber = appointment.appointment_no || `APT-2026-${appointment.id}`;
  const doctorName = appointment.doctor_name || doctor?.full_name || 'Dr. Consultant';
  const appointmentDate = appointment.appointment_date || 'Pending';
  const appointmentTime = appointment.appointment_time || appointment.time_slot || 'Pending';
  const location = appointment.patient_location || patient?.location || doctor?.room_number || 'Vadapalani';
  const specialty = appointment.specialty || appointment.department || doctor?.department || 'General Medicine';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Modal Header (Screen Only) */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center text-base">
              <i className="fa-solid fa-ticket"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Official OPD Appointment Token Pass
              </h3>
              <p className="text-[11px] text-slate-400">
                Token: {tokenNumber} • Patient: {patientName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isValid && (
              <button
                type="button"
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <i className="fa-solid fa-print"></i> Print Token
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 print:p-4 text-slate-800 text-xs">
          
          {!isValid ? (
            /* Warning Banner when Doctor/Date/Time is missing */
            <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl mx-auto">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h4 className="font-bold text-rose-950 text-sm sm:text-base">
                Incomplete Appointment Details
              </h4>
              <p className="text-xs text-rose-800 font-semibold max-w-md mx-auto">
                Please assign a doctor appointment date and time before generating the token.
              </p>
              <div className="bg-white p-3 rounded-lg border border-rose-200 text-left text-[11px] font-mono space-y-1 max-w-sm mx-auto">
                <div>Doctor: <strong className={isDocValid ? 'text-emerald-700' : 'text-rose-600'}>{appointment.doctor_name || 'Missing'}</strong></div>
                <div>Date: <strong className={isDateValid ? 'text-emerald-700' : 'text-rose-600'}>{appointment.appointment_date || 'Missing'}</strong></div>
                <div>Time Slot: <strong className={isTimeValid ? 'text-emerald-700' : 'text-rose-600'}>{appointment.appointment_time || 'Missing'}</strong></div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
              >
                Close &amp; Assign Doctor/Slot
              </button>
            </div>
          ) : (
            /* OFFICIAL PRINTABLE APPOINTMENT TOKEN SLIP */
            <div
              id="printable-appointment-token"
              className="border-2 border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 bg-white shadow-xs print:border-none print:p-0 print:m-0 print:w-full print-page-break-inside-avoid"
            >
              {/* Hospital Header */}
              <div className="flex items-start justify-between border-b-2 border-sky-900 pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#004b91] text-white flex flex-col items-center justify-center font-black p-1 leading-none shadow-xs print:bg-[#004b91]">
                    <span className="text-sm font-bold">+</span>
                    <span className="text-[7px] tracking-tighter uppercase font-bold">CAREHUB</span>
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-[#004b91] uppercase leading-tight">
                      CAREHUB MULTISPECIALITY HOSPITAL
                    </h1>
                    <p className="text-[10.5px] text-slate-600 font-medium">
                      NABH Accredited Tertiary Healthcare Center • 24x7 Helpline: 1066
                    </p>
                    <p className="text-[9.5px] text-slate-500 font-mono">
                      Hospital Branch: {location} • Tamil Nadu
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="bg-sky-950 text-white font-mono font-black text-xs px-2.5 py-1 rounded block uppercase">
                    OPD TOKEN PASS
                  </span>
                  <span className="text-[9.5px] text-emerald-800 font-bold block mt-1">
                    ✓ CONFIRMED
                  </span>
                </div>
              </div>

              {/* High-Visibility Token Number Box */}
              <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-300 rounded-xl p-3.5 text-center shadow-xs">
                <div className="text-[10px] uppercase font-extrabold text-sky-900 tracking-wider mb-0.5">
                  OPD Consultation Token Number
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">
                  {tokenNumber}
                </div>
                <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                  Present this token number at the OPD Consultation Desk / Doctor Room
                </div>
              </div>

              {/* The 8 Required Fields in Itemized Structure */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex justify-between items-center">
                  <span>Patient &amp; Appointment Schedule Record</span>
                  <span className="text-slate-400 font-mono font-normal">Ref #{appointment.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* 1. Patient ID */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Patient ID (UHID)</span>
                    <strong className="text-slate-900 font-mono text-sm">{patientId}</strong>
                  </div>

                  {/* 2. Patient Name */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">2. Patient Name</span>
                    <strong className="text-slate-900 text-sm">{patientName}</strong>
                    {appointment.patient_gender && (
                      <span className="text-[10.5px] text-slate-500 font-normal ml-1.5">
                        ({appointment.patient_gender})
                      </span>
                    )}
                  </div>

                  {/* 3. Token Number */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">3. Token Number</span>
                    <strong className="text-sky-900 font-mono text-sm font-black">{tokenNumber}</strong>
                  </div>

                  {/* 4. Doctor Name */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">4. Attending Doctor</span>
                    <strong className="text-blue-950 text-sm">{doctorName}</strong>
                    {doctor?.room_number && (
                      <span className="text-[10.5px] text-slate-500 block">Room: {doctor.room_number}</span>
                    )}
                  </div>

                  {/* 5. Appointment Date */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">5. Appointment Date</span>
                    <strong className="text-slate-900 font-mono text-sm">{appointmentDate}</strong>
                  </div>

                  {/* 6. Appointment Time */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">6. Appointment Time Slot</span>
                    <strong className="text-emerald-800 font-mono text-sm font-bold">{appointmentTime}</strong>
                  </div>

                  {/* 7. Location */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">7. Hospital Location</span>
                    <strong className="text-slate-900 text-sm">{location}</strong>
                  </div>

                  {/* 8. Specialty */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">8. Clinical Specialty</span>
                    <strong className="text-sky-800 text-sm">{specialty}</strong>
                  </div>
                </div>
              </div>

              {/* Consultation & Patient Guidelines */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <i className="fa-solid fa-circle-info text-amber-700"></i>
                  <span>Important Instructions for Patient:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                  <li>Please arrive 15 minutes before your scheduled time slot ({appointmentTime}).</li>
                  <li>Present this token slip at the Reception / Doctor Consultation Room ({location}).</li>
                  <li><strong>Payment Policy:</strong> The ₹700 consultation + ₹200 Clinical Nursing fee + applicable tax is payable at the Reception desk <strong>after</strong> your consultation with the doctor is completed.</li>
                </ul>
              </div>

              {/* Token Footer with Authentication */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                <div>
                  Generated: {new Date().toLocaleDateString('en-GB')} • CareHub Hospital System
                </div>
                <div className="text-right text-emerald-800 font-bold">
                  ✓ Valid Official Token
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions (Screen only) */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs print:hidden">
          <span className="text-slate-500 text-[11px]">
            {isValid ? 'Token confirmed and ready for print.' : 'Assign doctor, date and time to enable token.'}
          </span>
          <div className="flex gap-2">
            {isValid && (
              <button
                type="button"
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <i className="fa-solid fa-print"></i>
                <span>Print Official Token</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
