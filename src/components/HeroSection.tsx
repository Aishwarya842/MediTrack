import React, { useState, useEffect } from 'react';
import { Doctor, babyFootMaternityImg } from '../data/hospitalData';
import { AntigravityCanvas } from './AntigravityCanvas';

// High Quality Clinical Hospital Imagery
import preventiveHeroImg from '../assets/images/doctor_consultation_warm_1788095063444.jpg';
import hospitalMainCampusImg from '../assets/images/hospital_campus_main_1788168982516.jpg';
import roboticSurgeryImg from '../assets/images/robotic_surgery_theatre_1788095034011.jpg';
import cardiacIcuImg from '../assets/images/cardiac_icu_cathlab_1788095048741.jpg';

interface HeroSectionProps {
  doctors: Doctor[];
  onBookAppointment: (apptData: any) => Promise<{ success: boolean; appointment_no?: string; error?: string }>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ doctors, onBookAppointment }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 0,
      title: 'Preventive Health And Wellness',
      description: 'Promoting healthier lifestyles through preventive care, comprehensive wellness packages, and long-term vitality management.',
      image: preventiveHeroImg,
      alt: 'Preventive Health and Wellness at MediConnect'
    },
    {
      id: 1,
      title: '35 Years of Excellence in Healthcare',
      description: 'Delivering trusted multispeciality clinical care with compassion, cutting-edge technology, and unwavering patient safety.',
      image: hospitalMainCampusImg,
      alt: 'MediConnect Vadapalani Campus'
    },
    {
      id: 2,
      title: 'Advanced Neonatal & Maternity Care',
      description: 'Tender newborn care, Level-III Neonatal Intensive Care Unit (NICU), high-risk obstetric monitoring, and painless delivery suites.',
      image: babyFootMaternityImg,
      alt: 'Tender Newborn Care and Maternity Suite at MediConnect'
    },
    {
      id: 3,
      title: 'Robotic & Minimally Invasive Surgery',
      description: 'Pioneering sub-millimeter robotic joint replacements and advanced laparoscopic surgical interventions for rapid recovery.',
      image: roboticSurgeryImg,
      alt: 'Robotic Surgical Theatre at MediConnect'
    },
    {
      id: 4,
      title: '24x7 Emergency & Critical Care',
      description: 'Equipped with digital cardiac Cath Lab, trauma emergency unit, and rapid ALS ambulance dispatch.',
      image: cardiacIcuImg,
      alt: 'Emergency and Critical Care ICU at MediConnect'
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const active = slides[currentSlide];

  return (
    <div
      className="relative w-full bg-slate-900 select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Hero Slide Carousel Stage */}
      <div className="relative w-full h-[450px] sm:h-[520px] lg:h-[600px] flex items-center">
        
        {/* Background Images Cross-Fade */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              referrerPolicy="no-referrer"
              className={`w-full h-full brightness-[0.88] contrast-[1.04] ${
                slide.id === 0
                  ? 'object-cover object-[center_8%]'
                  : 'object-cover object-center'
              }`}
            />
            {/* Soft Ambient Left Gradient Overlay that preserves clear visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent sm:w-2/3 lg:w-1/2" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
        ))}

        {/* Antigravity floating interactive particles */}
        <AntigravityCanvas className="z-15 opacity-60" />

        {/* Slide Content Box */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full relative z-20">
          <div className="max-w-2xl text-white space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans drop-shadow-md">
              {active.title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-100 font-medium leading-relaxed max-w-xl drop-shadow-sm">
              {active.description}
            </p>
          </div>
        </div>

        {/* Left Circular Orange Prev Button (<) */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f58220]/90 hover:bg-[#f58220] text-white flex items-center justify-center text-base sm:text-lg shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        {/* Right Circular Orange Next Button (>) */}
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f58220]/90 hover:bg-[#f58220] text-white flex items-center justify-center text-base sm:text-lg shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>

        {/* Bottom Slide Indicator Dots with Orange Active Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentSlide
                  ? 'w-7 h-2.5 bg-[#f58220]'
                  : 'w-2.5 h-2.5 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>

      </div>

      {/* 2. Dual Call-to-Action Action Buttons */}
      <div className="bg-white py-6 sm:py-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          
          {/* Button 1: Book an Appointment (Solid Orange) */}
          <a
            href="#book-appointment"
            className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-xl bg-[#f58220] hover:bg-[#e07113] text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-102 cursor-pointer text-center"
          >
            <i className="fa-regular fa-calendar-plus text-xl"></i>
            <span>Book an Appointment</span>
          </a>

          {/* Button 2: Find a Doctor (Solid Deep Navy Blue) */}
          <a
            href="#doctors"
            className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-xl bg-[#002a54] hover:bg-[#001f3f] text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all hover:scale-102 cursor-pointer text-center"
          >
            <i className="fa-solid fa-user-doctor text-xl"></i>
            <span>Find a Doctor</span>
          </a>

        </div>
      </div>
    </div>
  );
};
