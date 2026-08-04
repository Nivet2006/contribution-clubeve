'use client';

import React, { useState } from 'react';
import { FocusConfig } from '@/types/focus';
import { Save, Sliders, Check } from 'lucide-react';

interface AdminConfigPanelProps {
  config: FocusConfig;
  onSaveConfig: (updated: FocusConfig) => void;
}

export default function AdminConfigPanel({ config, onSaveConfig }: AdminConfigPanelProps) {
  const [form, setForm] = useState<FocusConfig>(config);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    onSaveConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6 text-slate-900">
      
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 rounded-xl border border-slate-300 text-[#003C5E]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0a0a0a] tracking-tight uppercase">Focus Security Rules & Thresholds</h3>
            <p className="text-xs text-slate-600 font-mono font-semibold">Configure global enforcement parameters for active rounds</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Updated!' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Numerical Thresholds */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#003C5E]">
            Enforcement Thresholds
          </h4>

          <div>
            <label className="block text-xs font-mono text-slate-700 font-bold mb-1">
              Maximum Violation Counter Threshold (Auto-Submit Trigger)
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={form.maxViolations}
              onChange={(e) => setForm({ ...form, maxViolations: parseInt(e.target.value) || 3 })}
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-black"
            />
            <p className="text-[10px] text-slate-500 font-mono mt-1 font-medium">Exceeding this count forces instant round auto-submission.</p>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-700 font-bold mb-1">
              Fullscreen Exit Countdown Grace Period (Seconds)
            </label>
            <input
              type="number"
              min={3}
              max={60}
              value={form.fullscreenCountdownSeconds}
              onChange={(e) => setForm({ ...form, fullscreenCountdownSeconds: parseInt(e.target.value) || 10 })}
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-black"
            />
            <p className="text-[10px] text-slate-500 font-mono mt-1 font-medium">Time allowed for contributor to restore full screen.</p>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-700 font-bold mb-1">
              Auto-Save Background Frequency (Seconds)
            </label>
            <input
              type="number"
              min={2}
              max={30}
              value={form.autoSaveIntervalSeconds}
              onChange={(e) => setForm({ ...form, autoSaveIntervalSeconds: parseInt(e.target.value) || 5 })}
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-black"
            />
            <p className="text-[10px] text-slate-500 font-mono mt-1 font-medium">Interval for periodic draft backups to Cloud Database.</p>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#003C5E]">
            Restriction Feature Toggles
          </h4>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-800 font-semibold">Disable Clipboard (Copy, Cut, Paste)</span>
              <input
                type="checkbox"
                checked={form.blockClipboard}
                onChange={(e) => setForm({ ...form, blockClipboard: e.target.checked })}
                className="w-4 h-4 accent-[#003C5E] rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-800 font-semibold">Disable Context Menu & Right Click</span>
              <input
                type="checkbox"
                checked={form.blockContextMenu}
                onChange={(e) => setForm({ ...form, blockContextMenu: e.target.checked })}
                className="w-4 h-4 accent-[#003C5E] rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-800 font-semibold">Disable Text Selection & Highlight</span>
              <input
                type="checkbox"
                checked={form.blockSelection}
                onChange={(e) => setForm({ ...form, blockSelection: e.target.checked })}
                className="w-4 h-4 accent-[#003C5E] rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-800 font-semibold">Enable DevTools Inspection Detection</span>
              <input
                type="checkbox"
                checked={form.devToolsDetection}
                onChange={(e) => setForm({ ...form, devToolsDetection: e.target.checked })}
                className="w-4 h-4 accent-[#003C5E] rounded"
              />
            </label>
          </div>
        </div>

      </div>

    </div>
  );
}
