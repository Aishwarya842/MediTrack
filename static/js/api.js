/**
 * =============================================================================
 * MEDI TRACK – Integrated Patient Care Management System
 * REST API Client (Fetch API & Storage Layer)
 * =============================================================================
 */

const API = {
  // Base token helper
  getToken() {
    return localStorage.getItem("meditrack_token") || "";
  },

  getCurrentUser() {
    const raw = localStorage.getItem("meditrack_user");
    return raw ? JSON.parse(raw) : null;
  },

  setAuth(token, user) {
    localStorage.setItem("meditrack_token", token);
    localStorage.setItem("meditrack_user", JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem("meditrack_token");
    localStorage.removeItem("meditrack_user");
  },

  async request(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Authentication
  async login(username, password) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  },

  async registerPatient(patientData) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(patientData)
    });
  },

  // Patients
  async getPatients(search = "") {
    return this.request(`/api/patients${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  },

  async getPatient(id) {
    return this.request(`/api/patients/${id}`);
  },

  async createPatient(patientData) {
    return this.request("/api/patients", {
      method: "POST",
      body: JSON.stringify(patientData)
    });
  },

  async updatePatient(id, patientData) {
    return this.request(`/api/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(patientData)
    });
  },

  async deletePatient(id) {
    return this.request(`/api/patients/${id}`, {
      method: "DELETE"
    });
  },

  // Doctors
  async getDoctors(department = "") {
    return this.request(`/api/doctors${department ? `?department=${encodeURIComponent(department)}` : ""}`);
  },

  async getDoctor(id) {
    return this.request(`/api/doctors/${id}`);
  },

  // Appointments
  async checkSlotAvailability(doctorId, date, time) {
    return this.request(`/api/appointments/check-availability?doctor_id=${doctorId}&date=${date}&time=${encodeURIComponent(time)}`);
  },

  async getAppointments(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/api/appointments${params ? `?${params}` : ""}`);
  },

  async createAppointment(apptData) {
    return this.request("/api/appointments", {
      method: "POST",
      body: JSON.stringify(apptData)
    });
  },

  async updateAppointmentStatus(id, status) {
    return this.request(`/api/appointments/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  },

  // Consultations
  async getConsultations(patientId = "") {
    return this.request(`/api/consultations${patientId ? `?patient_id=${patientId}` : ""}`);
  },

  async createConsultation(conData) {
    return this.request("/api/consultations", {
      method: "POST",
      body: JSON.stringify(conData)
    });
  },

  // Medicines Catalog & Search
  async searchMedicines(query = "", category = "") {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    if (category) params.append("category", category);
    return this.request(`/api/medicines?${params.toString()}`);
  },

  async createMedicine(medData) {
    return this.request("/api/medicines", {
      method: "POST",
      body: JSON.stringify(medData)
    });
  },

  // Prescriptions
  async getPrescriptions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/api/prescriptions${params ? `?${params}` : ""}`);
  },

  async createPrescription(rxData) {
    return this.request("/api/prescriptions", {
      method: "POST",
      body: JSON.stringify(rxData)
    });
  },

  // Invoices & Billing
  async getInvoices(patientId = "") {
    return this.request(`/api/invoices${patientId ? `?patient_id=${patientId}` : ""}`);
  },

  async createInvoice(invData) {
    return this.request("/api/invoices", {
      method: "POST",
      body: JSON.stringify(invData)
    });
  },

  // Payments
  async getPayments() {
    return this.request("/api/payments");
  },

  async createPayment(payData) {
    return this.request("/api/payments", {
      method: "POST",
      body: JSON.stringify(payData)
    });
  },

  // Analytics & Logs
  async getAnalytics() {
    return this.request("/api/analytics");
  },

  async getAuditLogs() {
    return this.request("/api/audit-logs");
  },

  async getNotifications() {
    return this.request("/api/notifications");
  }
};

window.API = API;
