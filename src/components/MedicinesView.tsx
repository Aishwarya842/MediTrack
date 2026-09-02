import React, { useState } from 'react';
import { Medicine } from '../data/hospitalData';

interface MedicinesViewProps {
  medicines: Medicine[];
  onAddMedicine: (medData: any) => Promise<void>;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({ medicines, onAddMedicine }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState('Cardiology');
  const [form, setForm] = useState('Tablet');
  const [strength, setStrength] = useState('500mg');
  const [manufacturer, setManufacturer] = useState('');
  const [price, setPrice] = useState(10.0);
  const [stock, setStock] = useState(500);
  const [batch, setBatch] = useState('MED-2026-X1');
  const [expiry, setExpiry] = useState('2028-12-31');
  const [hsn, setHsn] = useState('3004');

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'All' || m.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddMedicine({
      medicine_name: name,
      generic_name: genericName,
      category,
      form,
      strength,
      manufacturer,
      unit_price: Number(price) || 5.0,
      stock_quantity: Number(stock) || 100,
      batch_number: batch,
      expiry_date: expiry,
      hsn_code: hsn
    });

    setIsModalOpen(false);
    setName('');
    setGenericName('');
    setManufacturer('');
    alert('Medicine formulation added to Pharmacy Master Formulary!');
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Hospital Pharmacy Formulary & Medicine Master
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            CDSCO / Indian Pharmacopoeia Formulations, Batch Stock & Expiry Tracking
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 shadow-xs transition"
        >
          <i className="fa-solid fa-plus text-slate-400"></i> Add New Formulation
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search by brand name (e.g. Dolo 650), generic salt, or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800"
          />
        </div>

        <div className="w-48">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 bg-white"
          >
            <option value="All">All Therapeutic Classes</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Analgesics">Analgesics</option>
            <option value="Antidiabetic">Antidiabetic</option>
            <option value="Gastrointestinal">Gastrointestinal</option>
            <option value="Respiratory">Respiratory</option>
            <option value="Neurology">Neurology</option>
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Brand Name</th>
                <th className="p-3">Generic Salt / Composition</th>
                <th className="p-3">Therapeutic Class</th>
                <th className="p-3">Form & Strength</th>
                <th className="p-3">Manufacturer</th>
                <th className="p-3">Batch & Expiry</th>
                <th className="p-3 text-right">Unit MRP (₹)</th>
                <th className="p-3 text-right">Stock Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMedicines.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-semibold text-slate-900">{m.medicine_name}</td>
                  <td className="p-3 font-medium text-slate-800">{m.generic_name}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[10px] border border-slate-200/60">
                      {m.category}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-600">
                    {m.form} • {m.strength}
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">{m.manufacturer}</td>
                  <td className="p-3 whitespace-nowrap text-[11px]">
                    <div className="font-mono text-slate-700">{m.batch_number}</div>
                    <div className="text-slate-400">Exp: {m.expiry_date}</div>
                  </td>
                  <td className="p-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                    ₹{m.unit_price.toFixed(2)}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <span
                      className={`font-medium px-2 py-0.5 rounded text-[10px] border ${
                        m.stock_quantity > 200
                          ? 'bg-slate-100 text-slate-700 border-slate-200/60'
                          : 'bg-amber-50 text-amber-700 border-amber-200/60'
                      }`}
                    >
                      {m.stock_quantity} Units
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <i className="fa-solid fa-pills text-sky-400"></i> Add Medicine to Master Formulary
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dolo 650"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Generic Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Therapeutic Class</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 bg-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Form</label>
                  <select
                    value={form}
                    onChange={(e) => setForm(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800 bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Strength</label>
                  <input
                    type="text"
                    placeholder="e.g. 650mg"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Pharma Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g. Micro Labs Ltd / Sun Pharma"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Unit Price MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-slate-400 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-1.5 rounded-lg shadow-xs text-xs transition"
                >
                  Save Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
