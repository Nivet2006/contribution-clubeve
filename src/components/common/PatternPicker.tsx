'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePattern, PatternId } from './PatternProvider';

const PATTERNS: { id: PatternId; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'grid', label: 'Grid' },
  { id: 'dots', label: 'Dots' },
  { id: 'cross', label: 'Cross' },
  { id: 'diagonal', label: 'Lines' },
  { id: 'waves', label: 'Waves' },
  { id: 'hexagon', label: 'Hex' },
  { id: 'diamonds', label: 'Diamonds' },
  { id: 'circuit', label: 'Circuit' },
  { id: 'polka', label: 'Polka' },
  { id: 'scales', label: 'Scales' },
  { id: 'zigzag', label: 'Zigzag' },
];

export default function PatternPicker() {
  const { pattern, setPattern } = usePattern();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {/* Navbar Trigger Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Change background pattern"
        type="button"
        className="w-9 h-9 rounded-full border border-slate-300 bg-slate-100 hover:border-[#003C5E] flex items-center justify-center transition-all cursor-pointer shadow-xs"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-700"
        >
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      </button>

      {/* Popover Dropdown Grid */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 p-3 bg-white border border-slate-300 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-mono font-bold text-slate-500 mb-2 px-1 uppercase tracking-wider">
            Background Pattern
          </div>

          <div className="grid grid-cols-3 gap-2">
            {PATTERNS.map((item) => {
              const active = pattern === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPattern(item.id);
                    setOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                    active
                      ? 'border-[#003C5E] bg-[#003C5E]/10 text-[#003C5E] font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    data-pattern={item.id}
                    className="w-10 h-7 rounded-md border border-slate-300 bg-white shadow-xs overflow-hidden"
                  />
                  <span className="capitalize text-[11px] font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
