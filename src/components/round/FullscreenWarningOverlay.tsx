'use client';

import React from 'react';
import { AlertTriangle, Maximize2, ShieldAlert } from 'lucide-react';

interface FullscreenWarningOverlayProps {
  countdown: number;
  onReturnFullscreen: () => void;
}

export default function FullscreenWarningOverlay({
  countdown,
  onReturnFullscreen,
}: FullscreenWarningOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-rose-950/90 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-500 rounded-3xl p-8 shadow-2xl shadow-rose-950/50 text-center space-y-6 animate-radar">
        
        {/* Warning Icon */}
        <div className="w-20 h-20 bg-rose-500/20 border-2 border-rose-500/40 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-500/20 animate-bounce">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-mono font-bold tracking-wider uppercase">
            FULLSCREEN MODE EXITED
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Return to Full Screen Required
          </h2>
          <p className="text-xs text-rose-200/80">
            Focus Mode rules require active Full Screen mode. Your draft progress has been auto-saved.
          </p>
        </div>

        {/* Live Countdown Display */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-rose-900/50 space-y-2">
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Auto-Submission Grace Period Expiration
          </p>
          <div className="text-5xl font-black text-rose-500 font-mono tracking-tighter">
            00:{countdown < 10 ? `0${countdown}` : countdown}
          </div>
          <p className="text-[11px] text-slate-400">
            Your responses will be automatically submitted if fullscreen is not restored before 00:00.
          </p>
        </div>

        {/* Return Button */}
        <button
          onClick={onReturnFullscreen}
          className="w-full py-4 bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-3 text-sm tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Maximize2 className="w-5 h-5" />
          <span>RETURN TO FULL SCREEN IMMEDIATELY</span>
        </button>

      </div>
    </div>
  );
}
