'use client';

import React from 'react';
import Link from 'next/link';
import { SAMPLE_ROUNDS } from '@/lib/storage';
import BrandMark from '@/components/common/BrandMark';
import { ShieldCheck, Play, Lock, Eye, Monitor, Cpu, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12 py-4">
      
      {/* Hero Header in Light Brutalist Ocean Depth Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#003C5E] via-[#005247] to-[#007F6E] border-2 border-black rounded-[2.5rem] p-8 sm:p-12 shadow-md text-white">
        <div className="relative z-10 max-w-3xl space-y-6">
          
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-white/10 text-[#FFB703] border border-white/20 rounded-full font-mono text-[10px] uppercase tracking-widest font-bold">
              THE 1% CLUB • FOCUS MODE
            </span>
            <BrandMark />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none">
            Secure Contribution Rounds & Real-Time Integrity Guard
          </h1>

          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans font-medium">
            Welcome to the Club-Eve evaluation ecosystem. All active contribution rounds enforce mandatory browser-level Focus Mode. Progress is continuously backed up locally while window presence, tab switches, and security shortcuts are audited in real time.
          </p>

          {/* Quick System Diagnostics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-[#FFB703] shrink-0" />
              <span className="text-white font-mono text-[11px] font-bold">Fullscreen Lock</span>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="text-white font-mono text-[11px] font-bold">5s Auto-Save</span>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="text-white font-mono text-[11px] font-bold">Anti-Cheat</span>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-[#FFB703] shrink-0" />
              <span className="text-white font-mono text-[11px] font-bold">Admin Stream</span>
            </div>
          </div>

        </div>
      </div>

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
