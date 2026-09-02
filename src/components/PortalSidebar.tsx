import React from 'react';

interface PortalSidebarProps {
  currentUser: any;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onLogout
}) => {
  const role = currentUser?.role || 'ADMIN';

  const menuItems = [
    { id: 'dashboard', label: role === 'PATIENT' ? 'My Health Overview' : 'Dashboard Overview', icon: 'fa-chart-pie', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'] },
    { id: 'tracker', label: role === 'PATIENT' ? 'Track My Application & Status' : 'Patient Application Status Tracker', icon: 'fa-satellite-dish', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'] },
    { id: 'patients', label: 'Patient Master Registry', icon: 'fa-hospital-user', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { id: 'doctors', label: 'Doctor Directory & Roster', icon: 'fa-user-doctor', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'] },
    { id: 'appointments', label: role === 'PATIENT' ? 'My Appointments & Tokens' : 'Appointments & Slot Tokens', icon: 'fa-calendar-check', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'] },
    { id: 'consultations', label: 'Clinical Consultations', icon: 'fa-stethoscope', roles: ['DOCTOR'] },
    { id: 'prescriptions', label: role === 'PATIENT' ? 'My Prescriptions (Rx)' : 'Digital Prescriptions (Rx)', icon: 'fa-prescription', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'] },
    { id: 'medicines', label: 'Pharmacy & Drug Formulary', icon: 'fa-pills', roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
    { id: 'invoices', label: role === 'PATIENT' ? 'My GST Hospital Invoices' : 'Billing & GST Invoices', icon: 'fa-file-invoice-dollar', roles: ['ADMIN', 'RECEPTIONIST', 'PATIENT'] },
    { id: 'payments', label: role === 'PATIENT' ? 'Payment Receipts' : 'Payments & Settlements', icon: 'fa-credit-card', roles: ['ADMIN', 'RECEPTIONIST', 'PATIENT'] },
    { id: 'analytics', label: 'Hospital Analytics', icon: 'fa-chart-line', roles: ['ADMIN'] },
    { id: 'reports', label: 'Audit Logs & Reports', icon: 'fa-file-lines', roles: ['ADMIN'] }
  ];

  const visibleMenu = menuItems.filter((item) => item.roles.includes(role));

  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return {
          title: 'ADMINISTRATOR',
          color: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: 'fa-shield-halved'
        };
      case 'DOCTOR':
        return {
          title: 'CONSULTANT DOCTOR',
          color: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: 'fa-user-doctor'
        };
      case 'RECEPTIONIST':
        return {
          title: 'OPD RECEPTIONIST',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: 'fa-headset'
        };
      case 'PATIENT':
      default:
        return {
          title: 'PATIENT (OUTSIDER)',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: 'fa-hospital-user'
        };
    }
  };

  const badge = getRoleBadge();

  return (
    <aside id="portal-sidebar" className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 flex-shrink-0 shadow-2xs print:hidden">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded-lg text-sm shadow-xs group-hover:bg-slate-800 transition">
            <i className="fa-solid fa-heart-pulse text-sky-400"></i>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
              MEDI TRACK
            </h2>
            <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
              {role === 'PATIENT' ? 'Patient Portal' : 'Hospital Intranet'}
            </span>
          </div>
        </button>
      </div>

      {/* User Profile Card */}
      <div className="p-3 mx-3 my-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
          {currentUser?.full_name?.charAt(0) || 'U'}
        </div>
        <div className="overflow-hidden flex-1">
          <div className="text-xs font-semibold text-slate-900 truncate leading-tight">
            {currentUser?.full_name || 'User'}
          </div>
          {currentUser?.patient_uhid && (
            <div className="text-[10px] text-emerald-700 font-mono font-medium truncate">
              {currentUser.patient_uhid}
            </div>
          )}
          {currentUser?.department && (
            <div className="text-[10px] text-slate-500 truncate">
              {currentUser.department}
            </div>
          )}
          <span
            className={`inline-flex items-center gap-1 text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded mt-0.5 border ${badge.color}`}
          >
            <i className={`fa-solid ${badge.icon}`}></i> {badge.title}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2.5 py-1 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2.5 py-1">
          {role === 'PATIENT' ? 'Patient Services' : 'Navigation'}
        </div>
        {visibleMenu.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <i
                className={`fa-solid ${item.icon} w-4 text-center text-xs ${
                  isActive ? 'text-sky-400' : 'text-slate-400'
                }`}
              ></i>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Nav */}
      <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50">
        <button
          onClick={() => onNavigate('home')}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-white hover:border hover:border-slate-200 transition cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left text-slate-400 text-[11px]"></i>
          <span>Main Hospital Website</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-700 hover:bg-rose-50 transition cursor-pointer"
        >
          <i className="fa-solid fa-right-from-bracket text-rose-500 text-[11px]"></i>
          <span>Sign Out / Switch Role</span>
        </button>
      </div>
    </aside>
  );
};
