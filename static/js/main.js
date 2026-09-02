/**
 * =============================================================================
 * MEDI TRACK – Integrated Patient Care Management System
 * Core UI Controller, Calculators & Application Engine
 * =============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

const App = {
  currentUser: null,
  activeView: "home",
  selectedMedicinesForRx: [],
  
  init() {
    this.currentUser = API.getCurrentUser();
    this.bindGlobalEvents();
    this.updateUserUI();
  },

  bindGlobalEvents() {
    // Top emergency helpline click handler
    document.querySelectorAll("[data-action='call-emergency']").forEach(el => {
      el.addEventListener("click", () => {
        alert("MediTrack 24x7 Emergency Ambulance: 1066 / +91 44 2483 9999\nImmediate emergency response team notified.");
      });
    });

    // Close modals on overlay click
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });
    });
  },

  updateUserUI() {
    const userBox = document.getElementById("portal-user-meta");
    if (userBox && this.currentUser) {
      userBox.innerHTML = `
        <div class="user-avatar-circle">${this.currentUser.full_name ? this.currentUser.full_name.charAt(0) : 'U'}</div>
        <div class="user-meta">
          <h4>${this.currentUser.full_name || this.currentUser.username}</h4>
          <span>${this.currentUser.role}</span>
        </div>
      `;
    }

    // Role-based sidebar menu items filtering
    if (this.currentUser) {
      const role = this.currentUser.role;
      document.querySelectorAll("[data-role]").forEach(el => {
        const allowed = el.getAttribute("data-role").split(",");
        if (!allowed.includes(role)) {
          el.style.display = "none";
        } else {
          el.style.display = "flex";
        }
      });
    }
  },

  // ------------------------------------------------------------------------
  // Quick 1-Click Login Helper
  // ------------------------------------------------------------------------
  async quickLogin(role) {
    let u = "admin", p = "Admin@123";
    if (role === "DOCTOR") {
      u = "dr_kavitha";
      p = "Doctor@123";
    } else if (role === "PATIENT") {
      u = "patient_rajesh";
      p = "Patient@123";
    }

    try {
      const res = await API.login(u, p);
      if (res.success) {
        API.setAuth(res.token, res.user);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  },

  logout() {
    API.clearAuth();
    window.location.href = "/";
  },

  // ------------------------------------------------------------------------
  // Dynamic Medicine Autocomplete Search
  // ------------------------------------------------------------------------
  initMedicineSearch(inputEl, dropdownEl, onSelectCallback) {
    let debounceTimer;
    inputEl.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();
      if (query.length < 2) {
        dropdownEl.innerHTML = "";
        dropdownEl.style.display = "none";
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const medicines = await API.searchMedicines(query);
          dropdownEl.innerHTML = "";
          if (medicines.length === 0) {
            dropdownEl.innerHTML = `<div class="search-item" style="color:#64748B;">No medicines found matching "${query}"</div>`;
          } else {
            medicines.forEach(med => {
              const item = document.createElement("div");
              item.className = "search-item";
              item.innerHTML = `
                <div>
                  <strong style="color:#0A3871;">${med.medicine_name}</strong>
                  <div style="font-size:0.75rem; color:#64748B;">${med.generic_name} | ${med.strength} (${med.form})</div>
                </div>
                <div style="text-align:right;">
                  <span style="font-weight:700; color:#059669;">₹${med.unit_price.toFixed(2)}</span>
                  <div style="font-size:0.7rem; color:${med.stock_quantity < 30 ? '#E11D48' : '#64748B'};">Stock: ${med.stock_quantity}</div>
                </div>
              `;
              item.addEventListener("click", () => {
                onSelectCallback(med);
                inputEl.value = "";
                dropdownEl.innerHTML = "";
                dropdownEl.style.display = "none";
              });
              dropdownEl.appendChild(item);
            });
          }
          dropdownEl.style.display = "block";
        } catch (err) {
          console.error("Medicine search failed:", err);
        }
      }, 250);
    });

    document.addEventListener("click", (e) => {
      if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
        dropdownEl.style.display = "none";
      }
    });
  },

  // ------------------------------------------------------------------------
  // Dynamic Invoice Billing Calculations
  // ------------------------------------------------------------------------
  calculateInvoiceTotals() {
    const conFee = parseFloat(document.getElementById("inv-con-fee")?.value || 0);
    const medFee = parseFloat(document.getElementById("inv-med-fee")?.value || 0);
    const labFee = parseFloat(document.getElementById("inv-lab-fee")?.value || 0);
    const addFee = parseFloat(document.getElementById("inv-add-fee")?.value || 0);
    const discountPct = parseFloat(document.getElementById("inv-discount-pct")?.value || 0);
    const gstPct = parseFloat(document.getElementById("inv-gst-pct")?.value || 5);

    const subtotal = conFee + medFee + labFee + addFee;
    const discountAmt = (subtotal * discountPct) / 100;
    const taxableAmt = subtotal - discountAmt;
    const gstAmt = (taxableAmt * gstPct) / 100;
    const grandTotal = taxableAmt + gstAmt;

    if (document.getElementById("inv-subtotal-val")) {
      document.getElementById("inv-subtotal-val").textContent = `₹${subtotal.toFixed(2)}`;
      document.getElementById("inv-discount-val").textContent = `₹${discountAmt.toFixed(2)}`;
      document.getElementById("inv-gst-val").textContent = `₹${gstAmt.toFixed(2)}`;
      document.getElementById("inv-grand-total-val").textContent = `₹${grandTotal.toFixed(2)}`;
    }

    return { subtotal, discountAmt, gstAmt, grandTotal };
  },

  // ------------------------------------------------------------------------
  // Appointment Double-Booking Validator
  // ------------------------------------------------------------------------
  async validateAppointmentBooking(doctorId, date, time) {
    try {
      const res = await API.checkSlotAvailability(doctorId, date, time);
      return res.available;
    } catch (err) {
      return true;
    }
  },

  // ------------------------------------------------------------------------
  // Modal Helpers
  // ------------------------------------------------------------------------
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  },

  // ------------------------------------------------------------------------
  // Print & PDF Preview
  // ------------------------------------------------------------------------
  printElement(elementId) {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;
    
    window.print();
  }
};

window.App = App;
