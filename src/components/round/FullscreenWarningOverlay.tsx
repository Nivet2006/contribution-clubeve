'use client';

import React from 'react';
import BrandMark from '@/components/common/BrandMark';
import { AlertTriangle, Maximize2 } from 'lucide-react';

interface FullscreenWarningOverlayProps {
  countdown: number;
  onReturnFullscreen: () => void;
}

export default function FullscreenWarningOverlay({
  countdown,
  onReturnFullscreen,
}: FullscreenWarningOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border-4 border-[#E85D04] rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6 animate-radar">
        
        <div className="flex items-center justify-center space-x-2">
          <BrandMark />
        </div>

        {/* Warning Icon */}
        <div className="w-20 h-20 bg-rose-100 border-2 border-[#E85D04] rounded-full flex items-center justify-center mx-auto text-[#E85D04] shadow-lg animate-bounce">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-100 text-[#E85D04] border border-[#E85D04] rounded-full text-xs font-mono font-bold tracking-widest uppercase">
            FULLSCREEN MODE EXITED
          </span>
          <h2 className="text-2xl font-black text-[#0a0a0a] tracking-tight uppercase">
            Return to Full Screen Required
          </h2>
          <p className="text-xs text-slate-700 font-medium">
            Focus Mode rules require active Full Screen mode. Your draft progress has been auto-saved.
          </p>
        </div>

        {/* Live Countdown Display */}
        <div className="bg-rose-50 p-6 rounded-2xl border-2 border-rose-200 space-y-2">
          <p className="text-xs text-slate-700 font-mono font-bold uppercase tracking-wider">
            Auto-Submission Grace Expiration
          </p>
          <div className="text-5xl font-black text-[#E85D04] font-mono tracking-tighter">
            00:{countdown < 10 ? `0${countdown}` : countdown}
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Your responses will be automatically submitted if fullscreen is not restored before 00:00.
          </p>
        </div>

        {/* Return Button */}
        <button
          onClick={onReturnFullscreen}
          className="w-full py-4 bg-[#E85D04] hover:bg-[#ba4a03] text-white font-black rounded-xl shadow-lg flex items-center justify-center space-x-3 text-xs tracking-widest uppercase transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Maximize2 className="w-5 h-5" />
          <span>RETURN TO FULL SCREEN IMMEDIATELY</span>
        </button>

      </div>
    </div>
  );
}
