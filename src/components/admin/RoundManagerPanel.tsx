'use client';

import React, { useState } from 'react';
import { Round, RoundStatus } from '@/types/focus';
import { apiSaveRound, apiDeleteRound } from '@/lib/admin-api';
import { deleteRoundFromFirestore } from '@/lib/firestore-service';
import CreateRoundModal from './CreateRoundModal';
import { Plus, Eye, EyeOff, Lock, Trash2, ChevronDown, RefreshCw, Clock, HelpCircle, Share2, Check, ShieldAlert, X } from 'lucide-react';

interface Props {
  rounds: Round[];
  adminEmail: string;
  onRoundsUpdated: () => void;
}

const STATUS_CYCLE: Record<RoundStatus, RoundStatus> = {
  HIDDEN: 'ACTIVE',
  ACTIVE: 'CLOSED',
  CLOSED: 'HIDDEN',
};

const STATUS_STYLES: Record<RoundStatus, { pill: string; label: string; icon: React.ReactNode }> = {
  ACTIVE: {
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    label: 'ACTIVE',
    icon: <Eye className="w-3.5 h-3.5" />,
  },
  CLOSED: {
    pill: 'bg-amber-100 text-amber-800 border-amber-300',
    label: 'CLOSED',
    icon: <Lock className="w-3.5 h-3.5" />,
  },
  HIDDEN: {
    pill: 'bg-slate-100 text-slate-600 border-slate-300',
    label: 'HIDDEN',
    icon: <EyeOff className="w-3.5 h-3.5" />,
  },
};

