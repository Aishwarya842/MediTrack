import React, { useState } from 'react';

interface NavbarProps {
  onOpenLogin: (category?: 'STAFF' | 'PATIENT') => void;
  onNavigate: (view: string) => void;
  activeView: string;
  currentUser: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onNavigate,
  activeView,
  currentUser,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emergencyDropdownOpen, setEmergencyDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);

  return (
    <header className="w-full font-sans">
      {/* 1. Main Top White Brand Header (Logo + 35 Years Slogan + Emergency 24/7 Pill) */}
      <div className="bg-white border-b border-slate-200/80 py-2.5 sm:py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo with Sun Emblem */}
          <button
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none cursor-pointer group"
          >
            {/* MediConnect Sun & Heart Care Emblem */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform flex-shrink-0">
              <i className="fa-solid fa-sun text-2xl text-amber-100 animate-spin-slow"></i>
              <span className="absolute inset-0 flex items-center justify-center font-black text-[12px] text-orange-950 font-sans tracking-tighter">
                MC
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-display tracking-tight text-[#e66c00] group-hover:text-[#d35f00] transition-colors leading-none flex items-center gap-1.5">
                <span>MEDICONNECT</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-wider block mt-0.5 font-sans">
                VADAPALANI, CHENNAI • MULTISPECIALITY TERTIARY CARE
              </span>
            </div>
          </button>

          {/* Center Brand Slogan: 35 YEARS OF EXCELLENCE IN HEALTHCARE (Navigates to Legacy Section) */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="#legacy"
              onClick={(e) => {
                if (activeView !== 'home') {
                  onNavigate('home');
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[#e66c00] hover:text-[#c45a00] text-xs font-black tracking-wider uppercase font-sans transition-all cursor-pointer shadow-2xs group"
            >
              <i className="fa-solid fa-award text-amber-600 group-hover:scale-110 transition-transform"></i>
              <span>35 Years of Hospital Legacy</span>
              <i className="fa-solid fa-chevron-right text-[10px] text-amber-500 group-hover:translate-x-0.5 transition-transform"></i>
            </a>
          </div>

          {/* Right Action: Emergency 24/7 Dropdown & User / Portal Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 24/7 Emergency Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setEmergencyDropdownOpen(!emergencyDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border border-orange-400/90 hover:border-orange-500 bg-orange-50/70 hover:bg-orange-50 text-orange-800 text-xs sm:text-sm font-bold shadow-2xs transition cursor-pointer whitespace-nowrap"
              >
                <span className="px-2 py-0.5 min-w-[34px] h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap leading-none shrink-0 shadow-2xs">
                  24/7
                </span>
                <span className="font-extrabold text-orange-800">Emergency</span>
                <i className={`fa-solid fa-chevron-down text-[10px] text-orange-600 transition-transform shrink-0 ${emergencyDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {/* Emergency Casualty Popup Menu */}
              {emergencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                      <i className="fa-solid fa-truck-medical animate-pulse"></i> Emergency Ingress
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      24/7 Active
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <a
                      href="tel:1066"
                      className="flex items-center justify-between p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-xl font-bold transition whitespace-nowrap"
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-phone-volume text-rose-600"></i> Casualty Toll-Free
                      </span>
                      <span className="font-mono text-sm text-rose-700 font-black">1066</span>
                    </a>
                    <a
                      href="tel:+914424833444"
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl font-semibold transition whitespace-nowrap gap-4"
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-hospital text-slate-600"></i> Hospital Central Desk
                      </span>
                      <span className="font-mono text-xs text-slate-900 font-bold pl-4">+914424833444</span>
                    </a>
                    <a
                      href="tel:+917699997000"
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl font-semibold transition whitespace-nowrap"
                    >
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-ambulance text-orange-600"></i> Direct Helpline
                      </span>
                      <span className="font-mono text-xs text-slate-700">+91 7699997000</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* User Session / Logins */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <i className="fa-solid fa-chart-pie text-sky-400"></i>
                  <span>Portal</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="text-rose-600 hover:text-rose-700 text-xs font-bold px-2 py-1 rounded cursor-pointer"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <button
                  onClick={() => onOpenLogin('STAFF')}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-2xs transition cursor-pointer"
                >
                  <i className="fa-solid fa-user-shield text-sky-400 text-[10px]"></i> Staff Login
                </button>
                <button
                  onClick={() => onOpenLogin('PATIENT')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-2xs transition cursor-pointer"
                >
                  <i className="fa-solid fa-user text-white text-[10px]"></i> Patient
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Saffron / Orange Hospital Motto Strip */}
      <div className="bg-[#f37021] text-white py-1.5 px-4 text-center shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-xs sm:text-sm font-serif font-black tracking-wider uppercase text-amber-50">
          <span>Service to Mankind is Service to God</span>
        </div>
      </div>

      {/* 3. Deep Royal Navy Blue Main Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#004b91] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          
          {/* Left Menu Items (Pill style buttons matching Screenshot 1) */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            {/* Home (Active Vibrant Orange Pill) */}
            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
                activeView === 'home'
                  ? 'bg-[#f58220] text-white shadow-sm ring-1 ring-white/30'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Home
            </button>

            {/* About Us Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setAboutDropdownOpen(!aboutDropdownOpen);
                  setServiceDropdownOpen(false);
                }}
                className="px-4 py-1.5 rounded-full bg-white text-slate-800 hover:bg-slate-100 transition-all font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>About Us</span>
                <i className="fa-solid fa-chevron-down text-[10px] text-slate-500"></i>
              </button>

              {aboutDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 text-slate-800 z-50 animate-fadeIn">
                  <a
                    href="#legacy"
                    onClick={() => {
                      setAboutDropdownOpen(false);
                      if (activeView !== 'home') onNavigate('home');
                    }}
                    className="block px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
                  >
                    35 Years Hospital Legacy
                  </a>
                  <a
                    href="#centres"
                    onClick={() => setAboutDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Centres of Excellence
                  </a>
                  <a
                    href="#locations"
                    onClick={() => setAboutDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Hospital Branches & Locations
                  </a>
                  <a
                    href="#portfolio"
                    onClick={() => setAboutDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Infrastructure & Portfolio
                  </a>
                </div>
              )}
            </div>

            {/* Patients Service Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setServiceDropdownOpen(!serviceDropdownOpen);
                  setAboutDropdownOpen(false);
                }}
                className="px-4 py-1.5 rounded-full bg-white text-slate-800 hover:bg-slate-100 transition-all font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Patients Service</span>
                <i className="fa-solid fa-chevron-down text-[10px] text-slate-500"></i>
              </button>

              {serviceDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 text-slate-800 z-50 animate-fadeIn">
                  <a
                    href="#book-appointment"
                    onClick={() => setServiceDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Book Doctor Appointment
                  </a>
                  <a
                    href="#doctors"
                    onClick={() => setServiceDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Find a Specialist Doctor
                  </a>
                  <a
                    href="#packages"
                    onClick={() => setServiceDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Master Health Packages
                  </a>
                  <a
                    href="#testimonials"
                    onClick={() => setServiceDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Patient Testimonials & Reviews
                  </a>
                </div>
              )}
            </div>

            {/* Doctors Button (Matching White Pill Style) */}
            <a
              href="#doctors"
              onClick={() => {
                setAboutDropdownOpen(false);
                setServiceDropdownOpen(false);
                const el = document.getElementById('doctors');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-1.5 rounded-full bg-white text-slate-800 hover:bg-slate-100 transition-all font-bold shadow-xs whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <span>Doctors</span>
            </a>

            {/* Track Application & Status Button */}
            <button
              onClick={() => onOpenLogin('PATIENT')}
              className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-satellite-dish text-xs"></i>
              <span>Track Application</span>
            </button>

            {/* Hospital Portal Navigation */}
            {currentUser && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <i className="fa-solid fa-gauge-high"></i> Dashboard
              </button>
            )}
          </div>

          {/* Right Action: Contact Us Button with Diagonal Arrow Icon */}
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="px-5 py-2 rounded-xl bg-[#f58220] hover:bg-[#e07113] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all hover:scale-102 cursor-pointer whitespace-nowrap"
            >
              <span>Contact Us</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            </a>

            {!currentUser && (
              <div className="flex sm:hidden items-center gap-1.5">
                <button
                  onClick={() => onOpenLogin('STAFF')}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition"
                >
                  Staff
                </button>
                <button
                  onClick={() => onOpenLogin('PATIENT')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition"
                >
                  Patient
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#00386e] border-t border-white/10 px-4 py-4 space-y-3 animate-fadeIn text-sm font-semibold text-white">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg bg-[#f58220] text-white font-bold"
            >
              Home
            </button>
            <a
              href="#why-mediconnect"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-white/10"
            >
              About MediConnect (35 Yrs)
            </a>
            <a
              href="#centres"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-white/10"
            >
              Centres Of Excellence
            </a>
            <a
              href="#locations"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-white/10"
            >
              Branches & Locations
            </a>
            <a
              href="#doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-white/10"
            >
              Find a Doctor
            </a>
            <a
              href="#portfolio"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-white/10"
            >
              Hospital Portfolio
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-white/10"
            >
              Patient Reviews
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-white/10"
            >
              Contact Hospital
            </a>

            <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onOpenLogin('STAFF');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 bg-slate-900 text-white font-bold py-2 rounded-xl text-center text-xs"
              >
                Staff Login
              </button>
              <button
                onClick={() => {
                  onOpenLogin('PATIENT');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl text-center text-xs"
              >
                Patient Portal
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
