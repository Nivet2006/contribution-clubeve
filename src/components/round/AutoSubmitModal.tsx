'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, CheckCircle2, Lock, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { Submission } from '@/types/focus';

interface AutoSubmitModalProps {
  submission: Submission;
}

export default function AutoSubmitModal({ submission }: AutoSubmitModalProps) {
  const isAuto = submission.status === 'AUTO_SUBMITTED';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        
        {/* Header Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl ${
            isAuto
              ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/40 shadow-rose-500/20'
              : 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 shadow-emerald-500/20'
          }`}
        >
          {isAuto ? <ShieldAlert className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
              isAuto
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isAuto ? 'FOCUS MODE VIOLATED - AUTO SUBMITTED' : 'SUBMISSION RECEIVED'}
          </span>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {isAuto ? 'Round Terminated & Submitted' : 'Round Successfully Completed'}
          </h2>

          {isAuto && submission.autoSubmitReason && (
            <p className="text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-900/60 font-mono">
              Reason: {submission.autoSubmitReason}
            </p>
          )}
        </div>

        {/* Audit Summary Grid */}
        <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
          <div>
            <p className="text-slate-400">Total Violations</p>
            <p className="text-lg font-bold text-white font-mono">{submission.violationCount}</p>
          </div>
          <div>
            <p className="text-slate-400">Focus Score</p>
            <p
              className={`text-lg font-bold font-mono ${
                submission.focusScore >= 80
                  ? 'text-emerald-400'
                  : submission.focusScore >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {submission.focusScore}%
            </p>
          </div>
          <div>
            <p className="text-slate-400">Lock Status</p>
            <p className="text-xs font-semibold text-indigo-400 flex items-center justify-center space-x-1 mt-1">
              <Lock className="w-3 h-3" />
              <span>Immutable</span>
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-slate-400">
          Your answers have been cryptographically locked and transmitted to the Admin Integrity Dashboard for review.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
          >
            <span>Return to Round Catalog</span>
          </Link>

          <Link
            href="/admin"
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
          >
            <Eye className="w-4 h-4" />
            <span>View Admin Integrity Audit</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
