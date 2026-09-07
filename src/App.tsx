import React, { useState, useEffect, useRef } from 'react';
import {
  Patient,
  Doctor,
  Appointment,
  Consultation,
  Prescription,
  Medicine,
  Invoice,
  Payment,
  AuditLog,
  InternalNotification,
  FollowUpReminder,
  OPD_CONSULTATION_FEE,
  IPD_PACKAGES,
  FOLLOW_UP_REMINDER_WINDOW_DAYS
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
import { RemindersView } from './components/RemindersView';
import { LoginModal } from './components/LoginModal';
import { DoctorDetailPage } from './components/DoctorDetailPage';
import { ConsultationFeeReceiptModal } from './components/ConsultationFeeReceiptModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedDoctorForPage, setSelectedDoctorForPage] = useState<Doctor | null>(null);
  const [doctorOrigin, setDoctorOrigin] = useState<'home' | 'portal'>('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginCategory, setLoginCategory] = useState<'STAFF' | 'PATIENT'>('STAFF');
  const [selectedApptForFeeReceipt, setSelectedApptForFeeReceipt] = useState<Appointment | null>(null);

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
  const [reminders, setReminders] = useState<FollowUpReminder[]>(() => dbService.getFollowUpReminders());

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

  useEffect(() => {
    dbService.saveFollowUpReminders(reminders);
  }, [reminders]);

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
    symptoms?: string;
    vitals?: { bp?: string; pulse?: number | string; temperature?: string; spo2?: string };
    notes?: string;
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
    // Flow Rule: Consultation proceeds first without upfront fee collection.
    // Fee (₹700 + tax) is collected at reception AFTER consultation completion.

    // Mark appointment as 'Consultation In Progress'
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appt.id
          ? {
              ...a,
              status: a.status === 'Consultation Completed' || a.status === 'Paid' ? a.status : 'Consultation In Progress'
            }
          : a
      )
    );

    // Find patient record strictly matching UHID, ID, or fallback to name
    let matchedPatient = patients.find(
      (p) =>
        (p.uhid && appt.patient_uhid && p.uhid.trim().toUpperCase() === appt.patient_uhid.trim().toUpperCase()) ||
        (p.id && appt.patient_id && p.id === appt.patient_id)
    );

    if (!matchedPatient && appt.patient_name) {
      matchedPatient = patients.find(
        (p) => p.full_name.trim().toLowerCase() === appt.patient_name.trim().toLowerCase()
      );
    }

    if (!matchedPatient) {
      const newPatientId = patients.length + 1;
      const newUhid = appt.patient_uhid || `UHID-2026-${String(newPatientId).padStart(4, '0')}`;
      matchedPatient = {
        id: newPatientId,
        uhid: newUhid,
        full_name: appt.patient_name,
        phone: appt.patient_phone || '+91 98840 12345',
        date_of_birth: '1995-05-15',
        age: appt.patient_age || 29,
        gender: appt.patient_gender || 'Prefer not to say',
        blood_group: 'B+',
        address: appt.patient_location || 'Chennai, Tamil Nadu',
        city: 'Chennai',
        state: 'Tamil Nadu',
        emergency_contact_name: 'Guardian / Relative',
        emergency_contact_phone: appt.patient_phone || '+91 98840 54321',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setPatients((prev) => [matchedPatient!, ...prev]);
    }

    setTargetConsultationPatient({
      patientId: matchedPatient.id,
      patientName: matchedPatient.full_name,
      patientUhid: matchedPatient.uhid,
      doctorId: appt.doctor_id,
      appointmentId: appt.id,
      symptoms: appt.symptoms || 'OPD Clinical Consultation',
      autoOpenModal: true
    });
    setActiveView('consultations');
  };

  const handleWritePrescription = (target: { patientId: number; doctorId: number; diagnosis: string; symptoms?: string; vitals?: { bp?: string; pulse?: number | string; temperature?: string; spo2?: string }; notes?: string }) => {
    setTargetPrescription({
      patientId: target.patientId,
      doctorId: target.doctorId,
      diagnosis: target.diagnosis,
      symptoms: target.symptoms,
      vitals: target.vitals,
      notes: target.notes,
      autoOpen: true
    });
    setActiveView('prescriptions');
  };


  // 1. Appointment Booking with Doctor Availability & Duplicate Booking Prevention
  const handleBookAppointment = async (apptData: any) => {
    const isOpdRegistration = Boolean(
      apptData.is_opd_registration ||
      (!apptData.doctor_id && (!apptData.appointment_date || apptData.appointment_date === 'Pending'))
    );

    // Patient Identity Guard: a returning phone number must match the patient's
    // registered name from their previous records. Mismatch = blocked. New phone = allowed (first-time user).
    const phoneDigits = String(apptData.patient_phone || apptData.phone || '').replace(/\D/g, '');
    if (phoneDigits && !apptData.patient_uhid && !apptData.patient_id) {
      const cleanName = String(
        apptData.patient_name || `${apptData.first_name || ''} ${apptData.last_name || ''}`
      ).trim().toLowerCase();
      const phoneCandidate = patients.find((p) => p.phone && p.phone.replace(/\D/g, '') === phoneDigits);
      if (phoneCandidate) {
        const nameMatches = cleanName && phoneCandidate.full_name.trim().toLowerCase() === cleanName;
        if (!nameMatches) {
          return {
            success: false,
            error: 'User already exists. This phone number is registered to a different patient name. Please use the name registered with this phone number.'
          };
        }
      }
    }

    // Resolve or find patient
    let patientUhid = apptData.patient_uhid;
    let patientId = apptData.patient_id;

    if (!patientUhid) {
      const cleanName = String(apptData.patient_name || `${apptData.first_name || ''} ${apptData.last_name || ''}`).trim().toLowerCase();
      const existing = patients.find(
        (p) =>
          p.full_name.trim().toLowerCase() === cleanName ||
          (apptData.patient_phone && p.phone.replace(/\D/g, '') === String(apptData.patient_phone).replace(/\D/g, ''))
      );

      if (existing) {
        patientUhid = existing.uhid;
        patientId = existing.id;
        const mergedPat: Patient = {
          ...existing,
          age: apptData.patient_age ? Number(apptData.patient_age) : existing.age,
          gender: apptData.patient_gender || existing.gender,
          location: apptData.patient_location || existing.location,
          date_of_birth: apptData.date_of_birth || existing.date_of_birth || '1995-01-01'
        };
        setPatients((prev) => prev.map((p) => (p.id === existing.id ? mergedPat : p)));
      } else {
        const nextPatientId = patients.length > 0 ? Math.max(...patients.map((p) => p.id)) + 1 : 1;
        patientUhid = `UHID-2026-${String(nextPatientId).padStart(4, '0')}`;
        patientId = nextPatientId;
        const newPatientObj: Patient = {
          id: nextPatientId,
          uhid: patientUhid,
          full_name: apptData.patient_name || `${apptData.first_name || ''} ${apptData.last_name || ''}`.trim() || 'Patient',
          phone: apptData.patient_phone || '+91 98840 00000',
          date_of_birth: apptData.date_of_birth || '1995-01-01',
          age: apptData.patient_age || 0,
          gender: apptData.patient_gender || 'Prefer not to say',
          blood_group: '',
          department: apptData.department || apptData.specialty || 'General Medicine',
          location: apptData.patient_location || 'Vadapalani',
          nature_of_health_issue: apptData.symptoms || 'OPD consultation',
          address: apptData.patient_location || 'Chennai',
          city: 'Chennai',
          state: 'Tamil Nadu',
          emergency_contact_name: 'Emergency Contact',
          emergency_contact_phone: apptData.patient_phone || '+91 98840 00000',
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        setPatients((prev) => [newPatientObj, ...prev]);
      }
    }

    const nextId = appointments.length > 0 ? Math.max(...appointments.map((a) => a.id)) + 1 : 1;
    const tokenNo = `APT-2026-${String(1000 + nextId)}`;
    const patName = apptData.patient_name || `${apptData.first_name || ''} ${apptData.last_name || ''}`.trim() || 'Patient';

    // If pure OPD Registration from "Make an Appointment": Doctor & Slot are unassigned (to be assigned by Receptionist)
    if (isOpdRegistration) {
      const specialtyName = apptData.specialty || apptData.department || 'General Medicine';
      const newAppt: Appointment = {
        id: nextId,
        appointment_no: tokenNo,
        patient_id: patientId!,
        patient_name: patName,
        patient_uhid: patientUhid!,
        patient_phone: apptData.patient_phone || '+91 98840 00000',
        patient_age: apptData.patient_age || undefined,
        patient_gender: apptData.patient_gender || 'Prefer not to say',
        patient_location: apptData.patient_location || 'Vadapalani',
        first_name: apptData.first_name,
        last_name: apptData.last_name,
        specialty: specialtyName,
        department: specialtyName,
        doctor_id: 0,
        doctor_name: 'Pending Assignment',
        appointment_date: 'Pending',
        appointment_time: 'Pending',
        appointment_type: 'OPD Consultation',
        status: 'Appointment Pending',
        consultation_completed: false,
        documents_ready: false,
        symptoms: apptData.symptoms || 'OPD consultation request',
        service_category: 'OPD Consultation',
        fee_amount: 700,
        payment_status: 'Unpaid (Pending at Reception)',
        consultation_unlocked: false,
        vitals_recorded: false,
        notes: `OPD Registration: Patient registered for ${specialtyName} in ${apptData.patient_location}. Doctor, Date & Time to be scheduled by Receptionist.`
      };

      setAppointments((prev) => [newAppt, ...prev]);

      // Internal Notification for Receptionist
      const recNotif: InternalNotification = {
        id: notifications.length + 1,
        doctor_id: 0,
        doctor_name: 'OPD Front Desk',
        department: specialtyName,
        patient_id: patientId!,
        patient_name: patName,
        patient_uhid: patientUhid!,
        token_no: tokenNo,
        recipient_role: 'RECEPTIONIST',
        fee_amount: 700,
        fee_text: '₹700.00',
        message: `🔔 New OPD Registration: Patient ${patName} (${patientUhid} - ${tokenNo}) registered for ${specialtyName} (${apptData.patient_location}). Receptionist action: Assign Doctor, Date & Time slot.`,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'Unread'
      };
      setNotifications((prev) => [recNotif, ...prev]);

      logAudit(
        'PATIENT_OPD_REGISTRATION',
        'Appointment',
        `Patient ${patName} (${patientUhid}) registered for OPD consultation (${specialtyName}, ${apptData.patient_location}). Token: ${tokenNo}. Status: Appointment Pending.`
      );

      return { success: true, appointment_no: tokenNo, appointment: newAppt };
    }

    // Standard Direct Booking with Doctor Assignment
    let targetDoctor = doctors.find((d) => d.id === Number(apptData.doctor_id));
    if (!targetDoctor && apptData.doctor_name) {
      const dNameClean = String(apptData.doctor_name).trim().toLowerCase();
      targetDoctor = doctors.find((d) => d.full_name.toLowerCase().includes(dNameClean));
    }
    if (!targetDoctor && apptData.department) {
      const deptClean = String(apptData.department).trim().toLowerCase();
      targetDoctor = doctors.find((d) => d.department.toLowerCase().includes(deptClean));
    }
    if (!targetDoctor) {
      targetDoctor = doctors[0];
    }

    // Check Doctor Availability on Selected Date
    if (apptData.appointment_date && apptData.appointment_date !== 'Pending') {
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
      patient_name: patName,
      patient_phone: apptData.patient_phone,
      patient_uhid: patientUhid,
      appointment_date: apptData.appointment_date,
      appointment_time: apptData.appointment_time
    });

    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        error: duplicateCheck.message || 'Duplicate booking detected. Please select another slot.'
      };
    }

    // Determine fee amount & whether OPD or IPD package
    const isIpd = Boolean(
      apptData.service_category === 'IPD Surgical & ICU' ||
      apptData.ipd_package_name ||
      (apptData.appointment_type && apptData.appointment_type.includes('IPD'))
    );
    const matchedIpd = isIpd && apptData.ipd_package_name
      ? IPD_PACKAGES.find((p) => p.title.toLowerCase().includes(apptData.ipd_package_name.toLowerCase()) || p.id === apptData.ipd_package_id)
      : null;
    const feeAmount = isIpd ? (apptData.fee_amount || matchedIpd?.fee || 175000) : OPD_CONSULTATION_FEE;
    const feeText = isIpd ? (apptData.fee_in_lakhs_text || matchedIpd?.feeInLakhsText || `₹${(feeAmount / 100000).toFixed(2)} Lakhs`) : '₹700.00';
    const serviceCategory = isIpd ? 'IPD Surgical & ICU' : 'OPD Consultation';

    const newAppt: Appointment = {
      id: nextId,
      appointment_no: tokenNo,
      patient_id: patientId!,
      patient_name: patName,
      patient_uhid: patientUhid!,
      patient_phone: apptData.patient_phone || '+91 98840 00000',
      patient_age: apptData.patient_age || undefined,
      patient_gender: apptData.patient_gender || 'Prefer not to say',
      patient_location: apptData.patient_location || 'Vadapalani',
      first_name: apptData.first_name,
      last_name: apptData.last_name,
      specialty: apptData.department || targetDoctor.department,
      doctor_id: targetDoctor.id,
      doctor_name: targetDoctor.full_name,
      department: targetDoctor.department,
      appointment_date: apptData.appointment_date,
      appointment_time: apptData.appointment_time || '10:00 AM',
      appointment_type: apptData.appointment_type || (isIpd ? 'IPD Inpatient Admission' : 'OPD Consultation'),
      status: 'Appointment Confirmed',
      consultation_completed: false,
      documents_ready: false,
      symptoms: apptData.symptoms || (isIpd ? `IPD: ${apptData.ipd_package_name || 'Inpatient Stay'}` : 'Booked online'),
      service_category: serviceCategory,
      ipd_package_name: apptData.ipd_package_name,
      fee_amount: feeAmount,
      fee_in_lakhs_text: isIpd ? feeText : undefined,
      payment_status: 'Unpaid (Pending at Reception)',
      consultation_unlocked: true,
      vitals_recorded: false
    };

    setAppointments((prev) => [newAppt, ...prev]);

    // Receptionist Notification
    const receptionistNotif: InternalNotification = {
      id: notifications.length + 1,
      doctor_id: targetDoctor.id,
      doctor_name: targetDoctor.full_name,
      department: targetDoctor.department,
      patient_id: patientId!,
      patient_name: patName,
      patient_uhid: patientUhid!,
      token_no: tokenNo,
      recipient_role: 'RECEPTIONIST',
      fee_amount: feeAmount,
      fee_text: feeText,
      message: `🔔 New OPD Appointment: ${patName} (${patientUhid} - ${tokenNo}) booked with ${targetDoctor.full_name} for ${apptData.appointment_date} at ${apptData.appointment_time || '10:00 AM'}.`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Unread'
    };
    setNotifications((prev) => [receptionistNotif, ...prev]);

    logAudit(
      'BOOKED_APPOINTMENT',
      'Appointment',
      `Registered appointment ${tokenNo} for ${patName} (${patientUhid}) with ${targetDoctor.full_name}. Status: Appointment Confirmed.`
    );

    return { success: true, appointment_no: tokenNo, appointment: newAppt };
  };

  // 1b. Receptionist assigns Doctor, Date & Time with Anti-Collision Check
  const handleAssignDoctorAndSlot = async (data: {
    appointmentId: number;
    patientId?: number;
    patientUhid?: string;
    patientName?: string;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    location?: string;
    specialty?: string;
    symptoms?: string;
  }): Promise<{ success: boolean; error?: string; appointment?: Appointment }> => {
    const targetAppt = data.appointmentId ? appointments.find((a) => a.id === data.appointmentId) : null;
    const doctorObj = doctors.find((d) => d.id === data.doctorId) || doctors[0];

    // Check doctor availability on the selected date
    const availCheck = dbService.isDoctorAvailable(doctorObj, data.appointmentDate);
    if (!availCheck.available) {
      return {
        success: false,
        error: availCheck.reason || `${doctorObj.full_name} is not available on ${data.appointmentDate}.`
      };
    }

    // Anti-collision check: prevent doctor double-booking
    const slotCollision = appointments.find(
      (a) =>
        (!targetAppt || a.id !== targetAppt.id) &&
        a.doctor_id === doctorObj.id &&
        a.appointment_date === data.appointmentDate &&
        (a.appointment_time === data.appointmentTime || a.time_slot === data.appointmentTime) &&
        a.status !== 'Cancelled'
    );

    if (slotCollision) {
      return {
        success: false,
        error: `Doctor Double-Booking Prevented: ${doctorObj.full_name} is already booked on ${data.appointmentDate} at ${data.appointmentTime} (Token: ${slotCollision.appointment_no}). Please choose another available slot.`
      };
    }

    let resolvedAppt: Appointment;
    if (targetAppt) {
      const updatedLocation = data.location || targetAppt.patient_location || 'Vadapalani';
      const updatedSpecialty = data.specialty || doctorObj.department;

      resolvedAppt = {
        ...targetAppt,
        doctor_id: doctorObj.id,
        doctor_name: doctorObj.full_name,
        department: doctorObj.department,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        time_slot: data.appointmentTime,
        patient_location: updatedLocation,
        specialty: updatedSpecialty,
        status: 'Appointment Confirmed',
        consultation_unlocked: true,
        notes: `Scheduled by Receptionist with ${doctorObj.full_name} at ${data.appointmentTime} on ${data.appointmentDate}`
      };

      setAppointments((prev) => prev.map((a) => (a.id === resolvedAppt.id ? resolvedAppt : a)));
    } else {
      const matchedPat = patients.find(
        (p) =>
          (data.patientId && p.id === data.patientId) ||
          (data.patientUhid && p.uhid.trim().toUpperCase() === data.patientUhid.trim().toUpperCase())
      );
      const nextId = appointments.length > 0 ? Math.max(...appointments.map((a) => a.id)) + 1 : 1;
      const tokenNo = `APT-2026-${String(1000 + nextId)}`;
      const patName = data.patientName || matchedPat?.full_name || 'Patient';
      const patUhid = data.patientUhid || matchedPat?.uhid || `UHID-2026-${String(1000 + nextId)}`;
      const patId = data.patientId || matchedPat?.id || nextId;
      const updatedLocation = data.location || matchedPat?.location || 'Vadapalani';
      const updatedSpecialty = data.specialty || doctorObj.department;

      resolvedAppt = {
        id: nextId,
        appointment_no: tokenNo,
        patient_id: patId,
        patient_name: patName,
        patient_uhid: patUhid,
        patient_phone: matchedPat?.phone || '+91 98840 00000',
        patient_gender: matchedPat?.gender || 'Prefer not to say',
        patient_location: updatedLocation,
        specialty: updatedSpecialty,
        doctor_id: doctorObj.id,
        doctor_name: doctorObj.full_name,
        department: doctorObj.department,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        time_slot: data.appointmentTime,
        appointment_type: 'OPD Consultation',
        status: 'Appointment Confirmed',
        consultation_completed: false,
        documents_ready: false,
        symptoms: data.symptoms || matchedPat?.nature_of_health_issue || 'OPD Consultation',
        service_category: 'OPD Consultation',
        fee_amount: 700,
        payment_status: 'Unpaid (Pending at Reception)',
        consultation_unlocked: true,
        vitals_recorded: false,
        notes: `Scheduled by Receptionist with ${doctorObj.full_name} at ${data.appointmentTime} on ${data.appointmentDate}`
      };

      setAppointments((prev) => [resolvedAppt, ...prev]);
    }

    // Update patient record
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === resolvedAppt.patient_id || p.uhid === resolvedAppt.patient_uhid) {
          return {
            ...p,
            assigned_doctor_id: doctorObj.id,
            assigned_doctor_name: doctorObj.full_name,
            department: resolvedAppt.specialty,
            location: resolvedAppt.patient_location
          };
        }
        return p;
      })
    );

    // Notify doctor
    const notif: InternalNotification = {
      id: notifications.length + 1,
      doctor_id: doctorObj.id,
      doctor_name: doctorObj.full_name,
      department: doctorObj.department,
      patient_id: resolvedAppt.patient_id,
      patient_name: resolvedAppt.patient_name,
      patient_uhid: resolvedAppt.patient_uhid,
      token_no: resolvedAppt.appointment_no,
      recipient_role: 'DOCTOR',
      fee_amount: resolvedAppt.fee_amount || 700,
      fee_text: '₹700.00',
      message: `📌 Confirmed Appointment: Patient ${resolvedAppt.patient_name} (${resolvedAppt.patient_uhid}) scheduled for consultation on ${data.appointmentDate} at ${data.appointmentTime} (${resolvedAppt.specialty}, ${resolvedAppt.patient_location}).`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Unread'
    };
    setNotifications((prev) => [notif, ...prev]);

    logAudit(
      'RECEPTIONIST_SCHEDULED_APPOINTMENT',
      'Appointment',
      `Receptionist assigned ${doctorObj.full_name} on ${data.appointmentDate} at ${data.appointmentTime} for ${resolvedAppt.patient_name} (${resolvedAppt.patient_uhid}). Status: Appointment Confirmed.`
    );

    return { success: true, appointment: resolvedAppt };
  };

  // 1c. Receptionist collects fixed OPD consultation fee (₹700 + tax) ONLY after consultation is completed
  const handleCollectOPDFee = async (collectionData: {
    appointmentId: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Insurance / TPA' | 'Net Banking';
    receptionistName?: string;
  }): Promise<{ success: boolean; error?: string; receiptNo?: string; appointment?: Appointment }> => {
    const targetAppt = appointments.find((a) => a.id === collectionData.appointmentId);
    if (!targetAppt) {
      return { success: false, error: 'Patient appointment record not found.' };
    }

    // Payment Rule: Must NOT collect before doctor completes consultation
    const isConsultCompleted =
      targetAppt.status === 'Consultation Completed' ||
      targetAppt.consultation_completed === true ||
      consultations.some((c) => (c.appointment_id && c.appointment_id === targetAppt.id) || (c.patient_uhid === targetAppt.patient_uhid && c.doctor_id === targetAppt.doctor_id));

    if (!isConsultCompleted) {
      return {
        success: false,
        error: 'Payment cannot be collected until the doctor completes the consultation.'
      };
    }

    // Prevent duplicate payment for same consultation
    if (targetAppt.payment_status === 'Paid') {
      return {
        success: false,
        error: 'Payment already completed for this consultation.'
      };
    }

    const currentTimeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const receiptNo = `REC-2026-${String(Math.floor(10000 + Math.random() * 90000))}`;
    const nextInvId = invoices.length > 0 ? Math.max(...invoices.map((i) => i.id)) + 1 : 1;
    const invNo = `INV-2026-${String(nextInvId).padStart(4, '0')}`;
    const feeAmount = 700;
    const nursingCharge = 200; // Clinical Nursing, Registration & Sanitization (SAC 999319)
    const taxAmount = Math.round((feeAmount + nursingCharge) * 0.05 * 100) / 100; // 5% Healthcare GST
    const totalAmount = feeAmount + nursingCharge + taxAmount; // ₹900 + ₹45 GST = ₹945
    const recName = collectionData.receptionistName || currentUser?.full_name || 'Front Desk Receptionist';

    // Update appointment
    const updatedAppt: Appointment = {
      ...targetAppt,
      status: 'Paid',
      payment_status: 'Paid',
      fee_amount: feeAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      receipt_no: receiptNo,
      payment_mode: collectionData.paymentMode as any,
      collected_by_receptionist: recName,
      collected_at: currentTimeStr,
      documents_ready: true
    };

    setAppointments((prev) => prev.map((a) => (a.id === updatedAppt.id ? updatedAppt : a)));

    // Create Invoice Record
    const newInvoice: Invoice = {
      id: nextInvId,
      invoice_no: invNo,
      appointment_id: targetAppt.id,
      patient_id: targetAppt.patient_id,
      patient_name: targetAppt.patient_name,
      patient_uhid: targetAppt.patient_uhid,
      patient_phone: targetAppt.patient_phone || '+91 98840 00000',
      patient_location: targetAppt.patient_location,
      doctor_id: targetAppt.doctor_id,
      doctor_name: targetAppt.doctor_name,
      department: targetAppt.department,
      invoice_date: currentTimeStr.split(' ')[0],
      consultation_time: targetAppt.appointment_time,
      consultation_fee: feeAmount,
      medicine_fee: 0,
      lab_fee: 0,
      additional_charges: nursingCharge,
      discount_amount: 0,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_status: 'Paid',
      payment_mode: collectionData.paymentMode,
      receipt_no: receiptNo,
      collected_by: recName
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // Create Payment Transaction Record
    const newPayment: Payment = {
      id: payments.length > 0 ? Math.max(...payments.map((p) => p.id)) + 1 : 1,
      receipt_no: receiptNo,
      invoice_id: newInvoice.id,
      patient_name: targetAppt.patient_name,
      patient_uhid: targetAppt.patient_uhid,
      payment_date: currentTimeStr,
      amount_paid: totalAmount,
      payment_mode: collectionData.paymentMode,
      transaction_reference:
        collectionData.paymentMode === 'UPI'
          ? `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/OPD`
          : `POS-REC-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'PAID'
    };
    setPayments((prev) => [newPayment, ...prev]);

    logAudit(
      'COLLECTED_OPD_FEE',
      'Payment',
      `Receptionist ${recName} collected OPD fee of ₹700 + ₹200 nursing/registration + ₹45 GST = ₹945 (${collectionData.paymentMode}) for ${targetAppt.patient_name} (${targetAppt.patient_uhid}). Receipt: ${receiptNo}. Documents unlocked for printing.`
    );

    return { success: true, receiptNo, appointment: updatedAppt };
  };

  // 1d. Mark patient records as printed
  const handleMarkRecordsPrinted = (appointmentId: number) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId ? { ...a, status: 'Printed', printed_at: new Date().toISOString() } : a
      )
    );
    logAudit('PRINTED_PATIENT_RECORDS', 'Documents', `Complete patient records package printed for appointment #${appointmentId}`);
  };

  const handleUpdateAppointmentStatus = (
    id: number,
    newStatus: 'Appointment Pending' | 'Appointment Confirmed' | 'Confirmed' | 'Completed' | 'Cancelled'
  ) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    logAudit('UPDATED_APPOINTMENT_STATUS', 'Appointment', `Appointment #${id} updated to ${newStatus}`);
  };

  const handleUpdateAppointment = async (updatedAppt: Appointment) => {
    const current = appointments.find((a) => a.id === updatedAppt.id);
    const frozen = current && (
      current.status === 'Consultation In Progress' ||
      current.status === 'Consultation Completed' ||
      current.status === 'Consultation Pending' ||
      current.status === 'Payment Pending' ||
      current.status === 'Paid' ||
      current.status === 'Receipt Generated' ||
      current.status === 'Documents Ready' ||
      current.status === 'Printed' ||
      current.status === 'Completed'
    );
    if (frozen) return;
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
    if (target && (
      target.status === 'Consultation In Progress' ||
      target.status === 'Consultation Completed' ||
      target.status === 'Consultation Pending' ||
      target.status === 'Payment Pending' ||
      target.status === 'Paid' ||
      target.status === 'Receipt Generated' ||
      target.status === 'Documents Ready' ||
      target.status === 'Printed' ||
      target.status === 'Completed'
    )) return;
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
    const conObj = { ...conData, id: nextId, status: 'Completed' as const };
    setConsultations((prev) => [conObj, ...prev]);

    // Advance linked appointment status to 'Consultation Completed' and 'Payment Pending'
    setAppointments((prev) =>
      prev.map((a) => {
        const isMatch =
          (conData.appointment_id && a.id === conData.appointment_id) ||
          (a.patient_id === conData.patient_id && (a.status === 'Consultation In Progress' || a.status === 'Consultation Pending' || a.status === 'Appointment Confirmed')) ||
          (conData.patient_uhid && a.patient_uhid === conData.patient_uhid && (a.status === 'Consultation In Progress' || a.status === 'Consultation Pending' || a.status === 'Appointment Confirmed'));

        if (isMatch) {
          return {
            ...a,
            status: 'Consultation Completed',
            consultation_completed: true,
            consultation_id: nextId,
            payment_status: a.payment_status === 'Paid' ? 'Paid' : 'Pending Payment'
          };
        }
        return a;
      })
    );

    // Notify Receptionist that consultation is completed and fee can be collected
    const doctorObj = doctors.find((d) => d.id === conData.doctor_id);
    const recNotif: InternalNotification = {
      id: notifications.length + 1,
      doctor_id: conData.doctor_id,
      doctor_name: conData.doctor_name,
      department: doctorObj?.department || 'OPD',
      patient_id: conData.patient_id,
      patient_name: conData.patient_name,
      patient_uhid: conData.patient_uhid,
      token_no: `CON-${nextId}`,
      recipient_role: 'RECEPTIONIST',
      fee_amount: 700,
      fee_text: '₹700.00',
      message: `✅ Consultation Completed: ${conData.doctor_name} completed consultation for ${conData.patient_name} (${conData.patient_uhid}). Diagnosis: ${conData.diagnosis}. Receptionist can now collect the OPD fee of ₹700 + tax at Payments & Settlements.`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Unread'
    };
    setNotifications((prev) => [recNotif, ...prev]);

    logAudit(
      'COMPLETED_CONSULTATION',
      'Consultation',
      `Dr. ${conData.doctor_name} completed OPD consultation for ${conData.patient_name} (${conData.patient_uhid}). Status: Consultation Completed. Payment unlocked.`
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

  // ---------- Follow-Up Reminder Engine (SMS / Call) ----------
  const REMINDER_WINDOW_DAYS = FOLLOW_UP_REMINDER_WINDOW_DAYS;

  const resolveFollowUpDate = (rx: Prescription): string | null => {
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

  const buildFollowUpSms = (rx: Prescription, fud: string, days: number, phone: string): FollowUpReminder => {
    const urgency =
      days === 0
        ? 'Your follow-up visit is DUE TODAY.'
        : days === 1
        ? 'Your follow-up visit is TOMORROW.'
        : `Your follow-up visit is scheduled in ${days} days.`;
    const leadDoctor = rx.doctor_name || 'your consultant doctor';
    return {
      id: 0,
      prescription_id: rx.id,
      prescription_no: rx.prescription_no || `RX-2026-${rx.id}`,
      patient_id: rx.patient_id,
      patient_name: rx.patient_name,
      patient_uhid: rx.patient_uhid,
      patient_phone: phone,
      doctor_id: rx.doctor_id,
      doctor_name: rx.doctor_name,
      department: rx.department || 'General Medicine',
      follow_up_date: fud,
      days_left: days,
      channel: days <= 1 ? 'Call' : 'SMS',
      message: `Dear ${rx.patient_name}, this is a friendly reminder from MediConnect Hospital that ${urgency} Please visit Dr. ${leadDoctor} on ${new Date(fud).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} for your follow-up review. For any queries, please contact our OPD reception. — MediConnect Hospital`,
      status: 'SENT',
      sent_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
  };

  const handleSendFollowUpReminders = (): number => {
    const nextBaseId = reminders.length > 0 ? Math.max(...reminders.map((r) => r.id)) + 1 : 1;
    const newReminders: FollowUpReminder[] = [];

    for (const rx of prescriptions) {
      const fud = resolveFollowUpDate(rx);
      if (!fud) continue;
      const days = daysUntil(fud);
      if (days < 0 || days > REMINDER_WINDOW_DAYS) continue;

      const alreadySent = reminders.some(
        (r) => r.prescription_id === rx.id && r.follow_up_date === fud
      );
      if (alreadySent) continue;

      const patient = patients.find((p) => (p.id === rx.patient_id) || (p.uhid && p.uhid.trim().toUpperCase() === rx.patient_uhid?.trim().toUpperCase()));
      const phone = rx.phone || patient?.phone || '+91 98840 12345';
      newReminders.push({ ...buildFollowUpSms(rx, fud, days, phone), id: nextBaseId + newReminders.length });
    }

    if (newReminders.length > 0) {
      setReminders((prev) => [...newReminders, ...prev]);
      logAudit(
        'SENT_FOLLOW_UP_REMINDERS',
        'Reminder',
        `Dispatched ${newReminders.length} follow-up reminder(s) via SMS/Call to patients due within the ${REMINDER_WINDOW_DAYS}-day window.`
      );
      newReminders.forEach((r) => {
        const notif: InternalNotification = {
          id: notifications.length + 1,
          doctor_id: r.doctor_id,
          doctor_name: r.doctor_name,
          department: r.department,
          patient_id: r.patient_id,
          patient_name: r.patient_name,
          patient_uhid: r.patient_uhid,
          token_no: r.prescription_no,
          recipient_role: 'RECEPTIONIST',
          fee_amount: 0,
          message: `📲 Follow-Up Reminder ${r.channel === 'Call' ? '(Call)' : '(SMS)'} dispatched to ${r.patient_name} (${r.patient_uhid}): Follow-up with ${r.doctor_name} on ${r.follow_up_date} (${r.days_left === 0 ? 'due today' : `${r.days_left} day(s) to go`}).`,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: 'Unread'
        };
        setNotifications((prev) => [notif, ...prev]);
      });
    }

    return newReminders.length;
  };

  const handleUpdateReminderStatus = (id: number, status: 'SENT' | 'DELIVERED' | 'READ') => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  // Auto-dispatch due follow-up reminders once on portal/app load
  const remindersAutoRan = useRef(false);
  useEffect(() => {
    if (remindersAutoRan.current) return;
    remindersAutoRan.current = true;
    if (typeof window !== 'undefined' && window.localStorage) {
      handleSendFollowUpReminders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Full Receptionist Walk-in Patient Registration with Biological Vitals & Doctor Notification
  const handleReceptionistRegisterPatient = async (registrationData: {
    patientData: Partial<Patient>;
    doctorId: number;
    department: string;
    appointmentType?: string;
    symptoms?: string;
    feeAmount?: number;
    paymentMode?: 'Cash' | 'UPI' | 'Card' | 'Insurance / TPA';
    serviceCategory?: 'OPD Consultation' | 'IPD Surgical & ICU';
    ipdPackageName?: string;
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

    // 2. Resolve Doctor with high precision
    let selectedDoctor = doctors.find((d) => d.id === Number(registrationData.doctorId));
    if (!selectedDoctor && registrationData.patientData.assigned_doctor_name) {
      const dNameClean = registrationData.patientData.assigned_doctor_name.trim().toLowerCase();
      selectedDoctor = doctors.find((d) => d.full_name.toLowerCase().includes(dNameClean));
    }
    if (!selectedDoctor && registrationData.department) {
      const deptClean = registrationData.department.trim().toLowerCase();
      selectedDoctor = doctors.find((d) => d.department.toLowerCase().includes(deptClean));
    }
    if (!selectedDoctor) {
      selectedDoctor = doctors[0];
    }

    // 3. Validate required biological details before registration
    const patientAge = Number(registrationData.patientData.age);
    const patientGender = (registrationData.patientData.gender || '').trim();
    if (!patientAge || patientAge <= 0 || !patientGender) {
      return {
        success: false,
        error: 'Patient age and gender are required for receptionist registration.'
      };
    }

    // 4. Generate Patient ID & UHID
    const nextPatientId = patients.length + 1;
    const uhid = registrationData.patientData.uhid || `UHID-2026-${String(nextPatientId).padStart(4, '0')}`;

    // Compute BMI if height and weight exist
    const hM = (registrationData.patientData.height_cm || 0) / 100;
    const wK = registrationData.patientData.weight_kg || 0;
    const calculatedBmi = hM > 0 && wK > 0 ? Number((wK / (hM * hM)).toFixed(1)) : undefined;

    const receptionistName = currentUser?.full_name || 'Ms. Aishwarya Sundaram';
    const currentTimeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newPatient: Patient = {
      id: nextPatientId,
      uhid,
      full_name: registrationData.patientData.full_name || 'Patient',
      phone: registrationData.patientData.phone || '+91 98840 00000',
      email: registrationData.patientData.email || '',
      date_of_birth: registrationData.patientData.date_of_birth || '1995-01-01',
      age: patientAge,
      gender: patientGender,
      blood_group: registrationData.patientData.blood_group || '',
      department: registrationData.department || selectedDoctor.department || 'General Medicine',
      assigned_doctor_id: selectedDoctor.id,
      assigned_doctor_name: selectedDoctor.full_name,
      height_cm: registrationData.patientData.height_cm || undefined,
      weight_kg: registrationData.patientData.weight_kg || undefined,
      bmi: calculatedBmi || registrationData.patientData.bmi || undefined,
      bp_systolic: registrationData.patientData.bp_systolic || undefined,
      bp_diastolic: registrationData.patientData.bp_diastolic || undefined,
      bp: registrationData.patientData.bp || (registrationData.patientData.bp_systolic && registrationData.patientData.bp_diastolic ? `${registrationData.patientData.bp_systolic}/${registrationData.patientData.bp_diastolic} mmHg` : undefined),
      pulse: registrationData.patientData.pulse || undefined,
      temperature: registrationData.patientData.temperature || undefined,
      spo2: registrationData.patientData.spo2 || undefined,
      allergies: registrationData.patientData.allergies || undefined,
      medical_history: registrationData.patientData.medical_history || undefined,
      address: registrationData.patientData.address || 'Chennai',
      city: registrationData.patientData.city || 'Chennai',
      state: 'Tamil Nadu',
      emergency_contact_name: registrationData.patientData.emergency_contact_name || 'Family Member',
      emergency_contact_phone: registrationData.patientData.emergency_contact_phone || registrationData.patientData.phone || '+91 98840 00000',
      registered_by: `Reception Desk (${receptionistName})`,
      created_at: currentTimeStr
    };

    setPatients((prev) => [newPatient, ...prev]);

    // Biological vitals summary (only recorded values, no fabricated defaults)
    const vitalsParts = [
      newPatient.bp ? `BP: ${newPatient.bp}` : '',
      newPatient.pulse ? `Pulse: ${newPatient.pulse} bpm` : '',
      newPatient.temperature ? `Temp: ${newPatient.temperature}` : '',
      newPatient.spo2 ? `SpO2: ${newPatient.spo2}` : '',
      newPatient.blood_group ? `Blood: ${newPatient.blood_group}` : '',
      newPatient.allergies ? `Allergies: ${newPatient.allergies}` : '',
      newPatient.medical_history ? `History: ${newPatient.medical_history}` : ''
    ].filter(Boolean).join(' | ');
    const hasVitals = vitalsParts.length > 0;
    const vitalsSummary = hasVitals ? vitalsParts : '';

    // 4. Issue OPD/IPD Token & collect fee
    const nextApptId = appointments.length + 1;
    const deptPrefix = (newPatient.department.split(' ')[0] || 'OPD').toUpperCase().substring(0, 3);
    const tokenNo = `OPD-${deptPrefix}-${String(100 + nextApptId)}`;
    const todayStr = currentTimeStr.split(' ')[0];

    const isIpd = Boolean(
      registrationData.serviceCategory === 'IPD Surgical & ICU' ||
      registrationData.ipdPackageName ||
      (registrationData.appointmentType && registrationData.appointmentType.includes('IPD'))
    );
    const matchedIpd = isIpd && registrationData.ipdPackageName
      ? IPD_PACKAGES.find((p) => p.title.toLowerCase().includes(registrationData.ipdPackageName!.toLowerCase()))
      : null;
    const feeAmount = registrationData.feeAmount || (isIpd ? (matchedIpd?.fee || 175000) : OPD_CONSULTATION_FEE);
    const feeText = isIpd ? (matchedIpd?.feeInLakhsText || `₹${(feeAmount / 100000).toFixed(2)} Lakhs`) : '₹700.00';

    const newAppt: Appointment = {
      id: nextApptId,
      appointment_no: tokenNo,
      patient_id: newPatient.id,
      patient_name: newPatient.full_name,
      patient_uhid: newPatient.uhid,
      patient_phone: newPatient.phone,
      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.full_name,
      department: newPatient.department,
      appointment_date: todayStr,
      appointment_time: 'Now (Walk-in)',
      appointment_type: registrationData.appointmentType || (isIpd ? 'Walk-in IPD Admission' : 'Walk-in OPD Consultation'),
      status: 'Confirmed',
      symptoms: registrationData.symptoms || 'General clinical assessment',
      service_category: isIpd ? 'IPD Surgical & ICU' : 'OPD Consultation',
      ipd_package_name: registrationData.ipdPackageName,
      fee_amount: feeAmount,
      fee_in_lakhs_text: isIpd ? feeText : undefined,
      payment_status: 'Unpaid (Pending at Reception)',
      consultation_unlocked: true,
      vitals_recorded: hasVitals,
      vitals_summary: hasVitals ? vitalsSummary : 'Vitals pending manual intake at Front Desk',
      height_cm: newPatient.height_cm,
      weight_kg: newPatient.weight_kg,
      bmi: newPatient.bmi,
      bp: newPatient.bp,
      bp_systolic: newPatient.bp_systolic,
      bp_diastolic: newPatient.bp_diastolic,
      pulse: newPatient.pulse,
      temperature: newPatient.temperature,
      spo2: newPatient.spo2,
      allergies: newPatient.allergies,
      medical_history: newPatient.medical_history
    };

    setAppointments((prev) => [newAppt, ...prev]);

    // 6. Send Internal Notification to Assigned Doctor: Patient registered, vitals recorded, fee payable after consultation
    const newNotif: InternalNotification = {
      id: notifications.length + 1,
      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.full_name,
      department: newPatient.department,
      patient_id: newPatient.id,
      patient_name: newPatient.full_name,
      patient_uhid: newPatient.uhid,
      token_no: tokenNo,
      recipient_role: 'DOCTOR',
      fee_amount: feeAmount,
      fee_text: feeText,
      message: hasVitals
        ? `✅ Patient ${newPatient.full_name} has been registered for ${newAppt.service_category} by Receptionist ${receptionistName}. Biological vitals recorded (${vitalsSummary}). Cleared for doctor consultation. OPD fee of ${feeText} will be collected at the reception after the consultation.`
        : `✅ Patient ${newPatient.full_name} has been registered for ${newAppt.service_category} by Receptionist ${receptionistName}. Biological vitals pending manual intake at the Front Desk. Cleared for doctor consultation. OPD fee of ${feeText} will be collected at the reception after the consultation.`,
      vitals_summary: vitalsSummary,
      created_at: currentTimeStr,
      status: 'Unread'
    };

    setNotifications((prev) => [newNotif, ...prev]);

    logAudit(
      'RECEPTION_REGISTERED',
      'Patient',
      `Receptionist ${receptionistName} registered ${newPatient.full_name}, assigned ${selectedDoctor.full_name} with token ${tokenNo}. OPD fee (${feeText}) to be collected at reception after consultation.`
    );

    return {
      success: true,
      patient: newPatient,
      appointment: newAppt,
      notification: newNotif
    };
  };

  // 6. Receptionist Collects Fee & Records Biological Vitals for Online Bookings
  const handleCollectReceptionFeeAndVitals = async (collectionData: {
    appointmentId: number;
    vitals: {
      height_cm?: number;
      weight_kg?: number;
      bmi?: number;
      bp?: string;
      bp_systolic?: number;
      bp_diastolic?: number;
      pulse?: number;
      temperature?: string;
      spo2?: string;
      blood_group?: string;
      allergies?: string;
      medical_history?: string;
    };
    feeAmount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Insurance / TPA';
    receptionistName?: string;
    pharmacyItems?: { medicineId?: number; medicineName: string; quantity: number; unitPrice: number }[];
    labFee?: number;
  }) => {
    const targetAppt = appointments.find((a) => a.id === collectionData.appointmentId);
    if (!targetAppt) {
      return { success: false, error: 'Appointment record not found.' };
    }

    // Payment Rule: Do not collect payment until doctor completes consultation
    const isConsultCompleted =
      targetAppt.status === 'Consultation Completed' ||
      targetAppt.consultation_completed === true ||
      consultations.some(
        (c) =>
          (c.appointment_id && c.appointment_id === targetAppt.id) ||
          (c.patient_uhid === targetAppt.patient_uhid && c.doctor_id === targetAppt.doctor_id)
      );

    if (!isConsultCompleted) {
      return {
        success: false,
        error: 'Payment cannot be collected until the doctor completes the consultation.'
      };
    }

    const receiptNo = `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const collectedBy = collectionData.receptionistName || currentUser?.full_name || 'Ms. Aishwarya Sundaram';
    const currentTimeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Calculate BMI
    const hM = (collectionData.vitals.height_cm || targetAppt.height_cm || 0) / 100;
    const wK = collectionData.vitals.weight_kg || targetAppt.weight_kg || 0;
    const computedBmi = hM > 0 && wK > 0 ? Number((wK / (hM * hM)).toFixed(1)) : collectionData.vitals.bmi;

    const bpStr = collectionData.vitals.bp ||
      (collectionData.vitals.bp_systolic && collectionData.vitals.bp_diastolic
        ? `${collectionData.vitals.bp_systolic}/${collectionData.vitals.bp_diastolic} mmHg`
        : targetAppt.bp || '');

    const recVitals = [
      bpStr ? `BP: ${bpStr}` : '',
      collectionData.vitals.pulse ? `Pulse: ${collectionData.vitals.pulse} bpm` : '',
      collectionData.vitals.temperature ? `Temp: ${collectionData.vitals.temperature}` : '',
      collectionData.vitals.spo2 ? `SpO2: ${collectionData.vitals.spo2}` : '',
      collectionData.vitals.blood_group ? `Blood: ${collectionData.vitals.blood_group}` : '',
      collectionData.vitals.height_cm && collectionData.vitals.weight_kg ? `BMI: ${computedBmi}` : ''
    ].filter(Boolean).join(' | ');
    const vitalsSummary = recVitals.length > 0 ? recVitals : 'No biological vitals re-recorded at settlement';

    const isIpd = Boolean(
      targetAppt.service_category === 'IPD Surgical & ICU' ||
      targetAppt.ipd_package_name ||
      (targetAppt.appointment_type && targetAppt.appointment_type.includes('IPD'))
    );
    const feeAmount = isIpd ? (collectionData.feeAmount || 175000) : 700;
    const nursingCharge = isIpd ? 0 : 200; // Clinical Nursing, Registration & Sanitization (SAC 999319)
    const medicineFee = (collectionData.pharmacyItems || []).reduce(
      (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
      0
    );
    const labFee = Number(collectionData.labFee) || 0;
    const chargeableSubtotal = feeAmount + nursingCharge + medicineFee + labFee;
    const taxAmount = Math.round(chargeableSubtotal * 0.05 * 100) / 100; // 5% Healthcare GST
    const totalAmount = chargeableSubtotal + taxAmount;
    const feeText = `₹${feeAmount} consultation + ₹${nursingCharge} nursing/registration + ₹${medicineFee.toFixed(2)} pharmacy + ₹${labFee.toFixed(2)} lab + ₹${taxAmount.toFixed(2)} GST = ₹${totalAmount.toFixed(2)}`;

    // 1. Update Appointment state
    const updatedAppt: Appointment = {
      ...targetAppt,
      status: 'Paid',
      payment_status: 'Paid',
      consultation_unlocked: true,
      vitals_recorded: vitalsSummary !== 'No biological vitals re-recorded at settlement',
      documents_ready: true,
      fee_amount: feeAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_mode: collectionData.paymentMode,
      receipt_no: receiptNo,
      collected_by_receptionist: collectedBy,
      collected_at: currentTimeStr,
      vitals_summary: vitalsSummary,
      height_cm: collectionData.vitals.height_cm || targetAppt.height_cm,
      weight_kg: collectionData.vitals.weight_kg || targetAppt.weight_kg,
      bmi: computedBmi || targetAppt.bmi,
      bp: bpStr || targetAppt.bp,
      bp_systolic: collectionData.vitals.bp_systolic || targetAppt.bp_systolic,
      bp_diastolic: collectionData.vitals.bp_diastolic || targetAppt.bp_diastolic,
      pulse: collectionData.vitals.pulse || targetAppt.pulse,
      temperature: collectionData.vitals.temperature || targetAppt.temperature,
      spo2: collectionData.vitals.spo2 || targetAppt.spo2,
      allergies: collectionData.vitals.allergies || targetAppt.allergies,
      medical_history: collectionData.vitals.medical_history || targetAppt.medical_history
    };

    setAppointments((prev) => prev.map((a) => (a.id === updatedAppt.id ? updatedAppt : a)));

    // 2. Update Patient Record EHR with biological vitals
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === targetAppt.patient_id || (targetAppt.patient_uhid && p.uhid.toUpperCase() === targetAppt.patient_uhid.toUpperCase())) {
          return {
            ...p,
            height_cm: collectionData.vitals.height_cm || p.height_cm,
            weight_kg: collectionData.vitals.weight_kg || p.weight_kg,
            bmi: computedBmi || p.bmi,
            bp: bpStr || p.bp,
            bp_systolic: collectionData.vitals.bp_systolic || p.bp_systolic,
            bp_diastolic: collectionData.vitals.bp_diastolic || p.bp_diastolic,
            pulse: collectionData.vitals.pulse || p.pulse,
            temperature: collectionData.vitals.temperature || p.temperature,
            spo2: collectionData.vitals.spo2 || p.spo2,
            blood_group: collectionData.vitals.blood_group || p.blood_group,
            allergies: collectionData.vitals.allergies || p.allergies,
            medical_history: collectionData.vitals.medical_history || p.medical_history
          };
        }
        return p;
      })
    );

    // 3. Create Billing Invoice & Payment Record
    const nextInvId = invoices.length + 1;
    const invNo = `INV-2026-${String(1000 + nextInvId)}`;
    const newInv: Invoice = {
      id: nextInvId,
      invoice_no: invNo,
      patient_id: targetAppt.patient_id,
      patient_name: targetAppt.patient_name,
      patient_uhid: targetAppt.patient_uhid,
      patient_phone: targetAppt.patient_phone || '+91 98840 00000',
      patient_location: targetAppt.patient_location,
      doctor_id: targetAppt.doctor_id,
      doctor_name: targetAppt.doctor_name,
      department: targetAppt.department,
      invoice_date: currentTimeStr.split(' ')[0],
      consultation_time: targetAppt.appointment_time,
      consultation_fee: feeAmount,
      medicine_fee: medicineFee,
      lab_fee: labFee,
      additional_charges: nursingCharge,
      discount_amount: 0,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_status: 'Paid',
      payment_mode: collectionData.paymentMode,
      receipt_no: receiptNo,
      collected_by: collectedBy
    };
    setInvoices((prev) => [newInv, ...prev]);

    // Deduct pharmacy stock for dispatched medicines
    if (collectionData.pharmacyItems?.length) {
      setMedicines((prev) =>
        prev.map((m) => {
          const issued = collectionData.pharmacyItems!.find((it) => it.medicineId === m.id);
          if (!issued) return m;
          const newStock = Math.max(0, m.stock_quantity - (Number(issued.quantity) || 0));
          return { ...m, stock_quantity: newStock === 0 ? 10000 : newStock };
        })
      );
    }

    const newPayment: Payment = {
      id: payments.length + 1,
      receipt_no: receiptNo,
      invoice_id: newInv.id,
      patient_name: targetAppt.patient_name,
      patient_uhid: targetAppt.patient_uhid,
      payment_date: currentTimeStr,
      amount_paid: totalAmount,
      payment_mode: collectionData.paymentMode,
      transaction_reference: `TXN-${receiptNo}`,
      status: 'Success'
    };
    setPayments((prev) => [newPayment, ...prev]);

    // 4. Dispatch Receipt Notification
    const doctorNotif: InternalNotification = {
      id: notifications.length + 1,
      doctor_id: targetAppt.doctor_id,
      doctor_name: targetAppt.doctor_name,
      department: targetAppt.department,
      patient_id: targetAppt.patient_id,
      patient_name: targetAppt.patient_name,
      patient_uhid: targetAppt.patient_uhid,
      token_no: targetAppt.appointment_no,
      recipient_role: 'DOCTOR',
      fee_amount: totalAmount,
      fee_text: feeText,
      message: `✅ Post-Consultation Fee Collected: Patient ${targetAppt.patient_name} paid ${feeText} (${collectionData.paymentMode}) to Receptionist ${collectedBy}. Official receipt: ${receiptNo}. Documents ready for printing.`,
      vitals_summary: vitalsSummary,
      created_at: currentTimeStr,
      status: 'Unread'
    };
    setNotifications((prev) => [doctorNotif, ...prev]);

    // Stock decrement audit trail
    if (collectionData.pharmacyItems?.length) {
      logAudit(
        'DISPENSED_PHARMACY_STOCK',
        'Inventory',
        `Pharmacy dispatched ${collectionData.pharmacyItems.length} item(s) to ${targetAppt.patient_name} (${targetAppt.patient_uhid}): ${collectionData.pharmacyItems
          .map((it) => `${it.medicineName} x${it.quantity}`)
          .join(', ')}. Stock levels decremented.`
      );
    }

    logAudit(
      'FEE_COLLECTED_AND_RECEIPT_ISSUED',
      'Appointment',
      `Receptionist ${collectedBy} collected post-consultation fee of ${feeText} (${receiptNo}) for ${targetAppt.patient_name} (${targetAppt.appointment_no}). Medical records and receipt unlocked.`
    );

    return {
      success: true,
      appointment: updatedAppt,
      receiptNo,
      notification: doctorNotif
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

  // Reset database to 100% clean slate
  const handleResetAllData = () => {
    if (
      window.confirm(
        '⚠️ Are you sure you want to reset all records?\n\nThis will purge all registered patients, appointments, clinical consultations, prescriptions, invoices, and payment receipts from local storage.'
      )
    ) {
      dbService.resetAllData();
      setPatients([]);
      setAppointments([]);
      setConsultations([]);
      setPrescriptions([]);
      setInvoices([]);
      setPayments([]);
      setNotifications([]);
      setMedicines([]);
      setAuditLogs([]);
      setReminders([]);
      logAudit('DATABASE_PURGE_CLEAN_SLATE', 'Database', 'Admin purged all hospital records');
      if (currentUser?.role === 'PATIENT') {
        setCurrentUser(null);
        setActiveView('home');
      }
      alert('✅ All patient and hospital records have been successfully reset.');
      // Force a full reload so every local table clears from everywhere with nothing retained.
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  // Auth Handling
  const handleLogin = (user: any) => {
    setCurrentUser(user);
    if (user.role === 'PATIENT') {
      setActiveView('dashboard');
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
                {currentUser?.role === 'DOCTOR' && (
                  <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-lg px-2.5 py-1 text-xs">
                    <span className="text-[11px] font-semibold text-sky-800 flex items-center gap-1">
                      <i className="fa-solid fa-stethoscope text-sky-600"></i> Doctor:
                    </span>
                    <select
                      value={currentUser?.doctor_id || doctors[0]?.id}
                      onChange={(e) => {
                        const targetDoc = doctors.find((d) => d.id === Number(e.target.value));
                        if (targetDoc) {
                          setCurrentUser({
                            username: targetDoc.full_name.toLowerCase().replace(/[^a-z]/g, ''),
                            role: 'DOCTOR',
                            full_name: targetDoc.full_name,
                            doctor_id: targetDoc.id,
                            department: targetDoc.department
                          });
                        }
                      }}
                      className="bg-white border border-sky-300 text-sky-950 font-semibold text-xs rounded-md px-2 py-0.5 outline-none cursor-pointer focus:ring-1 focus:ring-sky-500"
                    >
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name} ({d.department})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {(currentUser?.role === 'ADMIN' || currentUser?.role === 'RECEPTIONIST') && (
                  <>
                    <button
                      onClick={handleResetAllData}
                      title="Reset all patient and hospital records"
                      className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-50 transition shadow-2xs cursor-pointer"
                    >
                      <i className="fa-solid fa-rotate-left text-[11px]"></i>
                      <span className="hidden md:inline">Reset Clean Slate</span>
                    </button>
                  </>
                )}
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
                  medicines={medicines}
                  onNavigate={(v) => setActiveView(v)}
                  onExaminePatient={handleExaminePatient}
                  onUpdateAppointment={handleUpdateAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  onUpdatePatient={handleUpdatePatient}
                  onDeletePatient={handleDeletePatient}
                  onReceptionistRegister={handleReceptionistRegisterPatient}
                  onCollectReceptionFee={handleCollectReceptionFeeAndVitals}
                  onUpdateNotificationStatus={handleUpdateNotificationStatus}
                />
              )}

              {activeView === 'patients' && (
                <PatientsView
                  patients={patients}
                  doctors={doctors}
                  appointments={appointments}
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
                  onPrintFeeReceipt={(appt) => setSelectedApptForFeeReceipt(appt)}
                  onAssignDoctorAndSlot={handleAssignDoctorAndSlot}
                  invoices={invoices}
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
                  appointments={appointments}
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
                  appointments={appointments}
                  currentUser={currentUser}
                  onAddInvoice={handleAddInvoice}
                  onRecordPayment={handleRecordPayment}
                  onDeleteInvoice={handleDeleteInvoice}
                />
              )}

              {activeView === 'payments' && (
                <PaymentsView
                  payments={payments}
                  appointments={appointments}
                  invoices={invoices}
                  patients={patients}
                  doctors={doctors}
                  currentUser={currentUser}
                />
              )}

              {activeView === 'analytics' && (
                <AnalyticsView
                  patients={patients}
                  appointments={appointments}
                  consultations={consultations}
                  prescriptions={prescriptions}
                  invoices={invoices}
                />
              )}

              {activeView === 'reports' && (
                <ReportsView
                  auditLogs={auditLogs}
                  patients={patients}
                  invoices={invoices}
                  medicines={medicines}
                  appointments={appointments}
                  onResetAllData={handleResetAllData}
                />
              )}

              {activeView === 'reminders' && (
                <RemindersView
                  currentUser={currentUser}
                  patients={patients}
                  prescriptions={prescriptions}
                  reminders={reminders}
                  onSendReminders={handleSendFollowUpReminders}
                  onUpdateReminderStatus={handleUpdateReminderStatus}
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

      {/* Consultation Fee Receipt & Medical Bill Modal */}
      {selectedApptForFeeReceipt && (
        <ConsultationFeeReceiptModal
          isOpen={true}
          onClose={() => setSelectedApptForFeeReceipt(null)}
          appointment={selectedApptForFeeReceipt}
          invoice={invoices.find(
            (i) =>
              i.appointment_id === selectedApptForFeeReceipt.id ||
              i.opd_reg_no === selectedApptForFeeReceipt.opd_reg_no ||
              i.receipt_no === selectedApptForFeeReceipt.receipt_no
          )}
          patient={patients.find(
            (p) =>
              p.uhid === selectedApptForFeeReceipt.patient_uhid ||
              p.id === selectedApptForFeeReceipt.patient_id ||
              p.full_name === selectedApptForFeeReceipt.patient_name
          )}
          doctor={doctors.find(
            (d) =>
              d.id === selectedApptForFeeReceipt.doctor_id ||
              d.full_name === selectedApptForFeeReceipt.doctor_name
          )}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
