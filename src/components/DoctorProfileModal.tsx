import React from 'react';
import { Doctor } from '../data/hospitalData';

interface DoctorProfileModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onBookAppointment?: (doctorId: number) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  onClose,
  onBookAppointment
}) => {
  if (!doctor) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-slate-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              {doctor.image ? (
                <img
                  src={doctor.image}
                  alt={doctor.full_name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-sky-900 border border-sky-600/40 text-white flex items-center justify-center text-3xl font-bold">
                  {doctor.full_name.charAt(4) || 'D'}
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-xs flex items-center gap-1">
                <i className="fa-solid fa-circle-check text-[9px]"></i> VERIFIED
              </span>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-1.5">
                <i className="fa-solid fa-stethoscope text-[10px]"></i> {doctor.department}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{doctor.full_name}</h2>
              <p className="text-xs text-slate-300 mt-1 font-medium">{doctor.qualification}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-300">
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <i className="fa-solid fa-star text-amber-400"></i> {doctor.rating || 4.9}
                  <span className="text-slate-400 font-normal">({doctor.reviews_count || 320}+ Reviews)</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-medium">
                  <i className="fa-solid fa-briefcase text-sky-400 mr-1"></i>
                  {doctor.experience_years} Years Experience
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-slate-400 text-[11px]">
                  Reg: {doctor.registration_no}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Quick Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">OPD Consultation Fee</span>
              <span className="text-base font-extrabold text-slate-900">₹{doctor.consultation_fee}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">OPD Room</span>
              <span className="font-bold text-slate-800">{doctor.room_number}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[11px] font-medium">Available Days</span>
              <span className="font-semibold text-slate-800">{doctor.available_days}</span>
            </div>
          </div>

          {/* About / Clinical Bio */}
          {doctor.bio && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <i className="fa-solid fa-user-doctor text-sky-600"></i> Professional Biography
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                {doctor.bio}
              </p>
            </div>
          )}

          {/* Clinical Focus & Procedures */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <i className="fa-solid fa-hand-holding-medical text-sky-600"></i> Key Procedures & Clinical Focus
            </h3>
            {doctor.procedures && doctor.procedures.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {doctor.procedures.map((proc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200/70"
                  >
                    <i className="fa-solid fa-circle-check text-emerald-600 text-[10px]"></i> {proc}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600">{doctor.specialization}</p>
            )}
          </div>

          {/* OPD Timings & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100 text-xs space-y-1">
              <span className="text-sky-900 font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-clock text-sky-600"></i> OPD Consultation Hours
              </span>
              <p className="text-slate-700 font-medium">
                {doctor.opd_timing || '09:00 AM - 01:00 PM & 05:00 PM - 07:30 PM'}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-language text-slate-600"></i> Spoken Languages
              </span>
              <p className="text-slate-700 font-medium">
                {doctor.languages?.join(', ') || 'English, Tamil, Hindi'}
              </p>
            </div>
          </div>

          {/* Awards & Honors */}
          {doctor.awards && doctor.awards.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <i className="fa-solid fa-award text-amber-500"></i> Honors & Medical Awards
              </h3>
              <div className="space-y-1.5">
                {doctor.awards.map((award, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-slate-700 bg-amber-50/50 p-2 rounded-lg border border-amber-100"
                  >
                    <i className="fa-solid fa-medal text-amber-500"></i>
                    <span>{award}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Memberships */}
          {doctor.memberships && doctor.memberships.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Professional Memberships
              </h3>
              <p className="text-xs text-slate-600">
                {doctor.memberships.join(' • ')}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <i className="fa-solid fa-shield-halved text-emerald-600 mr-1"></i>
            Tamil Nadu Medical Council (TNMC) Reg: {doctor.registration_no}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                if (onBookAppointment) {
                  onBookAppointment(doctor.id);
                } else {
                  const el = document.getElementById('book-appointment');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <i className="fa-solid fa-calendar-check text-sky-400"></i> Book OPD Slot with Dr. {doctor.full_name.split(' ')[1] || doctor.full_name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
