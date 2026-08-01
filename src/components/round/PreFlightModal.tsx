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

  // OTP Authentication States
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpStatusMsg, setOtpStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Resend Countdown Timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    if (!contributorEmail || !contributorEmail.includes('@')) {
      setOtpStatusMsg({ type: 'error', text: 'Please enter a valid email address first.' });
      return;
    }

    setIsSendingOtp(true);
    setOtpStatusMsg(null);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contributorEmail, name: contributorName }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOtpSent(true);
        setResendCooldown(30);
        setOtpStatusMsg({
          type: 'success',
          text: data.message || `OTP sent from help@clubeve.nivet2006.in to ${contributorEmail}`,
        });
        if (data.devOTP) {
          setOtpInput(data.devOTP);
        }
      } else {
        setOtpStatusMsg({ type: 'error', text: data.message || 'Failed to send OTP email.' });
      }
    } catch (err: any) {
      setOtpStatusMsg({ type: 'error', text: 'Network error sending OTP. Please try again.' });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async (codeToVerify?: string) => {
    const code = codeToVerify || otpInput;
    if (!code || code.trim().length === 0) {
      setOtpStatusMsg({ type: 'error', text: 'Please enter the 6-digit OTP code.' });
      return;
    }

    setIsVerifyingOtp(true);
    setOtpStatusMsg(null);

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contributorEmail, otp: code }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOtpVerified(true);
        setOtpStatusMsg({ type: 'success', text: '✓ Email authenticated successfully via Brevo!' });
      } else {
        setOtpStatusMsg({ type: 'error', text: data.message || 'Invalid or expired OTP code.' });
      }
    } catch (err: any) {
      setOtpStatusMsg({ type: 'error', text: 'Network error verifying OTP. Please try again.' });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const canBegin = agreedRules && contributorName.trim().length > 0 && contributorEmail.trim().length > 0 && otpVerified;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border-2 border-black rounded-[2.5rem] shadow-2xl overflow-hidden my-8 text-slate-900">
        
        {/* Header */}
        <div className="bg-[#003C5E] p-6 border-b-2 border-black flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20 text-[#FFB703]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase text-white">
                {round.title}
              </h2>
              <p className="text-xs text-white/80 font-mono tracking-tight mt-0.5">
                {round.category} · {round.durationMinutes} Minutes · Focus Mode Verification
              </p>
            </div>
          </div>
          <BrandMark />
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-800 text-sm">
          
          {/* Contributor Information & OTP Verification */}
          <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#003C5E] flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#003C5E]" />
                <span>Contributor Verification</span>
              </h3>
              {otpVerified && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                  <span>✓ EMAIL AUTHENTICATED</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-700 mb-1 font-bold">Full Name</label>
                <input
                  type="text"
                  value={contributorName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g. Jordan Vance"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-black text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-700 mb-1 font-bold">Email Address</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    disabled={otpVerified}
                    value={contributorEmail}
                    onChange={(e) => {
                      onEmailChange(e.target.value);
                      if (otpVerified) setOtpVerified(false);
                    }}
                    placeholder="jordan.vance@example.com"
                    className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-black text-xs font-semibold disabled:opacity-75 disabled:bg-slate-100"
                  />
                  {!otpVerified && (
                    <button
                      type="button"
                      disabled={isSendingOtp || resendCooldown > 0 || !contributorEmail.includes('@')}
                      onClick={handleSendOTP}
                      className="px-3 py-2 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shrink-0 border border-slate-700 shadow-sm"
                    >
                      {isSendingOtp
                        ? 'Sending...'
                        : resendCooldown > 0
                        ? `Resend (${resendCooldown}s)`
                        : otpSent
                        ? 'Resend OTP'
                        : 'Send OTP'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* OTP Input Row */}
            {otpSent && !otpVerified && (
              <div className="p-4 bg-white rounded-xl border-2 border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-[#003C5E]">Enter 6-Digit OTP Code Sent via Brevo</label>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">From: help@clubeve.nivet2006.in</span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpInput(val);
                      if (val.length === 6) {
                        handleVerifyOTP(val);
                      }
                    }}
                    placeholder="123456"
                    className="flex-1 bg-slate-50 border-2 border-slate-300 rounded-xl px-4 py-2 text-slate-900 font-mono text-base font-bold text-center tracking-[6px] focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    disabled={isVerifyingOtp || otpInput.length < 6}
                    onClick={() => handleVerifyOTP()}
                    className="px-4 py-2 bg-[#007F6E] hover:bg-[#006255] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* Status Message Banner */}
            {otpStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-mono font-bold border ${
                  otpStatusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {otpStatusMsg.text}
              </div>
            )}
          </div>

          {/* System Diagnostics Badges */}
          <div className="grid grid-cols-3 gap-3 text-xs font-mono font-bold">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-center space-x-2 text-[#007F6E]">
              <Monitor className="w-4 h-4 shrink-0" />
              <span className="text-[11px] uppercase tracking-wider">Fullscreen Ready</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-center space-x-2 text-[#D97706]">
              <Cpu className="w-4 h-4 shrink-0" />
              <span className="text-[11px] uppercase tracking-wider">Auto-Save 5s</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-center space-x-2 text-[#007F6E]">
              <Wifi className="w-4 h-4 shrink-0" />
              <span className="text-[11px] uppercase tracking-wider">System Online</span>
            </div>
          </div>

          {/* Mandatory Focus Rules */}
          <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#E85D04] flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Mandatory Rules & Constraints</span>
            </h3>
            
            <ul className="space-y-2 text-xs text-slate-800 font-medium">
              <li className="flex items-start space-x-2">
                <span className="text-[#E85D04] font-bold">•</span>
                <span><strong>Fullscreen Mode Required:</strong> Exiting fullscreen initiates a {config.fullscreenCountdownSeconds}-second grace countdown. Failure to re-enter forces immediate auto-submission.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#E85D04] font-bold">•</span>
                <span><strong>Tab & Window Tracking:</strong> Switching tabs or losing window focus logs a violation. Maximum allowed violations: <strong>{config.maxViolations}</strong>.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#E85D04] font-bold">•</span>
                <span><strong>Restricted Input:</strong> Right-click, Copy/Paste, Drag & Drop, and Developer Tools inspection shortcuts are blocked and logged.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#E85D04] font-bold">•</span>
                <span><strong>Continuous Draft Protection:</strong> Progress is auto-saved locally every {config.autoSaveIntervalSeconds}s and on every focus change for instant session recovery.</span>
              </li>
            </ul>
          </div>

          {/* Rule Acceptance Checkbox */}
          <div
            onClick={() => setAgreedRules(!agreedRules)}
            className="flex items-center space-x-3 bg-slate-50 border-2 border-slate-300 p-4 rounded-2xl cursor-pointer hover:border-black transition-colors"
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
        <div className="bg-slate-100 p-5 border-t-2 border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-700 font-mono font-bold">Time limit: {round.durationMinutes} Minutes</span>
          <button
            disabled={!canBegin}
            onClick={onAcceptAndEnterFullscreen}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
              canBegin
                ? 'bg-[#E85D04] hover:bg-[#ba4a03] text-white scale-100'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
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
