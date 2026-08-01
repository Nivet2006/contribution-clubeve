'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchPublicRounds, subscribeToPublicRounds } from '@/lib/firestore-service';
import { SAMPLE_ROUNDS } from '@/lib/storage';
import { Round } from '@/types/focus';
import { Play, Sparkles, Lock, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchPublicRounds().then((res) => {
      setRounds(res);
      setLoading(false);
    });

    // Real-time listener for ACTIVE rounds status changes
    const unsub = subscribeToPublicRounds((updatedRounds) => {
      setRounds(updatedRounds);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="space-y-8 py-4">

      {/* Evaluation Rounds Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#0a0a0a] tracking-tight uppercase">
              Active Evaluation Rounds
            </h2>
            <p className="text-xs text-slate-600 font-mono tracking-tight mt-1">
              Select a round to initiate system pre-flight checks and accept rules
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-3">
              <RefreshCw className="w-7 h-7 text-[#003C5E] animate-spin" />
              <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Loading rounds...</p>
            </div>
          </div>
        ) : rounds.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-[2.5rem] p-12 text-center">
            <p className="text-slate-500 font-mono text-sm font-bold">No active rounds available at this time.</p>
            <p className="text-slate-400 font-mono text-xs mt-2">Check back soon — the admin may open a new round shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rounds.map((round) => {
              const isClosed = round.status === 'CLOSED';
              return (
                <div
                  key={round.id}
                  className={`bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-sm transition-all group flex flex-col justify-between ${isClosed ? 'opacity-75' : 'hover:shadow-md'}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-slate-100 text-[#003C5E] border border-slate-300 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold">
                        {round.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        {isClosed && (
                          <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-mono text-[10px] font-bold uppercase">
                            <Lock className="w-2.5 h-2.5" />
                            <span>CLOSED</span>
                          </span>
                        )}
                        <span className="text-xs text-slate-600 font-mono font-bold flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#E85D04]" />
                          <span>{round.durationMinutes} Minutes</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-[#0a0a0a] group-hover:text-[#003C5E] transition-colors tracking-tight uppercase">
                        {round.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans font-medium">
                        Contains {round.totalQuestions} mandatory evaluation question{round.totalQuestions !== 1 ? 's' : ''} (MCQ, Short Essay, and Code Editor).
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between mt-6">
                    <div className="text-[11px] text-slate-500 font-mono font-semibold">
                      Focus Mode Required
                    </div>

                    {isClosed ? (
                      <span className="flex items-center space-x-2 px-6 py-3 bg-slate-200 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed uppercase tracking-wider">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Round Closed</span>
                      </span>
                    ) : (
                      <Link
                        href={`/round/${round.id}`}
                        className="flex items-center space-x-2 px-6 py-3 bg-[#E85D04] hover:bg-[#ba4a03] text-white font-bold text-xs rounded-xl shadow-md transition-all scale-100 group-hover:scale-105 uppercase tracking-wider"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Round</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
