'use client';

import React, { useState } from 'react';
import { Round, RoundStatus } from '@/types/focus';
import { updateRoundInFirestore, deleteRoundFromFirestore } from '@/lib/firestore-service';
import CreateRoundModal from './CreateRoundModal';
import { Plus, Eye, EyeOff, Lock, Trash2, ChevronDown, RefreshCw, Clock, HelpCircle } from 'lucide-react';

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

  const handleStatusCycle = async (round: Round) => {
    const next = STATUS_CYCLE[round.status];
    setToggling(round.id);
    await updateRoundInFirestore(round.id, { status: next });
    setToggling(null);
    onRoundsUpdated();
  };

  const handleDelete = async (roundId: string) => {
    setDeleting(roundId);
    await deleteRoundFromFirestore(roundId);
    setDeleting(null);
    setConfirmDelete(null);
    onRoundsUpdated();
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
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#ba4a03] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Round</span>
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
                      <button
                        onClick={() => handleStatusCycle(round)}
                        disabled={toggling === round.id}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border font-mono font-bold text-[10px] uppercase tracking-wider transition-all hover:opacity-80 cursor-pointer ${s.pill}`}
                      >
                        {toggling === round.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : s.icon}
                        <span>{s.label}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {confirmDelete === round.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-[10px] text-rose-600 font-mono font-bold">Confirm delete?</span>
                          <button onClick={() => handleDelete(round.id)} disabled={deleting === round.id} className="px-3 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 disabled:opacity-60">{deleting === round.id ? '...' : 'Yes, Delete'}</button>
                          <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-300">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(round.id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
    </div>
  );
}
