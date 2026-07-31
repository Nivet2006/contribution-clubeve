'use client';

import React from 'react';
import Link from 'next/link';
import { SAMPLE_ROUNDS } from '@/lib/storage';
import { ShieldCheck, Play, Lock, Eye, CheckCircle2, AlertTriangle, Monitor, Cpu, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12 py-4">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>MANDATORY FOCUS MODE ACTIVE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Secure Contribution Rounds with Real-Time Integrity Monitoring
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Welcome to the ClubEve Contribution Portal. All active evaluation rounds operate under an enforced browser-level Focus Mode. Progress is continuously auto-saved while window presence, tab switches, and security shortcuts are tracked in real time.
          </p>

          {/* Quick System Integrity Capabilities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-slate-300">Fullscreen Lock</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">5s Auto-Save</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300">Anti-Cheat Interceptor</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-slate-300">Audit Log Stream</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Rounds Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Active Evaluation Rounds</h2>
            <p className="text-xs text-slate-400">Select a round to initiate the pre-flight rules check</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAMPLE_ROUNDS.map((round) => (
            <div
              key={round.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-indigo-950/80 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-mono font-medium">
                    {round.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{round.durationMinutes} Minutes</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {round.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Contains {round.totalQuestions} mandatory evaluation questions (MCQ, Short Essay, and Code Editor).
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between mt-6">
                <div className="text-[11px] text-slate-400 font-mono">
                  Focus Mode Required
                </div>

                <Link
                  href={`/round/${round.id}`}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all scale-100 group-hover:scale-105"
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
