import React, { useState, useRef, useEffect } from 'react';

interface DatePickerCalendarProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  maxDate?: string;
  minDate?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parseDate(dateStr: string) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

export default function DatePickerCalendar({
  value,
  onChange,
  placeholder = 'Select date',
  maxDate,
  minDate
}: DatePickerCalendarProps) {
  const parsed = parseDate(value);
  const today = new Date();

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());
  const [selecting, setSelecting] = useState<'day' | 'month' | 'year'>('day');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayText = parsed
    ? `${String(parsed.day).padStart(2, '0')} ${MONTHS[parsed.month].slice(0, 3)} ${parsed.year}`
    : placeholder;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const isDisabled = (y: number, m: number, d: number) => {
    const dateStr = formatDate(y, m, d);
    if (maxDate && dateStr > maxDate) return true;
    if (minDate && dateStr < minDate) return true;
    return false;
  };

  const handleDayClick = (day: number) => {
    if (isDisabled(viewYear, viewMonth, day)) return;
    onChange(formatDate(viewYear, viewMonth, day));
    setIsOpen(false);
  };

  const calendarGrid = [];
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarGrid.push(d);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-left flex items-center justify-between gap-2 cursor-pointer hover:border-amber-400 transition"
      >
        <span className={parsed ? 'text-slate-800' : 'text-slate-400'}>{displayText}</span>
        <i className="fa-regular fa-calendar text-amber-500 text-sm"></i>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-[260px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => {
                if (selecting === 'day') {
                  if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
                  else setViewMonth(viewMonth - 1);
                } else if (selecting === 'month') {
                  setViewYear(viewYear - 1);
                } else {
                  setViewYear(viewYear - 10);
                }
              }}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer text-xs"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelecting(selecting === 'month' ? 'day' : 'month')}
                className="px-2 py-0.5 rounded-md hover:bg-amber-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                {MONTHS[viewMonth].slice(0, 3)}
              </button>
              <button
                type="button"
                onClick={() => setSelecting(selecting === 'year' ? 'day' : 'year')}
                className="px-2 py-0.5 rounded-md hover:bg-amber-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                {viewYear}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (selecting === 'day') {
                  if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
                  else setViewMonth(viewMonth + 1);
                } else if (selecting === 'month') {
                  setViewYear(viewYear + 1);
                } else {
                  setViewYear(viewYear + 10);
                }
              }}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer text-xs"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          {/* Day View */}
          {selecting === 'day' && (
            <>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[9px] font-bold text-slate-400 py-0.5">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {calendarGrid.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`}></div>;
                  const isSelected = parsed?.year === viewYear && parsed?.month === viewMonth && parsed?.day === day;
                  const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
                  const disabled = isDisabled(viewYear, viewMonth, day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      disabled={disabled}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-medium cursor-pointer transition
                        ${disabled ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-amber-50'}
                        ${isSelected ? 'bg-amber-500 text-white hover:bg-amber-600 font-bold' : ''}
                        ${isToday && !isSelected ? 'border border-amber-400 text-amber-600 font-bold' : ''}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Month View */}
          {selecting === 'month' && (
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((m, idx) => {
                const isSelected = parsed?.year === viewYear && parsed?.month === idx;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setViewMonth(idx); setSelecting('day'); }}
                    className={`px-2 py-2 rounded-lg text-[11px] font-medium cursor-pointer transition text-center
                      ${isSelected ? 'bg-amber-500 text-white font-bold' : 'hover:bg-amber-50 text-slate-700'}
                    `}
                  >
                    {m.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Year View */}
          {selecting === 'year' && (
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => viewYear - 5 + i).map((y) => {
                const isSelected = parsed?.year === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => { setViewYear(y); setSelecting('month'); }}
                    className={`px-2 py-2 rounded-lg text-[11px] font-medium cursor-pointer transition text-center
                      ${isSelected ? 'bg-amber-500 text-white font-bold' : 'hover:bg-amber-50 text-slate-700'}
                    `}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          {/* Today + Clear buttons */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
                if (!isDisabled(today.getFullYear(), today.getMonth(), today.getDate())) {
                  onChange(todayStr);
                }
                setIsOpen(false);
              }}
              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer px-2 py-1 rounded hover:bg-amber-50"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 cursor-pointer px-2 py-1 rounded hover:bg-red-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
