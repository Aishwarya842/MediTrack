import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_CONSULTATIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_MEDICINES,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_INTERNAL_NOTIFICATIONS,
  Patient,
  Doctor,
  Appointment,
  Consultation,
  Prescription,
  Medicine,
  Invoice,
  Payment,
  AuditLog,
  InternalNotification
} from '../data/hospitalData';

const DB_KEYS = {
  PATIENTS: 'meditrack_db_v7_patients',
  DOCTORS: 'meditrack_db_v7_doctors',
  APPOINTMENTS: 'meditrack_db_v7_appointments',
  CONSULTATIONS: 'meditrack_db_v7_consultations',
  PRESCRIPTIONS: 'meditrack_db_v7_prescriptions',
  MEDICINES: 'meditrack_db_v7_medicines',
  INVOICES: 'meditrack_db_v7_invoices',
  PAYMENTS: 'meditrack_db_v7_payments',
  AUDIT_LOGS: 'meditrack_db_v7_audit_logs',
  NOTIFICATIONS: 'meditrack_db_v7_notifications'
};

function loadTable<T>(key: string, fallbackData: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      localStorage.setItem(key, JSON.stringify(fallbackData));
      return fallbackData;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallbackData;
  } catch (err) {
    console.error(`Error loading database table ${key}:`, err);
    return fallbackData;
  }
}

