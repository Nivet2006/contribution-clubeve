'use client';

import React, { useState } from 'react';
import { Poll } from '@/types/focus';
import { apiUpdatePoll, apiDeletePoll } from '@/lib/admin-api';
import CreatePollModal from './CreatePollModal';
import { Plus, Eye, Lock, Trash2, Share2, Check, RefreshCw, BarChart2, Users, CheckCircle, X, PieChart } from 'lucide-react';

interface Props {
  polls: Poll[];
  adminEmail: string;
  onPollsUpdated: () => void;
}

export default function PollManagerPanel({ polls, adminEmail, onPollsUpdated }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [viewResultsPoll, setViewResultsPoll] = useState<Poll | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copiedPollId, setCopiedPollId] = useState<string | null>(null);

  const handleToggleStatus = async (poll: Poll) => {
    const nextStatus = poll.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    setToggling(poll.id);
    await apiUpdatePoll(poll.id, { status: nextStatus });
    setToggling(null);
    onPollsUpdated();
  };

  const handleDelete = async (pollId: string) => {
    setDeleting(pollId);
    await apiDeletePoll(pollId);
    setDeleting(null);
    setConfirmDelete(null);
    onPollsUpdated();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-black p-6 rounded-[2.5rem] shadow-sm text-slate-900">
        <div>
          <div className="flex items-center space-x-2 text-[#003C5E] mb-1">
            <BarChart2 className="w-5 h-5" />
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
              Community Polls & Leaderboard
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-mono">
            Manage anonymous community voting polls, monitor real-time vote leaderboards, and publish new polls.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#FFB703]" />
          <span>Create New Poll</span>
        </button>
      </div>

      {/* Polls Table */}
      {polls.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-[2.5rem] p-12 text-center">
          <BarChart2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-500 font-mono text-sm font-bold">No community polls created yet.</p>
          <p className="text-slate-400 font-mono text-xs mt-1">Select submissions in the Integrity Dashboard to launch an anonymous poll.</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-black text-slate-700 font-mono font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Poll Title</th>
                  <th className="py-3.5 px-5">Questions</th>
                  <th className="py-3.5 px-5">Total Votes</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans font-medium text-slate-800">
                {polls.map((poll) => (
                  <tr key={poll.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-black text-slate-900 text-sm uppercase">{poll.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{poll.id}</div>
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-slate-900">
                      {poll.questions.length} Question{poll.questions.length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-slate-900">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-[#003C5E]" />
                        <span>{poll.totalVotes || 0} Votes</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleToggleStatus(poll)}
                        disabled={toggling === poll.id}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full border font-mono font-bold text-[10px] uppercase transition-all ${
                          poll.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {toggling === poll.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : poll.status === 'ACTIVE' ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                        <span>{poll.status}</span>
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        
                        {/* View Results (Admin Only) */}
                        <button
                          onClick={() => setViewResultsPoll(poll)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-[10px] font-mono font-bold uppercase transition-all shadow-sm"
                          title="View confidential live poll results"
                        >
                          <PieChart className="w-3.5 h-3.5 text-[#FFB703]" />
                          <span>View Results</span>
                        </button>

                        {/* Share Direct Poll Link */}
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/polls/${poll.id}`;
                            navigator.clipboard.writeText(url);
                            setCopiedPollId(poll.id);
                            setTimeout(() => setCopiedPollId(null), 2500);
                          }}
                          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-all ${
                            copiedPollId === poll.id
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                          title="Copy direct poll link"
                        >
                          {copiedPollId === poll.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5 text-[#003C5E]" />
                              <span>Share Poll</span>
                            </>
                          )}
                        </button>

                        {/* Delete Poll */}
                        {confirmDelete === poll.id ? (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDelete(poll.id)}
                              disabled={deleting === poll.id}
                              className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg hover:bg-rose-700 disabled:opacity-60"
                            >
                              {deleting === poll.id ? '...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(poll.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Poll"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreatePollModal
          selectedSubmissions={[]}
          adminEmail={adminEmail}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            onPollsUpdated();
          }}
        />
      )}

      {/* Confidential Admin Results Modal */}
      {viewResultsPoll && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border-2 border-black rounded-[2.5rem] p-6 space-y-6 shadow-2xl overflow-hidden text-slate-900 my-6">
            
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold bg-[#003C5E] text-white px-2.5 py-0.5 rounded-full uppercase">
                  CONFIDENTIAL ADMIN REPORT
                </span>
                <h2 className="text-xl font-black uppercase text-slate-900 mt-1">
                  {viewResultsPoll.title}
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Total Votes Recorded: <span className="font-bold text-slate-900">{viewResultsPoll.totalVotes || 0}</span>
                </p>
              </div>
              <button
                onClick={() => setViewResultsPoll(null)}
                className="p-1.5 text-slate-400 hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {viewResultsPoll.questions.map((q, qIdx) => {
                const totalQVotes = q.options.reduce((sum, o) => sum + (o.voteCount || 0), 0);

                return (
                  <div key={q.id} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        Question {qIdx + 1} of {viewResultsPoll.questions.length}
                      </span>
                      <h4 className="text-sm font-black uppercase text-slate-900">{q.title}</h4>
                    </div>

                    <div className="space-y-3">
                      {q.options.map((opt, oIdx) => {
                        const pct = totalQVotes > 0 ? Math.round(((opt.voteCount || 0) / totalQVotes) * 100) : 0;

                        return (
                          <div key={opt.id} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between text-xs font-mono font-bold">
                              <span className="text-slate-800">
                                Option {String.fromCharCode(65 + oIdx)}: {opt.type === 'text' ? opt.value : '[Image Option]'}
                              </span>
                              <span className="text-[#003C5E] font-black">{pct}% ({opt.voteCount || 0} votes)</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div
                                className="h-full bg-[#003C5E] transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200 pt-4 flex justify-end">
              <button
                onClick={() => setViewResultsPoll(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-mono font-bold uppercase hover:bg-slate-800"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
