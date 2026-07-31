'use client';

import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ToastProps {
  toast: {
    id: string;
    title: string;
    detail: string;
    severity: string;
  } | null;
  violationCount: number;
  maxViolations: number;
  onDismiss: () => void;
}

export default function ViolationToast({
  toast,
  violationCount,
  maxViolations,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-bounce-short">
      <div className="bg-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xl shadow-amber-950/40 text-white backdrop-blur-xl flex items-start space-x-3">
        
        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5 border border-amber-500/30">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-400 tracking-wide uppercase">
              {toast.title}
            </h4>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Violation {violationCount} / {maxViolations}
            </span>
          </div>

          <p className="text-xs text-slate-200">{toast.detail}</p>
          
          <p className="text-[10px] text-slate-400 italic">
            Automated Draft Saved. Exceeding {maxViolations} violations forces auto-submission.
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
