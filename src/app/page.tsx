'use client';

import React from 'react';
import Link from 'next/link';
import { SAMPLE_ROUNDS } from '@/lib/storage';
import { Play, Sparkles } from 'lucide-react';

export default function HomePage() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAMPLE_ROUNDS.map((round) => (
            <div
              key={round.id}
              className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-slate-100 text-[#003C5E] border border-slate-300 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold">
                    {round.category}
                  </span>
                  <span className="text-xs text-slate-600 font-mono font-bold flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E85D04]" />
                    <span>{round.durationMinutes} Minutes</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#0a0a0a] group-hover:text-[#003C5E] transition-colors tracking-tight uppercase">
                    {round.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans font-medium">
                    Contains {round.totalQuestions} mandatory evaluation questions (MCQ, Short Essay, and Code Editor).
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex items-center justify-between mt-6">
                <div className="text-[11px] text-slate-500 font-mono font-semibold">
                  Focus Mode Required
                </div>

                <Link
                  href={`/round/${round.id}`}
                  className="flex items-center space-x-2 px-6 py-3 bg-[#E85D04] hover:bg-[#ba4a03] text-white font-bold text-xs rounded-xl shadow-md transition-all scale-100 group-hover:scale-105 uppercase tracking-wider"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Round</span>
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
