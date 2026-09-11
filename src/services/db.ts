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
  INITIAL_FOLLOW_UP_REMINDERS,
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
  FollowUpReminder
} from '../data/hospitalData';

const DB_KEYS = {
  PATIENTS: 'carehub_db_v11_patients',
  DOCTORS: 'carehub_db_v11_doctors',
  APPOINTMENTS: 'carehub_db_v11_appointments',
  CONSULTATIONS: 'carehub_db_v11_consultations',
  PRESCRIPTIONS: 'carehub_db_v11_prescriptions',
  MEDICINES: 'carehub_db_v11_medicines',
  INVOICES: 'carehub_db_v11_invoices',
  PAYMENTS: 'carehub_db_v11_payments',
  AUDIT_LOGS: 'carehub_db_v11_audit_logs',
  NOTIFICATIONS: 'carehub_db_v11_notifications',
  FOLLOW_UP_REMINDERS: 'carehub_db_v11_follow_up_reminders'
};

// Auto-purge any stale or legacy versioned keys (v1 through v9) to ensure 100% clean slate
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('carehub_db_') && !Object.values(DB_KEYS).includes(k)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
} catch (e) {
  console.warn('Storage purge error:', e);
}

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

  getMedicines: (): Medicine[] => {
    let medicines = loadTable<Medicine>(DB_KEYS.MEDICINES, []);

    const defaultNames = new Set(INITIAL_MEDICINES.map((m) => m.medicine_name));
    const storedByDefault = medicines.filter((m) => defaultNames.has(m.medicine_name));
    const storedByDefaultNames = new Set(storedByDefault.map((m) => m.medicine_name));
    const missingDefaults = INITIAL_MEDICINES.filter((dm) => !storedByDefaultNames.has(dm.medicine_name));
    const storedCustom = medicines.filter((m) => !defaultNames.has(m.medicine_name));

    const merged = [...storedByDefault, ...missingDefaults, ...storedCustom];

    if (typeof window !== 'undefined' && window.localStorage) {
      saveTable(DB_KEYS.MEDICINES, merged);
    }
    return merged;
  },
  saveMedicines: (data: Medicine[]): void => saveTable(DB_KEYS.MEDICINES, data),

  getInvoices: (): Invoice[] => loadTable<Invoice>(DB_KEYS.INVOICES, INITIAL_INVOICES),
  saveInvoices: (data: Invoice[]): void => saveTable(DB_KEYS.INVOICES, data),

  getPayments: (): Payment[] => loadTable<Payment>(DB_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (data: Payment[]): void => saveTable(DB_KEYS.PAYMENTS, data),

  getAuditLogs: (): AuditLog[] => loadTable<AuditLog>(DB_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  saveAuditLogs: (data: AuditLog[]): void => saveTable(DB_KEYS.AUDIT_LOGS, data),

  getNotifications: (): InternalNotification[] => loadTable<InternalNotification>(DB_KEYS.NOTIFICATIONS, INITIAL_INTERNAL_NOTIFICATIONS),
  saveNotifications: (data: InternalNotification[]): void => saveTable(DB_KEYS.NOTIFICATIONS, data),

  getFollowUpReminders: (): FollowUpReminder[] => loadTable<FollowUpReminder>(DB_KEYS.FOLLOW_UP_REMINDERS, INITIAL_FOLLOW_UP_REMINDERS),
  saveFollowUpReminders: (data: FollowUpReminder[]): void => saveTable(DB_KEYS.FOLLOW_UP_REMINDERS, data),

  /**
   * Reset all hospital records to a 100% clean slate
   */
  resetAllData: (): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.values(DB_KEYS).forEach((k) => localStorage.removeItem(k));
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('carehub_') || k.startsWith('carehub'))) {
            localStorage.removeItem(k);
          }
        }
      }
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch (e) {
      console.error('Failed to reset database:', e);
    }
  },

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
   * Fetch registered patient record by Contact Number or UHID in real-time
   */
  findPatientByContactOrUhid: (
    patients: Patient[],
    query: string
  ): Patient | undefined => {
    if (!query) return undefined;
    const cleanQuery = query.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '').slice(-10);

    return patients.find((p) => {
      // Exact UHID match
      if (p.uhid && p.uhid.toLowerCase() === cleanQuery) return true;
      // Phone number match (last 10 or 8+ digits)
      if (cleanDigits && cleanDigits.length >= 8) {
        const pDigits = p.phone?.replace(/\D/g, '').slice(-10);
        if (pDigits && (pDigits === cleanDigits || pDigits.endsWith(cleanDigits))) return true;
      }
      // Exact full name match fallback
      if (p.full_name && p.full_name.toLowerCase() === cleanQuery) return true;
      return false;
    });
  },

  /**
   * Validate Doctor Availability by selected date (Requirement 8: All days doctors are available)
   */
  isDoctorAvailable: (
    doctor: Doctor,
    dateString: string
  ): { available: boolean; reason?: string; dayName?: string } => {
    if (!dateString) return { available: true };
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return { available: true };

    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = dateObj.getDay();
    const fullDay = fullDays[dayIndex];

    // All doctors are available 7 days a week (Mon - Sun) across morning & evening OPD shifts
    return {
      available: true,
      dayName: fullDay,
      reason: `${doctor.full_name} is available on ${fullDay} (${doctor.opd_timing || 'OPD Hours'}).`
    };
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
  },

  /**
   * Available time slots catalog
   */
  getStandardTimeSlots: (): string[] => [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM'
  ],

  /**
   * Get doctor slots with booked status on a given date to prevent double-booking
   */
  getDoctorSlotsWithAvailability: (
    doctorId: number,
    dateString: string,
    appointments: Appointment[],
    excludeAppointmentId?: number
  ): { time: string; isBooked: boolean; bookedWithToken?: string; bookedPatientName?: string }[] => {
    const standardSlots = [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '12:00 PM',
      '12:30 PM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
      '05:00 PM',
      '05:30 PM'
    ];

    return standardSlots.map((time) => {
      const bookedAppt = appointments.find(
        (a) =>
          a.doctor_id === doctorId &&
          a.appointment_date === dateString &&
          (a.appointment_time === time || a.time_slot === time) &&
          a.status !== 'Cancelled' &&
          (!excludeAppointmentId || a.id !== excludeAppointmentId)
      );

      return {
        time,
        isBooked: Boolean(bookedAppt),
        bookedWithToken: bookedAppt?.appointment_no,
        bookedPatientName: bookedAppt?.patient_name
      };
    });
  }
};
