'use client';

import React, { useState } from 'react';
import { FocusConfig, Round } from '@/types/focus';
import BrandMark from '@/components/common/BrandMark';
import { ShieldAlert, Maximize2, CheckSquare, Square, AlertTriangle, Monitor, Lock, Cpu, Wifi } from 'lucide-react';

interface PreFlightModalProps {
  round: Round;
  config: FocusConfig;
  contributorName: string;
  contributorEmail: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onAcceptAndEnterFullscreen: () => void;
}

export default function PreFlightModal({
  round,
  config,
  contributorName,
  contributorEmail,
  onNameChange,
  onEmailChange,
  onAcceptAndEnterFullscreen,
}: PreFlightModalProps) {
  const [agreedRules, setAgreedRules] = useState<boolean>(false);

  const canBegin = agreedRules && contributorName.trim().length > 0 && contributorEmail.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border-2 border-black rounded-[2.5rem] shadow-2xl overflow-hidden my-8 text-slate-900">
        
        {/* Header */}
        <div className="bg-[#003C5E] p-6 border-b-2 border-black flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20 text-[#FFB703]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase text-white">
                Focus Mode Pre-Flight Check
              </h2>
              <p className="text-xs text-slate-200 font-mono tracking-tight">
                Mandatory integrity protocol for {round.title}
              </p>
            </div>
          </div>
          <BrandMark />
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-700 text-sm">
          
          {/* Contributor Information */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#003C5E] flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Contributor Verification</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-600 mb-1 font-bold">Full Name</label>
                <input
                  type="text"
                  value={contributorName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g. Jordan Vance"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-black text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-600 mb-1 font-bold">Email Address</label>
                <input
                  type="email"
                  value={contributorEmail}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="jordan.vance@example.com"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-black text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* System Diagnostics */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-300 flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-[#007F6E]" />
              <div>
                <p className="font-bold text-slate-900 font-mono text-[11px]">Fullscreen API</p>
                <p className="text-[10px] text-[#007F6E] font-mono font-bold">Ready</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-300 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#D97706]" />
              <div>
                <p className="font-bold text-slate-900 font-mono text-[11px]">Local Backup</p>
                <p className="text-[10px] text-[#D97706] font-mono font-bold">Auto-Save 5s</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-300 flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-[#007F6E]" />
              <div>
                <p className="font-bold text-slate-900 font-mono text-[11px]">Network State</p>
                <p className="text-[10px] text-[#007F6E] font-mono font-bold">Online Sync</p>
              </div>
            </div>
          </div>

          {/* Mandatory Focus Rules */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#E85D04] flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Mandatory Rules & Constraints</span>
            </h3>
            
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-start space-x-2">
                <span className="text-[#003C5E] font-bold">•</span>
                <span><strong>Fullscreen Mode Required:</strong> Exiting fullscreen initiates a {config.fullscreenCountdownSeconds}-second grace countdown. Failure to re-enter forces immediate auto-submission.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#003C5E] font-bold">•</span>
                <span><strong>Tab & Window Tracking:</strong> Switching tabs or losing window focus logs a violation. Maximum allowed violations: <strong>{config.maxViolations}</strong>.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#003C5E] font-bold">•</span>
                <span><strong>Restricted Input:</strong> Right-click, Copy/Paste, Drag & Drop, and Developer Tools inspection shortcuts are blocked and logged.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#003C5E] font-bold">•</span>
                <span><strong>Continuous Draft Protection:</strong> Progress is auto-saved locally every {config.autoSaveIntervalSeconds}s and on every focus change for instant session recovery.</span>
              </li>
            </ul>
          </div>

          {/* Rule Acceptance Checkbox */}
          <div
            onClick={() => setAgreedRules(!agreedRules)}
            className="flex items-center space-x-3 bg-slate-100 border-2 border-slate-300 p-4 rounded-2xl cursor-pointer hover:border-black transition-colors"
          >
            {agreedRules ? (
              <CheckSquare className="w-5 h-5 text-[#007F6E] shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 shrink-0" />
            )}
            <span className="text-xs text-slate-900 font-bold">
              I acknowledge and agree to adhere strictly to the Focus Mode integrity rules for this contribution round.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-5 border-t-2 border-black flex items-center justify-between">
          <span className="text-xs text-slate-600 font-mono font-bold">Time limit: {round.durationMinutes} Minutes</span>
          <button
            disabled={!canBegin}
            onClick={onAcceptAndEnterFullscreen}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
              canBegin
                ? 'bg-[#E85D04] hover:bg-[#ba4a03] text-white scale-100'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>Enter Full Screen & Start Round</span>
          </button>
        </div>

      </div>
    </div>
  );
}
