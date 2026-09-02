import React, { useState, useEffect } from 'react';
import {
  Patient,
  Doctor,
  Appointment,
  Consultation,
  Prescription,
  Medicine,
  Invoice,
  Payment,
  AuditLog
} from './data/hospitalData';
import { dbService } from './services/db';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PublicHome } from './components/PublicHome';
import { PortalSidebar } from './components/PortalSidebar';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { DoctorsView } from './components/DoctorsView';
import { AppointmentsView } from './components/AppointmentsView';
import { ConsultationsView } from './components/ConsultationsView';
import { PrescriptionsView } from './components/PrescriptionsView';
import { MedicinesView } from './components/MedicinesView';
import { InvoicesView } from './components/InvoicesView';
import { PaymentsView } from './components/PaymentsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReportsView } from './components/ReportsView';
import { LoginModal } from './components/LoginModal';
import { DoctorDetailPage } from './components/DoctorDetailPage';
import { PatientApplicationTracker } from './components/PatientApplicationTracker';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedDoctorForPage, setSelectedDoctorForPage] = useState<Doctor | null>(null);
  const [doctorOrigin, setDoctorOrigin] = useState<'home' | 'portal'>('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginCategory, setLoginCategory] = useState<'STAFF' | 'PATIENT'>('STAFF');

  const handleOpenLogin = (category: 'STAFF' | 'PATIENT' = 'STAFF') => {
    setLoginCategory(category);
    setIsLoginModalOpen(true);
  };

  const handleBackFromDoctorDetail = () => {
    const origin = doctorOrigin;
    setSelectedDoctorForPage(null);
    if (origin === 'portal') {
      setActiveView('doctors');
    } else {
      setActiveView('home');
      setTimeout(() => {
        const el = document.getElementById('doctors');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }
  };

  // Core Hospital Database States (Stored and Synced neatly in Local Database)
  const [patients, setPatients] = useState<Patient[]>(() => dbService.getPatients());
  const [doctors] = useState<Doctor[]>(() => dbService.getDoctors());
  const [appointments, setAppointments] = useState<Appointment[]>(() => dbService.getAppointments());
  const [consultations, setConsultations] = useState<Consultation[]>(() => dbService.getConsultations());
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => dbService.getPrescriptions());
  const [medicines, setMedicines] = useState<Medicine[]>(() => dbService.getMedicines());
  const [invoices, setInvoices] = useState<Invoice[]>(() => dbService.getInvoices());
  const [payments, setPayments] = useState<Payment[]>(() => dbService.getPayments());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => dbService.getAuditLogs());
  const [notifications, setNotifications] = useState<any[]>(() => dbService.getNotifications());

  // Database Sync Effects
  useEffect(() => {
    dbService.savePatients(patients);
  }, [patients]);

  useEffect(() => {
    dbService.saveAppointments(appointments);
  }, [appointments]);

  useEffect(() => {
    dbService.saveConsultations(consultations);
  }, [consultations]);

  useEffect(() => {
    dbService.savePrescriptions(prescriptions);
  }, [prescriptions]);

  useEffect(() => {
    dbService.saveMedicines(medicines);
  }, [medicines]);

  useEffect(() => {
    dbService.saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    dbService.savePayments(payments);
  }, [payments]);

  useEffect(() => {
    dbService.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    dbService.saveNotifications(notifications);
  }, [notifications]);

  // Target states for seamless patient context flow between OPD dashboard, examination, and Rx
  const [targetConsultationPatient, setTargetConsultationPatient] = useState<{
    patientId?: number;
    patientName?: string;
    patientUhid?: string;
    doctorId?: number;
    symptoms?: string;
    autoOpenModal?: boolean;
  } | null>(null);

  const [targetPrescription, setTargetPrescription] = useState<{
    patientId?: number;
    doctorId?: number;
    diagnosis?: string;
    autoOpen?: boolean;
  } | null>(null);

  // Helper to record audit log
  const logAudit = (action: string, entityType: string, details: string) => {
    const newLog: AuditLog = {
      id: auditLogs.length + 1,
      user_name: currentUser?.full_name || 'System / Portal',
      action,
      entity_type: entityType,
      ip_address: '192.168.1.10 (Hospital Intranet)',
      details,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Seamless Doctor Examine flow
  const handleExaminePatient = (appt: Appointment) => {
    // Find or create patient record matching the exact appointment name
    let matchedPatient = patients.find(
      (p) =>
        (p.uhid && p.uhid === appt.patient_uhid) ||
        (p.id && p.id === appt.patient_id) ||
        p.full_name.trim().toLowerCase() === appt.patient_name.trim().toLowerCase()
    );

    if (!matchedPatient) {
      const newPatientId = patients.length + 1;
      const newUhid = appt.patient_uhid || `UHID-2026-${String(newPatientId).padStart(4, '0')}`;
      matchedPatient = {
        id: newPatientId,
        uhid: newUhid,
        full_name: appt.patient_name,
        phone: '+91 98840 12345',
        date_of_birth: '1995-05-15',
        age: 29,
        gender: 'Male',
        blood_group: 'B+',
        address: 'Chennai, Tamil Nadu',
        city: 'Chennai',
        state: 'Tamil Nadu',
        emergency_contact_name: 'Guardian / Relative',
        emergency_contact_phone: '+91 98840 54321',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setPatients((prev) => [matchedPatient!, ...prev]);
    }

    setTargetConsultationPatient({
      patientId: matchedPatient.id,
      patientName: matchedPatient.full_name,
      patientUhid: matchedPatient.uhid,
      doctorId: appt.doctor_id,
      symptoms: appt.symptoms || 'OPD Clinical Consultation',
      autoOpenModal: true
    });
    setActiveView('consultations');
  };

  const handleWritePrescription = (target: { patientId: number; doctorId: number; diagnosis: string }) => {
    setTargetPrescription({
      patientId: target.patientId,
      doctorId: target.doctorId,
      diagnosis: target.diagnosis,
      autoOpen: true
    });
    setActiveView('prescriptions');
  };

  // 1. Appointment Booking with Doctor Availability & Duplicate Booking Prevention
  const handleBookAppointment = async (apptData: any) => {
    const targetDoctor = doctors.find((d) => d.id === Number(apptData.doctor_id)) || doctors[0];

    // Check Doctor Availability on Selected Date
    if (apptData.appointment_date) {
      const availCheck = dbService.isDoctorAvailable(targetDoctor, apptData.appointment_date);
      if (!availCheck.available) {
        return {
          success: false,
          error: availCheck.reason || `${targetDoctor.full_name} is not available on this date.`
        };
      }
    }

    // Check for duplicate booking
    const duplicateCheck = dbService.checkDuplicateBooking(appointments, {
      doctor_id: targetDoctor.id,
      doctor_name: targetDoctor.full_name,
      patient_name: apptData.patient_name,
      patient_phone: apptData.patient_phone,
      patient_uhid: apptData.patient_uhid,
      appointment_date: apptData.appointment_date,
      appointment_time: apptData.appointment_time
    });

    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        error: duplicateCheck.message || 'Duplicate booking detected. Please select another slot.'
      };
    }

    const nextId = appointments.length + 1;
    const tokenNo = `APT-2026-${String(1000 + nextId)}`;

    // Ensure clean patient matching
    let patientUhid = apptData.patient_uhid;
    let patientId = apptData.patient_id;

    if (!patientUhid) {
      const existing = patients.find(
        (p) =>
          p.full_name.trim().toLowerCase() === apptData.patient_name.trim().toLowerCase() ||
          (apptData.patient_phone && p.phone === apptData.patient_phone)
      );

      if (existing && existing.full_name.trim().toLowerCase() === apptData.patient_name.trim().toLowerCase()) {
        patientUhid = existing.uhid;
        patientId = existing.id;
      } else {
        const newPatientId = patients.length + 1;
        patientUhid = `UHID-2026-${String(newPatientId).padStart(4, '0')}`;
        patientId = newPatientId;
        const newPatientObj: Patient = {
          id: newPatientId,
          uhid: patientUhid,
          full_name: apptData.patient_name,
          phone: apptData.patient_phone || '+91 98840 00000',
          date_of_birth: '1995-01-01',
          age: 30,
          gender: 'Not Specified',
          blood_group: 'B+',
          department: targetDoctor.department || 'General Medicine',
          assigned_doctor_id: targetDoctor.id,
          assigned_doctor_name: targetDoctor.full_name,
          bp: '120/80 mmHg',
          pulse: 76,
          temperature: '98.4 °F',
          spo2: '99%',
          allergies: 'NKDA',
          medical_history: 'OPD evaluation',
          address: 'Chennai',
          city: 'Chennai',
          state: 'Tamil Nadu',
          emergency_contact_name: 'Emergency Contact',
          emergency_contact_phone: apptData.patient_phone || '+91 98840 00000',
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        setPatients((prev) => [newPatientObj, ...prev]);
      }
    }

    const newAppt: Appointment = {
      id: nextId,
      appointment_no: tokenNo,
      patient_id: patientId,
      patient_name: apptData.patient_name,
      patient_uhid: patientUhid,
      doctor_id: targetDoctor.id,
      doctor_name: targetDoctor.full_name,
      department: targetDoctor.department,
      appointment_date: apptData.appointment_date,
      appointment_time: apptData.appointment_time,
      appointment_type: apptData.appointment_type || 'OPD Consultation',
      status: 'Confirmed',
      symptoms: apptData.symptoms || 'Booked online'
    };

    setAppointments((prev) => [newAppt, ...prev]);
    logAudit(
      'BOOKED_APPOINTMENT',
      'Appointment',
      `Reserved slot ${tokenNo} for ${apptData.patient_name} with ${targetDoctor.full_name} on ${apptData.appointment_date} at ${apptData.appointment_time}`
    );

    return { success: true, appointment_no: tokenNo };
  };

  const handleUpdateAppointmentStatus = (
    id: number,
    newStatus: 'Confirmed' | 'Completed' | 'Cancelled'
  ) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    logAudit('UPDATED_APPOINTMENT_STATUS', 'Appointment', `Appointment #${id} updated to ${newStatus}`);
  };

  const handleUpdateAppointment = async (updatedAppt: Appointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updatedAppt.id ? updatedAppt : a))
    );
    logAudit(
      'UPDATED_APPOINTMENT',
      'Appointment',
      `Updated appointment/token ${updatedAppt.appointment_no} for ${updatedAppt.patient_name} with ${updatedAppt.doctor_name}`
    );
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    const target = appointments.find((a) => a.id === appointmentId);
    setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
    logAudit(
      'DELETED_APPOINTMENT',
      'Appointment',
      `Permanently removed appointment token ${target?.appointment_no || `#${appointmentId}`} for ${target?.patient_name || 'Patient'}`
    );
  };

  // 2. Patient Registration, Update & Deletion
  const handleAddPatient = async (patientData: Patient) => {
    setPatients((prev) => [patientData, ...prev]);
    logAudit(
      'REGISTERED_PATIENT',
      'Patient',
      `Registered new patient ${patientData.full_name} with ${patientData.uhid}`
    );
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
    logAudit(
      'UPDATED_PATIENT_RECORD',
      'Patient',
      `Updated clinical and contact details for patient ${updatedPatient.full_name} (${updatedPatient.uhid})`
    );
  };

  const handleDeletePatient = async (patientId: number) => {
    const target = patients.find((p) => p.id === patientId);
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    logAudit(
      'DELETED_PATIENT_RECORD',
      'Patient',
      `Permanently removed patient record ${target?.full_name || `#${patientId}`} (${target?.uhid || ''})`
    );
  };

  // 3. Clinical Consultation
  const handleAddConsultation = async (conData: Consultation) => {
    const nextId = consultations.length + 1;
    const conObj = { ...conData, id: nextId };
    setConsultations((prev) => [conObj, ...prev]);
    logAudit(
      'RECORDED_CONSULTATION',
      'Consultation',
      `Recorded OPD examination & vitals for ${conData.patient_name} (${conData.patient_uhid})`
    );
  };

  const handleUpdateConsultation = async (updatedCon: Consultation) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === updatedCon.id ? updatedCon : c))
    );
    logAudit(
      'UPDATED_CONSULTATION',
      'Consultation',
      `Updated consultation diagnostic assessment for ${updatedCon.patient_name} (${updatedCon.patient_uhid})`
    );
  };

  const handleDeleteConsultation = async (conId: number) => {
    const target = consultations.find((c) => c.id === conId);
    setConsultations((prev) => prev.filter((c) => c.id !== conId));
    logAudit(
      'DELETED_CONSULTATION',
      'Consultation',
      `Permanently removed consultation record #${conId} for ${target?.patient_name || 'Patient'}`
    );
  };

  // 4. Digital Prescription (Rx)
  const handleAddPrescription = async (rxData: Prescription) => {
    setPrescriptions((prev) => [rxData, ...prev]);
    logAudit(
      'ISSUED_PRESCRIPTION',
      'Prescription',
      `Authorized digital prescription ${rxData.prescription_no} (Fee: ₹${rxData.total_amount?.toFixed(2) || '0.00'}) for ${rxData.patient_name}`
    );
  };

  const handleDeletePrescription = async (rxId: number) => {
    const target = prescriptions.find((p) => p.id === rxId);
    setPrescriptions((prev) => prev.filter((p) => p.id !== rxId));
    logAudit(
      'DELETED_PRESCRIPTION',
      'Prescription',
      `Deleted digital prescription ${target?.prescription_no || `#${rxId}`} for ${target?.patient_name || 'Patient'}`
    );
  };

  // 5. Internal Receptionist-to-Doctor Notifications
  const handleSendNotification = (notif: any) => {
    const nextId = notifications.length + 1;
    const newNotif = {
      ...notif,
      id: nextId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Unread'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateNotificationStatus = (id: number, status: 'Unread' | 'Read' | 'Attending') => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status } : n))
    );
  };

  // Full Receptionist Walk-in Patient Registration with Biological Vitals & Doctor Notification
  const handleReceptionistRegisterPatient = async (registrationData: {
    patientData: Partial<Patient>;
    doctorId: number;
    department: string;
    appointmentType?: string;
    symptoms?: string;
  }) => {
    // 1. Duplicate check
    const dupCheck = dbService.checkDuplicatePatient(patients, {
      phone: registrationData.patientData.phone || '',
      full_name: registrationData.patientData.full_name,
      uhid: registrationData.patientData.uhid
    });

    if (dupCheck.isDuplicate) {
      return {
        success: false,
        error: dupCheck.reason || 'Duplicate patient record found in database.',
        matchedPatient: dupCheck.matchedPatient
      };
    }

    // 2. Generate Patient ID & UHID
    const nextPatientId = patients.length + 1;
    const uhid = registrationData.patientData.uhid || `UHID-2026-${String(nextPatientId).padStart(4, '0')}`;
    const selectedDoctor = doctors.find((d) => d.id === Number(registrationData.doctorId)) || doctors[0];

    // Compute BMI if height and weight exist
    const hM = (registrationData.patientData.height_cm || 0) / 100;
    const wK = registrationData.patientData.weight_kg || 0;
    const calculatedBmi = hM > 0 && wK > 0 ? Number((wK / (hM * hM)).toFixed(1)) : undefined;

    const newPatient: Patient = {
      id: nextPatientId,
      uhid,
      full_name: registrationData.patientData.full_name || 'Patient',
      phone: registrationData.patientData.phone || '+91 98840 00000',
      email: registrationData.patientData.email || '',
      date_of_birth: registrationData.patientData.date_of_birth || '1995-01-01',
      age: Number(registrationData.patientData.age) || 30,
      gender: registrationData.patientData.gender || 'Male',
      blood_group: registrationData.patientData.blood_group || 'O+',
      department: registrationData.department || selectedDoctor.department || 'General Medicine',
      assigned_doctor_id: selectedDoctor.id,
      assigned_doctor_name: selectedDoctor.full_name,
      height_cm: registrationData.patientData.height_cm,
      weight_kg: registrationData.patientData.weight_kg,
      bmi: calculatedBmi || registrationData.patientData.bmi,
      bp_systolic: registrationData.patientData.bp_systolic,
      bp_diastolic: registrationData.patientData.bp_diastolic,
      bp: registrationData.patientData.bp || (registrationData.patientData.bp_systolic && registrationData.patientData.bp_diastolic ? `${registrationData.patientData.bp_systolic}/${registrationData.patientData.bp_diastolic} mmHg` : '120/80 mmHg'),
      pulse: registrationData.patientData.pulse || 74,
      temperature: registrationData.patientData.temperature || '98.4 °F',
      spo2: registrationData.patientData.spo2 || '99%',
      allergies: registrationData.patientData.allergies || 'No known drug allergies (NKDA)',
      medical_history: registrationData.patientData.medical_history || 'Routine OPD evaluation',
      address: registrationData.patientData.address || 'Chennai',
      city: registrationData.patientData.city || 'Chennai',
      state: 'Tamil Nadu',
      emergency_contact_name: registrationData.patientData.emergency_contact_name || 'Family Member',
      emergency_contact_phone: registrationData.patientData.emergency_contact_phone || registrationData.patientData.phone || '+91 98840 00000',
      registered_by: currentUser?.full_name ? `Reception Desk (${currentUser.full_name})` : 'Main Reception Desk',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setPatients((prev) => [newPatient, ...prev]);

    // 3. Issue OPD Token / Appointment for Doctor
    const nextApptId = appointments.length + 1;
    const deptPrefix = (newPatient.department.split(' ')[0] || 'OPD').toUpperCase().substring(0, 3);
    const tokenNo = `OPD-${deptPrefix}-${String(100 + nextApptId)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newAppt: Appointment = {
      id: nextApptId,
      appointment_no: tokenNo,
      patient_id: newPatient.id,
      patient_name: newPatient.full_name,
      patient_uhid: newPatient.uhid,
      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.full_name,
      department: newPatient.department,
      appointment_date: todayStr,
      appointment_time: 'Now (Walk-in)',
      appointment_type: registrationData.appointmentType || 'Walk-in OPD Consultation',
      status: 'Confirmed',
      symptoms: registrationData.symptoms || 'General clinical assessment'
    };

    setAppointments((prev) => [newAppt, ...prev]);

    // 4. Send Internal Notification to Assigned Doctor
    const vitalsSummary = `BP: ${newPatient.bp} | Pulse: ${newPatient.pulse} bpm | Temp: ${newPatient.temperature} | SpO2: ${newPatient.spo2} | Blood: ${newPatient.blood_group} | Allergies: ${newPatient.allergies}`;

    const newNotif = {
      id: notifications.length + 1,
      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.full_name,
      department: newPatient.department,
      patient_id: newPatient.id,
      patient_name: newPatient.full_name,
      patient_uhid: newPatient.uhid,
      token_no: tokenNo,
      message: `New Walk-in Patient registered by Reception: ${newPatient.full_name} (${newPatient.age}/${newPatient.gender}) in ${newPatient.department}. Assigned Token: ${tokenNo}.`,
      vitals_summary: vitalsSummary,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Unread' as const
    };

    setNotifications((prev) => [newNotif, ...prev]);

    logAudit(
      'RECEPTION_REGISTERED_PATIENT',
      'Patient',
      `Registered ${newPatient.full_name} (${newPatient.uhid}) in ${newPatient.department} with biological vitals. Dispatched token ${tokenNo} to ${selectedDoctor.full_name}.`
    );

    return {
      success: true,
      patient: newPatient,
      appointment: newAppt,
      notification: newNotif
    };
  };

  // 5. Medicine Master
  const handleAddMedicine = async (medData: Medicine) => {
    const nextId = medicines.length + 1;
    const medObj = { ...medData, id: nextId };
    setMedicines((prev) => [medObj, ...prev]);
    logAudit(
      'ADDED_MEDICINE_FORMULATION',
      'Medicine',
      `Added ${medData.medicine_name} (${medData.strength}) to pharmacy master formulary`
    );
  };

  // 6. Invoices & Billing
  const handleAddInvoice = async (invData: Invoice) => {
    setInvoices((prev) => [invData, ...prev]);
    logAudit(
      'GENERATED_TAX_INVOICE',
      'Invoice',
      `Issued 5% GST invoice ${invData.invoice_no} for amount ₹${invData.total_amount.toFixed(2)}`
    );
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    const target = invoices.find((i) => i.id === invoiceId);
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
    logAudit(
      'DELETED_TAX_INVOICE',
      'Invoice',
      `Deleted invoice ${target?.invoice_no || invoiceId} from billing ledger`
    );
  };

  const handleRecordPayment = async (payData: Payment) => {
    const nextId = payments.length + 1;
    const payObj = { ...payData, id: nextId };
    setPayments((prev) => [payObj, ...prev]);
    logAudit(
      'RECORDED_PAYMENT_SETTLEMENT',
      'Payment',
      `Recorded payment of ₹${payData.amount_paid.toFixed(2)} via ${payData.payment_mode} (Ref: ${payData.transaction_reference})`
    );
  };

  // Auth Handling
  const handleLogin = (user: any) => {
    setCurrentUser(user);
    if (user.role === 'PATIENT') {
      setActiveView('tracker');
    } else {
      setActiveView('dashboard');
    }
    logAudit('USER_LOGIN', 'Auth', `${user.full_name} (${user.role}) logged in successfully`);
  };

  const handleLogout = () => {
    if (currentUser) {
      logAudit('USER_LOGOUT', 'Auth', `${currentUser.full_name} logged out`);
    }
    setCurrentUser(null);
    setActiveView('home');
  };

  const isPortal = activeView !== 'home' && currentUser;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* If in Public Website Mode */}
      {!isPortal && (
        <>
          <Navbar
            onOpenLogin={handleOpenLogin}
            onNavigate={(v) => {
              setSelectedDoctorForPage(null);
              if (v === 'dashboard' && !currentUser) {
                handleOpenLogin('STAFF');
              } else {
                setActiveView(v);
              }
            }}
            activeView={activeView}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          <main className="flex-1">
            {selectedDoctorForPage ? (
              <DoctorDetailPage
                doctor={selectedDoctorForPage}
                onBack={() => {
                  setSelectedDoctorForPage(null);
                  setTimeout(() => {
                    const el = document.getElementById('doctors');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 60);
                }}
                onBookAppointment={handleBookAppointment}
              />
            ) : (
              <>
                <HeroSection doctors={doctors} onBookAppointment={handleBookAppointment} />
                <PublicHome
                  doctors={doctors}
                  onOpenBooking={() => {
                    const el = document.getElementById('book-appointment');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenLogin={handleOpenLogin}
                  onBookAppointmentDirect={handleBookAppointment}
                  onViewDoctorDetail={(doc) => {
                    setSelectedDoctorForPage(doc);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </>
            )}
          </main>
        </>
      )}

      {/* If in Staff/Patient Healthcare Portal Mode */}
      {isPortal && (
        <div className="flex flex-1 h-screen overflow-hidden bg-slate-50 print:block print:h-auto print:overflow-visible print:bg-white">
          <PortalSidebar
            currentUser={currentUser}
            currentView={activeView}
            onNavigate={(v) => setActiveView(v)}
            onLogout={handleLogout}
          />

          <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50/70 print:block print:h-auto print:overflow-visible print:bg-white print:p-0">
            {/* Portal Top Bar */}
            <header className="portal-top-bar bg-white border-b border-slate-200/80 px-6 py-3 flex justify-between items-center sticky top-0 z-30 print:hidden">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-slate-400">
                  MediTrack
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-800 capitalize">
                  {activeView.replace('-', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveView('home')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition shadow-xs"
                >
                  <i className="fa-solid fa-arrow-left text-slate-400 text-[11px]"></i> Public Website
                </button>
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                    {currentUser?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-slate-800 leading-tight">
                      {currentUser?.full_name || 'User'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium capitalize">
                      {currentUser?.role?.toLowerCase()}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Portal Body View */}
            <div className="p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full">
              {activeView === 'dashboard' && (
                <DashboardView
                  currentUser={currentUser}
                  patients={patients}
                  doctors={doctors}
                  appointments={appointments}
                  invoices={invoices}
                  prescriptions={prescriptions}
                  notifications={notifications}
                  onNavigate={(v) => setActiveView(v)}
                  onExaminePatient={handleExaminePatient}
                  onUpdateAppointment={handleUpdateAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  onUpdatePatient={handleUpdatePatient}
                  onDeletePatient={handleDeletePatient}
                  onReceptionistRegister={handleReceptionistRegisterPatient}
                  onUpdateNotificationStatus={handleUpdateNotificationStatus}
                />
              )}

              {activeView === 'tracker' && (
                <PatientApplicationTracker
                  currentUser={currentUser}
                  appointments={appointments}
                  patients={patients}
                  doctors={doctors}
                  consultations={consultations}
                  prescriptions={prescriptions}
                  invoices={invoices}
                  onUpdateStatus={handleUpdateAppointmentStatus}
                  onNavigate={(v) => setActiveView(v)}
                />
              )}

              {activeView === 'patients' && (
                <PatientsView
                  patients={patients}
                  doctors={doctors}
                  currentUser={currentUser}
                  onAddPatient={handleAddPatient}
                  onReceptionistRegister={handleReceptionistRegisterPatient}
                  onUpdatePatient={handleUpdatePatient}
                  onDeletePatient={handleDeletePatient}
                  onNavigate={(v) => setActiveView(v)}
                />
              )}

              {activeView === 'doctors' && (
                <DoctorsView
                  doctors={doctors}
                  onNavigate={(v) => setActiveView(v)}
                  onViewDoctorDetail={(doc) => {
                    setSelectedDoctorForPage(doc);
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {activeView === 'appointments' && (
                <AppointmentsView
                  appointments={appointments}
                  patients={patients}
                  doctors={doctors}
                  currentUser={currentUser}
                  onBookAppointment={handleBookAppointment}
                  onUpdateStatus={handleUpdateAppointmentStatus}
                  onUpdateAppointment={handleUpdateAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  onNavigate={(v) => setActiveView(v)}
                  onExaminePatient={handleExaminePatient}
                />
              )}

              {activeView === 'consultations' && (
                <ConsultationsView
                  consultations={consultations}
                  patients={patients}
                  doctors={doctors}
                  currentUser={currentUser}
                  targetPatient={targetConsultationPatient}
                  onClearTarget={() => setTargetConsultationPatient(null)}
                  onWritePrescription={handleWritePrescription}
                  onAddConsultation={handleAddConsultation}
                  onUpdateConsultation={handleUpdateConsultation}
                  onDeleteConsultation={handleDeleteConsultation}
                  onNavigate={(v) => setActiveView(v)}
                />
              )}

              {activeView === 'prescriptions' && (
                <PrescriptionsView
                  prescriptions={prescriptions}
                  patients={patients}
                  doctors={doctors}
                  medicines={medicines}
                  currentUser={currentUser}
                  targetRx={targetPrescription}
                  onClearTargetRx={() => setTargetPrescription(null)}
                  onAddPrescription={handleAddPrescription}
                  onDeletePrescription={handleDeletePrescription}
                  onNavigate={(v) => setActiveView(v)}
                />
              )}

              {activeView === 'medicines' && (
                <MedicinesView medicines={medicines} onAddMedicine={handleAddMedicine} />
              )}

              {activeView === 'invoices' && (
                <InvoicesView
                  invoices={invoices}
                  patients={patients}
                  doctors={doctors}
                  currentUser={currentUser}
                  onAddInvoice={handleAddInvoice}
                  onRecordPayment={handleRecordPayment}
                  onDeleteInvoice={handleDeleteInvoice}
                />
              )}

              {activeView === 'payments' && (
                <PaymentsView payments={payments} currentUser={currentUser} />
              )}

              {activeView === 'analytics' && <AnalyticsView />}

              {activeView === 'reports' && (
                <ReportsView
                  auditLogs={auditLogs}
                  patients={patients}
                  invoices={invoices}
                  medicines={medicines}
                />
              )}
            </div>
          </main>
        </div>
      )}

      {/* Global Login Modal with Staffs / Patient (Outsider) Separation */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        initialCategory={loginCategory}
      />
    </div>
  );
}
