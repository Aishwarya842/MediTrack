import React from 'react';
import { Receptionist } from '../data/hospitalData';

interface ReceptionistProfileModalProps {
  receptionist: Receptionist | null;
  onClose: () => void;
  onContactDesk?: (receptionist: Receptionist) => void;
}

export const ReceptionistProfileModal: React.FC<ReceptionistProfileModalProps> = ({
  receptionist,
  onClose,
  onContactDesk
}) => {
  if (!receptionist) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Receptionist Photo */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/30 shadow-lg">
                <img
                  src={receptionist.image}
                  alt={receptionist.full_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-xs flex items-center gap-1">
                <i className="fa-solid fa-circle text-[7px] animate-pulse"></i> {receptionist.status}
              </span>
            </div>

            {/* Basic Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 bg-[#f58220]/20 text-[#fca311] border border-[#f58220]/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                <i className="fa-solid fa-id-badge text-[10px]"></i> Front Desk Staff
              </div>
              <h2 className="text-2xl font-black text-white font-display tracking-tight">
                {receptionist.full_name}
              </h2>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                {receptionist.gender} • {receptionist.experience_years} Years Hospital Frontline Experience
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5 text-xs text-slate-300">
                <span className="bg-slate-800/80 px-2 py-0.5 rounded-md font-mono text-[11px] text-amber-300">
                  ID: {receptionist.employee_id}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 text-xs">
                  <i className="fa-solid fa-phone text-sky-400 mr-1"></i>
                  {receptionist.phone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Desk & Shift Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 space-y-1">
              <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider block">
                <i className="fa-solid fa-desktop text-sky-600 mr-1"></i> Assigned Desk / Counter
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {receptionist.desk}
              </p>
            </div>

            <div className="bg-orange-50/70 p-3.5 rounded-2xl border border-orange-100 space-y-1">
              <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wider block">
                <i className="fa-solid fa-clock text-orange-600 mr-1"></i> Duty Shift Timing
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {receptionist.shift}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <i className="fa-solid fa-circle-info text-sky-600"></i> Front Desk Role & Responsibilities
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              {receptionist.bio}
            </p>
          </div>

          {/* Languages & Contact */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <i className="fa-solid fa-language text-slate-500"></i> Spoken Languages
              </span>
              <div className="flex gap-1.5">
                {receptionist.languages.map((l, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white text-slate-800 text-xs font-semibold rounded-md border border-slate-200 shadow-2xs"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                Official Email: <strong className="text-slate-800">{receptionist.email}</strong>
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <i className="fa-solid fa-circle-check"></i> Verified Hospital Staff
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (onContactDesk) {
                onContactDesk(receptionist);
              } else {
                alert(`Connecting you to ${receptionist.full_name} at desk (${receptionist.phone}). Please visit ${receptionist.desk} on your arrival.`);
              }
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#002a54] hover:bg-[#001f3f] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-headset"></i>
            <span>Call Reception Extension</span>
          </button>
        </div>
      </div>
    </div>
  );
};
