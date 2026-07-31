'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, CheckCircle2, Lock, Eye } from 'lucide-react';
import { Submission } from '@/types/focus';

interface AutoSubmitModalProps {
  submission: Submission;
}

export default function AutoSubmitModal({ submission }: AutoSubmitModalProps) {
  const isAuto = submission.status === 'AUTO_SUBMITTED';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#15171A] border-2 border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6 text-center text-white">
        
        {/* Header Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-md ${
            isAuto
              ? 'bg-rose-950/80 text-[#E85D04] border-2 border-[#E85D04]'
              : 'bg-emerald-950/80 text-[#007F6E] border-2 border-[#007F6E]'
          }`}
        >
          {isAuto ? <ShieldAlert className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest ${
              isAuto
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
            }`}
          >
            {isAuto ? 'FOCUS MODE VIOLATED - AUTO SUBMITTED' : 'SUBMISSION RECEIVED'}
          </span>

          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            {isAuto ? 'Round Terminated & Submitted' : 'Round Successfully Completed'}
          </h2>

          {isAuto && submission.autoSubmitReason && (
            <p className="text-xs text-[#E85D04] bg-rose-950/50 p-3 rounded-xl border border-rose-800 font-mono font-bold">
              Reason: {submission.autoSubmitReason}
            </p>
          )}
        </div>

        {/* Audit Summary Grid */}
        <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-2xl border-2 border-slate-800 text-xs">
          <div>
            <p className="text-white/70 font-mono text-[10px] uppercase font-bold">Total Violations</p>
            <p className="text-xl font-bold text-white font-mono mt-1">{submission.violationCount}</p>
          </div>
          <div>
            <p className="text-white/70 font-mono text-[10px] uppercase font-bold">Focus Score</p>
            <p
              className={`text-xl font-bold font-mono mt-1 ${
                submission.focusScore >= 80
                  ? 'text-[#007F6E]'
                  : submission.focusScore >= 50
                  ? 'text-[#D97706]'
                  : 'text-[#E85D04]'
              }`}
            >
              {submission.focusScore}%
            </p>
          </div>
          <div>
            <p className="text-white/70 font-mono text-[10px] uppercase font-bold">Lock Status</p>
            <p className="text-xs font-bold text-[#FFB703] flex items-center justify-center space-x-1 mt-1 font-mono uppercase">
              <Lock className="w-3 h-3 text-[#FFB703]" />
              <span>Immutable</span>
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-white/80 font-medium">
          Your answers have been cryptographically locked and transmitted to the Admin Integrity Dashboard for review.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-2 uppercase tracking-wider"
          >
            <span>Return to Round Catalog</span>
          </Link>

          <Link
            href="/admin"
            className="flex-1 py-3 px-4 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md uppercase tracking-wider"
          >
            <Eye className="w-4 h-4 text-[#FFB703]" />
            <span>View Admin Audit</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