function saveTable<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving database table ${key}:`, err);
  }
}

export const dbService = {
  getPatients: (): Patient[] => loadTable<Patient>(DB_KEYS.PATIENTS, INITIAL_PATIENTS),
  savePatients: (data: Patient[]): void => saveTable(DB_KEYS.PATIENTS, data),

  getDoctors: (): Doctor[] => loadTable<Doctor>(DB_KEYS.DOCTORS, INITIAL_DOCTORS),
  saveDoctors: (data: Doctor[]): void => saveTable(DB_KEYS.DOCTORS, data),

  getAppointments: (): Appointment[] => loadTable<Appointment>(DB_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
  saveAppointments: (data: Appointment[]): void => saveTable(DB_KEYS.APPOINTMENTS, data),

  getConsultations: (): Consultation[] => loadTable<Consultation>(DB_KEYS.CONSULTATIONS, INITIAL_CONSULTATIONS),
  saveConsultations: (data: Consultation[]): void => saveTable(DB_KEYS.CONSULTATIONS, data),

  getPrescriptions: (): Prescription[] => loadTable<Prescription>(DB_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS),
  savePrescriptions: (data: Prescription[]): void => saveTable(DB_KEYS.PRESCRIPTIONS, data),

  getMedicines: (): Medicine[] => loadTable<Medicine>(DB_KEYS.MEDICINES, INITIAL_MEDICINES),
  saveMedicines: (data: Medicine[]): void => saveTable(DB_KEYS.MEDICINES, data),

  getInvoices: (): Invoice[] => loadTable<Invoice>(DB_KEYS.INVOICES, INITIAL_INVOICES),
  saveInvoices: (data: Invoice[]): void => saveTable(DB_KEYS.INVOICES, data),

  getPayments: (): Payment[] => loadTable<Payment>(DB_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (data: Payment[]): void => saveTable(DB_KEYS.PAYMENTS, data),

  getAuditLogs: (): AuditLog[] => loadTable<AuditLog>(DB_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  saveAuditLogs: (data: AuditLog[]): void => saveTable(DB_KEYS.AUDIT_LOGS, data),

  getNotifications: (): InternalNotification[] => loadTable<InternalNotification>(DB_KEYS.NOTIFICATIONS, INITIAL_INTERNAL_NOTIFICATIONS),
  saveNotifications: (data: InternalNotification[]): void => saveTable(DB_KEYS.NOTIFICATIONS, data),

  /**
   * Check for duplicate patient registration by Mobile Phone, UHID, or Name
   */
  checkDuplicatePatient: (
    existingPatients: Patient[],
    newPatient: {
      phone: string;
      full_name?: string;
      uhid?: string;
      excludePatientId?: number;
    }
  ): { isDuplicate: boolean; matchedPatient?: Patient; reason?: string } => {
    const cleanPhone = newPatient.phone?.replace(/\D/g, '').slice(-10);
    const cleanUhid = newPatient.uhid?.trim().toLowerCase();
    const cleanName = newPatient.full_name?.trim().toLowerCase();

    for (const p of existingPatients) {
      if (newPatient.excludePatientId && p.id === newPatient.excludePatientId) {
        continue;
      }

      // Check UHID exact match
      if (cleanUhid && p.uhid && p.uhid.trim().toLowerCase() === cleanUhid) {
        return {
          isDuplicate: true,
          matchedPatient: p,
          reason: `UHID already registered: ${p.full_name} (${p.uhid}).`
        };
      }

      // Check Mobile phone number match (10 digits)
      const existingDigits = p.phone?.replace(/\D/g, '').slice(-10);
      if (cleanPhone && cleanPhone.length >= 10 && existingDigits && existingDigits === cleanPhone) {
        return {
          isDuplicate: true,
          matchedPatient: p,
          reason: `Mobile Number Already Registered: Patient "${p.full_name}" is registered with phone ${p.phone} under UHID: ${p.uhid} (${p.department || 'General Medicine'}).`
        };
      }

      // Check Name exact match if provided
      if (cleanName && p.full_name && p.full_name.trim().toLowerCase() === cleanName && cleanPhone && cleanPhone.length >= 8 && existingDigits === cleanPhone) {
        return {
          isDuplicate: true,
          matchedPatient: p,
          reason: `Patient with same name and phone number already exists (${p.uhid}).`
        };
      }
    }

    return { isDuplicate: false };
  },

  /**
   * Validate Doctor Availability by selected date
   */
  isDoctorAvailable: (
    doctor: Doctor,
    dateString: string
  ): { available: boolean; reason?: string; dayName?: string } => {
    if (!dateString) return { available: true };
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return { available: true };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = dateObj.getDay();
    const shortDay = days[dayIndex];
    const fullDay = fullDays[dayIndex];

    const availableStr = doctor.available_days || 'Mon, Tue, Wed, Thu, Fri, Sat';
    
    // Check if Sunday and doctor not available on Sun
    if (shortDay === 'Sun' && !availableStr.toLowerCase().includes('sun')) {
      return {
        available: false,
        dayName: fullDay,
        reason: `${doctor.full_name} is NOT available on ${fullDay}s (OPD Closed). Available days: ${availableStr} (${doctor.opd_timing || 'Morning & Evening'}).`
      };
    }

    // Check specific days
    const isDayMatched =
      availableStr.toLowerCase().includes('all') ||
      availableStr.toLowerCase().includes(shortDay.toLowerCase());

    if (!isDayMatched) {
      return {
        available: false,
        dayName: fullDay,
        reason: `${doctor.full_name} is NOT available on ${fullDay}. Practicing Schedule: ${availableStr} (${doctor.opd_timing || 'OPD Hours'}).`
      };
    }

    return { available: true, dayName: fullDay };
  },

  /**
   * Check for duplicate appointments (same patient + doctor + date + time, or duplicate patient on same day/slot)
   */
  checkDuplicateBooking: (
    existingAppointments: Appointment[],
    newBooking: {
      doctor_id: number;
      doctor_name?: string;
      patient_name: string;
      patient_phone?: string;
      patient_uhid?: string;
      appointment_date: string;
      appointment_time: string;
    }
  ): { isDuplicate: boolean; message?: string } => {
    const cleanPatientName = newBooking.patient_name.trim().toLowerCase();
    const cleanUhid = newBooking.patient_uhid?.trim().toLowerCase();

    // 1. Check exact same slot clash for the doctor
    const doctorSlotClash = existingAppointments.find(
      (a) =>
        a.doctor_id === newBooking.doctor_id &&
        a.appointment_date === newBooking.appointment_date &&
        a.appointment_time === newBooking.appointment_time &&
        a.status !== 'Cancelled'
    );

    if (doctorSlotClash) {
      return {
        isDuplicate: true,
        message: `Slot Conflict: ${doctorSlotClash.doctor_name} is already booked on ${newBooking.appointment_date} at ${newBooking.appointment_time} (Token: ${doctorSlotClash.appointment_no}). Please select another slot.`
      };
    }

    // 2. Check duplicate appointment for the same patient on same date with same doctor
    const patientDuplicate = existingAppointments.find(
      (a) =>
        a.status !== 'Cancelled' &&
        a.appointment_date === newBooking.appointment_date &&
        a.doctor_id === newBooking.doctor_id &&
        (
          a.patient_name.trim().toLowerCase() === cleanPatientName ||
          (cleanUhid && a.patient_uhid.trim().toLowerCase() === cleanUhid)
        )
    );

    if (patientDuplicate) {
      return {
        isDuplicate: true,
        message: `Duplicate Booking Detected: Patient ${newBooking.patient_name} already has an active appointment with ${patientDuplicate.doctor_name} on ${newBooking.appointment_date} at ${patientDuplicate.appointment_time} (Token: ${patientDuplicate.appointment_no}).`
      };
    }

    return { isDuplicate: false };
  }
};
