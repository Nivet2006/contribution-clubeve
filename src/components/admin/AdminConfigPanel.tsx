'use client';

import React, { useState } from 'react';
import { FocusConfig } from '@/types/focus';
import { Save, Settings, ShieldAlert, Sliders, Check } from 'lucide-react';

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
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Focus Security Rules & Thresholds</h3>
            <p className="text-xs text-slate-400">Configure global enforcement parameters for active rounds</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Updated!' : 'Save Rule Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Numerical Thresholds */}
        <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Enforcement Thresholds
          </h4>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Maximum Violation Counter Threshold (Auto-Submit Trigger)
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={form.maxViolations}
              onChange={(e) => setForm({ ...form, maxViolations: parseInt(e.target.value) || 3 })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Exceeding this count forces instant round auto-submission.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Fullscreen Exit Countdown Grace Period (Seconds)
            </label>
            <input
              type="number"
              min={3}
              max={60}
              value={form.fullscreenCountdownSeconds}
              onChange={(e) => setForm({ ...form, fullscreenCountdownSeconds: parseInt(e.target.value) || 10 })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Time allowed for contributor to restore full screen.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Auto-Save Background Frequency (Seconds)
            </label>
            <input
              type="number"
              min={2}
              max={30}
              value={form.autoSaveIntervalSeconds}
              onChange={(e) => setForm({ ...form, autoSaveIntervalSeconds: parseInt(e.target.value) || 5 })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Interval for periodic draft backups to LocalStorage.</p>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Restriction Feature Toggles
          </h4>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Disable Clipboard (Copy, Cut, Paste)</span>
              <input
                type="checkbox"
                checked={form.blockClipboard}
                onChange={(e) => setForm({ ...form, blockClipboard: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Disable Context Menu & Right Click</span>
              <input
                type="checkbox"
                checked={form.blockContextMenu}
                onChange={(e) => setForm({ ...form, blockContextMenu: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Disable Text Selection & Highlight</span>
              <input
                type="checkbox"
                checked={form.blockSelection}
                onChange={(e) => setForm({ ...form, blockSelection: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300">Enable DevTools Inspection Detection</span>
              <input
                type="checkbox"
                checked={form.devToolsDetection}
                onChange={(e) => setForm({ ...form, devToolsDetection: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>
          </div>
        </div>

      </div>

    </div>
  );
}
