import React, { useState } from 'react';
import { Doctor } from '../data/hospitalData';

interface DoctorDetailPageProps {
  doctor: Doctor;
  onBack: () => void;
  onBookAppointment: (apptData: any) => Promise<{ success: boolean; appointment_no?: string; error?: string }>;
}

export const DoctorDetailPage: React.FC<DoctorDetailPageProps> = ({
  doctor,
  onBack,
  onBookAppointment
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedConfirmation, setBookedConfirmation] = useState<{
    appointmentNo: string;
    doctorName: string;
    department: string;
    date: string;
    time: string;
  } | null>(null);

  const availableSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:15 AM',
    '11:45 AM',
    '12:30 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:15 PM',
    '07:00 PM'
  ];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      alert('Please enter your full name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onBookAppointment({
        patient_name: patientName,
        phone: patientPhone,
        doctor_id: doctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        symptoms: symptoms || 'Outpatient Consultation'
      });

      if (res.success && res.appointment_no) {
        setBookedConfirmation({
          appointmentNo: res.appointment_no,
          doctorName: doctor.full_name,
          department: doctor.department,
          date: selectedDate,
          time: selectedTime
        });
      } else {
        alert(res.error || 'Failed to confirm slot. Please try another time.');
      }
    } catch {
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#002a54] bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg transition cursor-pointer border border-slate-200"
          >
            <i className="fa-solid fa-arrow-left text-xs text-[#f58220]"></i>
            <span>Back to Doctors</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button onClick={onBack} className="hover:text-[#002a54] cursor-pointer">
              MediConnect
            </button>
            <span>/</span>
            <button
              onClick={onBack}
              className="hover:underline hover:text-[#002a54] font-bold text-slate-700 cursor-pointer flex items-center gap-1"
            >
              <span>Doctors</span>
            </button>
            <span>/</span>
            <span className="font-bold text-[#002a54] truncate max-w-[180px] sm:max-w-none">
              {doctor.full_name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Doctor Header Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 lg:p-10 mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Doctor Portrait with Half-Body Frame */}
            <div className="relative flex-shrink-0 w-full sm:w-64 lg:w-72 mx-auto lg:mx-0">
              <div className="aspect-3/4 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200/90 shadow-lg relative">
                {doctor.image ? (
                  <img
                    src={doctor.image}
                    alt={doctor.full_name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-sky-900 flex items-center justify-center text-white text-5xl font-bold">
                    {doctor.full_name.charAt(4) || 'D'}
                  </div>
                )}
                {/* Verified Doctor Badge */}
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-xs"></i>
                  <span>Verified Senior Consultant</span>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="inline-block px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-full text-xs font-bold">
                  Reg. No: {doctor.registration_no}
                </span>
              </div>
            </div>

            {/* Doctor Core Credentials & Summary */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#f58220]/15 text-[#e66c00] border border-[#f58220]/30 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  <i className="fa-solid fa-stethoscope"></i> {doctor.department}
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
                  <i className="fa-solid fa-door-open mr-1"></i> OPD Room: {doctor.room_number}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
                  {doctor.full_name}
                </h1>
                <p className="text-sm sm:text-base font-semibold text-slate-600 mt-1">
                  {doctor.qualification}
                </p>
                <p className="text-xs sm:text-sm text-sky-800 font-bold mt-1">
                  Specialization: {doctor.specialization}
                </p>
              </div>

              {/* Badges Bar: Experience, Ratings, Fee */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                    Experience
                  </span>
                  <span className="text-lg font-black text-slate-900 font-display">
                    {doctor.experience_years}+ Years
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                    Patient Rating
                  </span>
                  <span className="text-lg font-black text-amber-600 font-display flex items-center gap-1">
                    <i className="fa-solid fa-star text-amber-500 text-sm"></i>
                    {doctor.rating || 4.9}
                    <span className="text-xs text-slate-400 font-normal">
                      ({doctor.reviews_count || 320})
                    </span>
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                    OPD Location
                  </span>
                  <span className="text-lg font-black text-slate-900 font-display">
                    {doctor.room_number}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                    OPD Days
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-1">
                    {doctor.available_days}
                  </span>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <i className="fa-solid fa-user-doctor text-sky-600"></i>
                  Clinical Background & Practice
                </h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
                  {doctor.bio}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Left (Full Clinical Details) & Right (Instant Appointment Booking Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Procedures, Awards, Memberships, Hours */}
          <div className="lg:col-span-7 space-y-6">
            {/* Procedures & Clinical Focus */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display flex items-center gap-2.5">
                <i className="fa-solid fa-kit-medical text-[#f58220]"></i>
                Specialised Clinical Procedures & Interventions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {doctor.procedures && doctor.procedures.length > 0 ? (
                  doctor.procedures.map((proc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 transition"
                    >
                      <i className="fa-solid fa-circle-check text-emerald-600 mt-0.5 flex-shrink-0"></i>
                      <span>{proc}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">{doctor.specialization}</p>
                )}
              </div>
            </div>

            {/* Awards & Honors */}
            {doctor.awards && doctor.awards.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display flex items-center gap-2.5">
                  <i className="fa-solid fa-trophy text-amber-500"></i>
                  Awards & Recognitions
                </h2>
                <div className="space-y-2.5">
                  {doctor.awards.map((award, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 flex items-center gap-3 text-xs sm:text-sm font-bold text-amber-950"
                    >
                      <i className="fa-solid fa-medal text-amber-600 text-base"></i>
                      <span>{award}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Memberships & Languages */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display flex items-center gap-2.5 mb-3">
                  <i className="fa-solid fa-certificate text-sky-600"></i>
                  Professional Memberships & Accreditations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.memberships && doctor.memberships.length > 0 ? (
                    doctor.memberships.map((mem, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200"
                      >
                        {mem}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Tamil Nadu Medical Council (TNMC)</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Languages Spoken
                  </span>
                  <div className="flex gap-2">
                    {doctor.languages?.map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-md border border-emerald-200"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    OPD Hours
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {doctor.opd_timing || '09:00 AM - 01:30 PM & 04:30 PM - 07:30 PM'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Direct Appointment Booking Dedicated on this Doctor's Page */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#f58220]/40 shadow-xl sticky top-20 space-y-6">
              
              {/* Form Title */}
              <div className="border-b border-slate-100 pb-4">
                <span className="inline-block bg-[#f58220]/15 text-[#e66c00] text-xs font-black uppercase px-2.5 py-0.5 rounded-full mb-1 tracking-wider font-sans">
                  Direct OPD Booking
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Book with {doctor.full_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your slot instantly with token generation
                </p>
              </div>

              {bookedConfirmation ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl shadow-md">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <span className="inline-block px-3 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider rounded-full mb-1">
                      Submitted!
                    </span>
                    <h4 className="text-lg font-black text-emerald-950 font-display">
                      Appointment Submitted & Confirmed!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Your consultation slot has been reserved in the hospital system.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Token / Ref No:</span>
                      <span className="font-mono font-black text-slate-900">
                        {bookedConfirmation.appointmentNo}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Doctor:</span>
                      <span className="font-bold text-slate-800">{bookedConfirmation.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Date & Time:</span>
                      <span className="font-bold text-slate-800">
                        {bookedConfirmation.date} at {bookedConfirmation.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Room:</span>
                      <span className="font-bold text-slate-800">{doctor.room_number}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1.5">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <i className="fa-solid fa-circle-check text-[10px]"></i> System Status:
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        Submitted & Active
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookedConfirmation(null)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Book Another Appointment
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Select Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Consultation Date *
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f58220]/50"
                    />
                  </div>

                  {/* Select Slot Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Available Time Slot *
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            selectedTime === slot
                              ? 'bg-[#f58220] text-white border-[#f58220] shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Patient Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f58220]/50"
                    />
                  </div>

                  {/* Patient Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (with +91) *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98840 12345"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f58220]/50"
                    />
                  </div>

                  {/* Symptoms / Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chief Symptoms / Consultation Reason (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Chest discomfort, BP checkup, routine review"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f58220]/50 resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#f58220] hover:bg-[#e07113] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fa-solid fa-circle-notch animate-spin"></i>
                        <span>Booking Consultation...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-regular fa-calendar-check"></i>
                        <span>Confirm Doctor Consultation</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-500 font-medium">
                    No advance online fee required. Registration and consultation fee will be declared at the Central Reception desk upon triage form submission.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Bottom Back Navigation Strip */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#002a54] hover:text-[#f58220] bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            <span>Back to Doctors</span>
          </button>

          <a
            href="#doctors"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Explore all 16 senior medical faculty members →
          </a>
        </div>
      </div>
    </div>
  );
};