export default function RoundManagerPanel({ rounds, adminEmail, onRoundsUpdated }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copiedRoundId, setCopiedRoundId] = useState<string | null>(null);

  // OTP toggle password modal state
  const [otpModalRound, setOtpModalRound] = useState<Round | null>(null);
  const [otpPassword, setOtpPassword] = useState('');
  const [otpPasswordError, setOtpPasswordError] = useState<string | null>(null);
  const [updatingOtp, setUpdatingOtp] = useState(false);

  const handleStatusCycle = async (round: Round) => {
    const next = STATUS_CYCLE[round.status];
    setToggling(round.id);
    await apiSaveRound({ ...round, status: next });
    setToggling(null);
    onRoundsUpdated();
  };

  const handleConfirmOtpToggle = async () => {
    if (!otpModalRound) return;
    if (otpPassword !== 'ClubEve@9X#Kz2!Secure2024' && otpPassword !== '123456') {
      setOtpPasswordError('Incorrect admin security password.');
      return;
    }

    setUpdatingOtp(true);
    setOtpPasswordError(null);
    const newRequireOtp = !(otpModalRound.requireOtp !== false);

    await apiSaveRound({ ...otpModalRound, requireOtp: newRequireOtp });
    setUpdatingOtp(false);
    setOtpModalRound(null);
    setOtpPassword('');
    onRoundsUpdated();
  };

  const handleDelete = async (roundId: string) => {
    setDeleting(roundId);
    try {
      const res = await apiDeleteRound(roundId);
      if (!res?.success) {
        await deleteRoundFromFirestore(roundId);
      }
    } catch (err) {
      await deleteRoundFromFirestore(roundId).catch(() => {});
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
      onRoundsUpdated();
    }
  };

  return (
    <div className="space-y-6">

      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Evaluation Rounds</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{rounds.length} round{rounds.length !== 1 ? 's' : ''} in Firestore</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#ba4a03] !text-white text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="!text-white text-white">Create New Round</span>
        </button>
      </div>

      {/* Status Legend */}
      <div className="flex items-center space-x-4 text-[10px] font-mono font-bold">
        <span className="text-slate-500 uppercase">Status:</span>
        {Object.entries(STATUS_STYLES).map(([s, v]) => (
          <span key={s} className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border ${v.pill}`}>{v.icon}<span>{v.label}</span></span>
        ))}
        <span className="text-slate-400 text-[9px]">Click status badge to cycle → HIDDEN → ACTIVE → CLOSED → HIDDEN</span>
      </div>

      {/* Rounds Table */}
      {rounds.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-[2rem] p-12 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-500 font-mono text-sm font-bold">No rounds created yet.</p>
          <p className="text-slate-400 font-mono text-xs">Click "Create New Round" to get started.</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-black rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-mono uppercase tracking-widest text-[10px] border-b-2 border-black">
              <tr>
                <th className="py-3 px-5">Round Title</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Questions</th>
                <th className="py-3 px-5">Duration</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rounds.map((round) => {
                const s = STATUS_STYLES[round.status];
                return (
                  <tr key={round.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{round.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{round.id}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700">{round.category}</td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{round.totalQuestions}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-1 text-slate-700 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{round.durationMinutes}m</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col space-y-1 items-start">
                        <button
                          onClick={() => handleStatusCycle(round)}
                          disabled={toggling === round.id}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border font-mono font-bold text-[10px] uppercase tracking-wider transition-all hover:opacity-80 cursor-pointer ${s.pill}`}
                        >
                          {toggling === round.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : s.icon}
                          <span>{s.label}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpModalRound(round);
                            setOtpPassword('');
                            setOtpPasswordError(null);
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border uppercase transition-all hover:scale-105 cursor-pointer flex items-center space-x-1 ${
                            round.requireOtp !== false
                              ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                          title="Click to toggle OTP requirement (requires password)"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>{round.requireOtp !== false ? 'OTP: ON' : 'OTP: OFF'}</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Share Round Direct Link */}
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/round/${round.id}`;
                            navigator.clipboard.writeText(url);
                            setCopiedRoundId(round.id);
                            setTimeout(() => setCopiedRoundId(null), 2500);
                          }}
                          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all ${
                            copiedRoundId === round.id
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                          title="Copy direct share link"
                        >
                          {copiedRoundId === round.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5 text-[#003C5E]" />
                              <span>Share</span>
                            </>
                          )}
                        </button>

                        {/* Delete Round */}
                        {confirmDelete === round.id ? (
                          <div className="flex items-center space-x-1">
                            <button onClick={() => handleDelete(round.id)} disabled={deleting === round.id} className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 disabled:opacity-60">{deleting === round.id ? '...' : 'Confirm'}</button>
                            <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-300">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(round.id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Round">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateRoundModal
          adminEmail={adminEmail}
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); onRoundsUpdated(); }}
        />
      )}

      {/* Password-Protected OTP Authentication Toggle Modal */}
      {otpModalRound && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-[2.5rem] p-6 space-y-5 shadow-2xl overflow-hidden text-slate-900">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-[#003C5E]">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                  Toggle Email OTP Authentication
                </h3>
              </div>
              <button onClick={() => setOtpModalRound(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                You are changing Email OTP Verification for round{' '}
                <strong className="text-slate-900 uppercase font-black">{otpModalRound.title}</strong> from{' '}
                <strong className="text-indigo-700 font-mono">
                  {otpModalRound.requireOtp !== false ? 'ON (Required)' : 'OFF (Direct Entry)'}
                </strong>{' '}
                to{' '}
                <strong className="text-emerald-600 font-mono">
                  {otpModalRound.requireOtp !== false ? 'OFF (Direct Entry)' : 'ON (Required)'}
                </strong>.
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Enter Admin Security Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter admin password (e.g. 123456)"
                  value={otpPassword}
                  onChange={(e) => setOtpPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmOtpToggle();
                  }}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-[#003C5E]"
                />
              </div>

              {otpPasswordError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-mono font-bold">
                  {otpPasswordError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setOtpModalRound(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono font-bold uppercase transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingOtp}
                onClick={handleConfirmOtpToggle}
                className="px-5 py-2 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-60"
              >
                {updatingOtp ? 'Updating...' : 'Authenticate & Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
