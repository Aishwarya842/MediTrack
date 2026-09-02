import React, { useState } from 'react';
import { Doctor } from '../data/hospitalData';

interface DoctorsViewProps {
  doctors: Doctor[];
  onNavigate: (view: string) => void;
  onViewDoctorDetail?: (doctor: Doctor) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  doctors,
  onNavigate,
  onViewDoctorDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || d.department.toLowerCase().includes(selectedDept.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#e66c00] mb-1">
            MediConnect Clinical Directory
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#002a54] font-display tracking-tight">
            Medical Faculty & Specialist Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Verified Tamil Nadu Medical Council (TNMC) Registered Consultants with Dedicated Profile Pages
          </p>
        </div>
        <button
          onClick={() => onNavigate('appointments')}
          className="bg-[#f58220] hover:bg-[#e07113] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
        >
          <i className="fa-solid fa-calendar-plus text-white"></i>
          <span>Schedule OPD Appointment</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search by doctor name, specialty, or qualifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#f58220] outline-none text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="w-52">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#f58220] outline-none text-slate-700 bg-white font-medium"
          >
            <option value="All">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopaedics">Orthopaedics</option>
            <option value="Obstetrics">Obstetrics & Gyn</option>
            <option value="Nephrology">Nephrology</option>
            <option value="Paediatrics">Paediatrics</option>
            <option value="Gastroenterology">Gastroenterology</option>
            <option value="General Medicine">General Medicine</option>
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#f58220]/50 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Doctor Photo & Header */}
              <div className="relative bg-slate-900 overflow-hidden">
                <div className="h-64 bg-slate-800 overflow-hidden relative">
                  {doc.image ? (
                    <img
                      src={doc.image}
                      alt={doc.full_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#002a54] flex items-center justify-center font-bold text-3xl text-white">
                      {doc.full_name.charAt(4) || 'D'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <span className="inline-block px-2.5 py-0.5 bg-[#f58220] text-white text-[10px] font-black rounded uppercase tracking-wider mb-1.5 shadow-xs">
                    {doc.department}
                  </span>
                  <h3 className="font-bold text-base text-white truncate font-display leading-tight">
                    {doc.full_name}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono mt-0.5">
                    <span>Reg: {doc.registration_no}</span>
                    <span className="text-emerald-400 font-sans font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-5 space-y-3 text-xs text-slate-600">
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Degrees & Qualifications:</span>
                  <p className="text-slate-600 text-xs leading-relaxed mt-0.5">{doc.qualification}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Clinical Specialization:</span>
                  <p className="text-slate-600 text-xs leading-relaxed mt-0.5 line-clamp-2">{doc.specialization}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px] font-medium">Experience</span>
                    <span className="font-bold text-slate-900">{doc.experience_years} Years</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px] font-medium">OPD Room</span>
                    <span className="font-bold text-slate-900">{doc.room_number}</span>
                  </div>
                </div>

                <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-100/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-orange-950 font-medium">Consultation Days:</span>
                    <span className="font-bold text-slate-800">{doc.available_days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-950 font-medium">OPD Timings:</span>
                    <span className="font-bold text-slate-800">{doc.opd_timing || '09:00 AM - 01:00 PM'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Dedicated Profile Page Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  if (onViewDoctorDetail) {
                    onViewDoctorDetail(doc);
                  }
                }}
                className="flex-1 bg-[#002a54] hover:bg-[#001d3a] text-white font-bold text-xs py-2 rounded-xl transition text-center shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-user-doctor text-[11px]"></i>
                <span>View Full Page</span>
              </button>
              <button
                onClick={() => onNavigate('appointments')}
                className="flex-1 bg-[#f58220] hover:bg-[#e07113] text-white font-bold text-xs py-2 rounded-xl transition text-center shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="fa-regular fa-calendar-check text-[11px]"></i>
                <span>Book Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
