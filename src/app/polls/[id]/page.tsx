'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getPollById, recordVoteInFirestore } from '@/lib/firestore-service';
import { Poll } from '@/types/focus';
import BrandMark from '@/components/common/BrandMark';
import { BarChart2, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, ArrowLeft, Check, Lock } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PollDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const pollId = resolvedParams.id;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [hasVoted, setHasVoted] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [voterToken, setVoterToken] = useState<string>('');

  useEffect(() => {
    if (!pollId) return;

    // Generate or retrieve persistent hardware/browser fingerprint token
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('voter_fingerprint_id') || '';
      if (!token) {
        const screenStr = `${window.screen.width}x${window.screen.height}_${window.screen.colorDepth}`;
        const navStr = `${navigator.userAgent}_${navigator.language}_${new Date().getTimezoneOffset()}`;
        // Create deterministic hash from browser/device attributes
        let hash = 0;
        const combined = screenStr + navStr + Math.random().toString(36);
        for (let i = 0; i < combined.length; i++) {
          hash = (hash << 5) - hash + combined.charCodeAt(i);
          hash |= 0;
        }
        token = 'dev_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
        localStorage.setItem('voter_fingerprint_id', token);
      }
      setVoterToken(token);

      const votedKey = `voted_poll_${pollId}`;
      if (localStorage.getItem(votedKey)) {
        setHasVoted(true);
      }
    }

    async function loadPoll() {
      setLoading(true);
      const data = await getPollById(pollId);
      setPoll(data);
      setLoading(false);
    }

    loadPoll();
  }, [pollId]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (hasVoted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitVote = async () => {
    if (!poll || hasVoted) return;
    setError(null);

    // Ensure user answered all questions in poll
    for (const q of poll.questions) {
      if (!userAnswers[q.id]) {
        setError(`Please select an option for question: "${q.title}"`);
        return;
      }
    }

    setSubmittingVote(true);
    const res = await recordVoteInFirestore(poll.id, voterToken || 'anon_voter', userAnswers);
    setSubmittingVote(false);

    if (res.success) {
      setHasVoted(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`voted_poll_${poll.id}`, 'true');
      }
      // Re-fetch updated vote counts
      const updated = await getPollById(poll.id);
      if (updated) setPoll(updated);
    } else {
      setError(res.error || 'Failed to record vote.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-900">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#003C5E] animate-spin" />
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="bg-white border-2 border-black rounded-[2.5rem] p-12 text-center space-y-4 max-w-xl mx-auto my-12 text-slate-900">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black uppercase">Poll Not Found</h2>
        <p className="text-xs text-slate-600 font-mono">This voting poll may have been deleted or closed.</p>
        <Link
          href="/polls"
          className="inline-block px-6 py-2.5 bg-[#003C5E] text-white rounded-xl text-xs font-mono font-bold uppercase shadow-sm"
        >
          Back to Polls Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 text-slate-900">
      
      {/* Header Bar */}
      <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <Link
            href="/polls"
            className="flex items-center space-x-1 text-xs font-mono font-bold text-[#003C5E] hover:underline uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Polls</span>
          </Link>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#007F6E]" />
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase">
              100% Anonymous Voting
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="text-xs text-slate-600 font-sans mt-1 leading-relaxed">
              {poll.description}
            </p>
          )}
        </div>

        {hasVoted && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-mono font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thank you! Your vote has been recorded anonymously.</span>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {poll.questions.map((q, qIdx) => {
          const totalQVotes = q.options.reduce((sum, o) => sum + (o.voteCount || 0), 0);

          return (
            <div key={q.id} className="bg-white border-2 border-black rounded-[2.5rem] p-6 space-y-5 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  Question {qIdx + 1} of {poll.questions.length}
                </span>
                <h3 className="text-base font-black text-slate-900 uppercase mt-0.5">
                  {q.title}
                </h3>
                {q.description && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{q.description}</p>
                )}
              </div>

              {/* Options list */}
              <div className="space-y-3">
                {q.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[q.id] === opt.id;
                  const votePct = totalQVotes > 0 ? Math.round(((opt.voteCount || 0) / totalQVotes) * 100) : 0;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
                        hasVoted
                          ? 'border-slate-200 cursor-default bg-slate-50'
                          : isSelected
                          ? 'border-[#003C5E] bg-[#003C5E]/5 shadow-sm cursor-pointer'
                          : 'border-slate-200 bg-white hover:border-black cursor-pointer'
                      }`}
                    >
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-[#003C5E] text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>

                          <div className="flex-1">
                            {opt.type === 'image' ? (
                              <img
                                src={opt.value}
                                alt={`Option ${oIdx + 1}`}
                                className="max-h-44 object-contain rounded-xl border border-slate-300 bg-white p-1"
                              />
                            ) : (
                              <p className="text-xs font-mono font-semibold text-slate-800 break-words whitespace-pre-wrap">
                                {opt.value}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Selection check indicator */}
                        <div className="shrink-0 text-right">
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#003C5E] text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 text-xs font-mono font-bold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Vote Action */}
      {!hasVoted && (
        <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 text-center space-y-3 shadow-sm">
          <button
            type="button"
            disabled={submittingVote}
            onClick={handleSubmitVote}
            className="w-full py-4 bg-[#E85D04] hover:bg-[#ba4a03] text-white rounded-2xl text-xs font-mono font-bold uppercase tracking-widest shadow-md transition-all disabled:opacity-50"
          >
            {submittingVote ? 'Submitting Vote...' : 'Submit Anonymous Vote'}
          </button>
        </div>
      )}

    </div>
  );
}
