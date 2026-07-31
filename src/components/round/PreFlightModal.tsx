'use client';

import React, { useState } from 'react';
import { FocusConfig, Round } from '@/types/focus';
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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Focus Mode Agreement & Pre-Flight</h2>
              <p className="text-xs text-slate-400">Mandatory security protocol for {round.title}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-300 text-sm">
          
          {/* Contributor Information */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Contributor Verification</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={contributorName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g. Jordan Vance"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={contributorEmail}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="jordan.vance@example.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* System Pre-Flight Diagnostics */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-medium text-white">Fullscreen API</p>
                <p className="text-[10px] text-emerald-400">Supported & Ready</p>
              </div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="font-medium text-white">Local Draft Sync</p>
                <p className="text-[10px] text-indigo-400">Auto-Save 5s Active</p>
              </div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-medium text-white">Network State</p>
                <p className="text-[10px] text-emerald-400">Online Sync Active</p>
              </div>
            </div>
          </div>

          {/* Mandatory Focus Rules */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Mandatory Rules & Integrity Constraints</span>
            </h3>
            
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong>Fullscreen Mode Required:</strong> Exiting fullscreen triggers a {config.fullscreenCountdownSeconds}-second grace countdown. Failure to re-enter forces immediate auto-submission.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong>Tab & Window Tracking:</strong> Switching tabs or losing window focus increments your violation count. Maximum allowed violations: <strong>{config.maxViolations}</strong>.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong>Restricted Input:</strong> Right-click, Copy/Paste, Drag & Drop, and Developer Tools inspection shortcuts are blocked and logged.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong>Continuous Draft Protection:</strong> Progress is auto-saved locally every {config.autoSaveIntervalSeconds}s and on every focus change for instant session recovery.</span>
              </li>
            </ul>
          </div>

          {/* Rule Acceptance Checkbox */}
          <div
            onClick={() => setAgreedRules(!agreedRules)}
            className="flex items-center space-x-3 bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-xl cursor-pointer hover:bg-indigo-950/50 transition-colors"
          >
            {agreedRules ? (
              <CheckSquare className="w-5 h-5 text-indigo-400 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-slate-500 shrink-0" />
            )}
            <span className="text-xs text-slate-200 font-medium">
              I acknowledge and agree to adhere strictly to the Focus Mode integrity rules for this contribution round.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Time limit: {round.durationMinutes} Minutes</span>
          <button
            disabled={!canBegin}
            onClick={onAcceptAndEnterFullscreen}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-lg ${
              canBegin
                ? 'bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white shadow-emerald-500/20 scale-100'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
