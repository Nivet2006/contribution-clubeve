'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandMark from '@/components/common/BrandMark';
import { ShieldCheck, UserCheck, Eye, Layers } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isRound = pathname.startsWith('/round');

  const [activePattern, setActivePattern] = useState<string>('grid');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const stored = localStorage.getItem('club_eve_pattern') || 'grid';
      setActivePattern(stored);
      document.documentElement.setAttribute('data-pattern', stored);
    }
  }, []);

  const changePattern = (pat: string) => {
    setActivePattern(pat);
    localStorage.setItem('club_eve_pattern', pat);
    document.documentElement.setAttribute('data-pattern', pat);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-black text-[#0a0a0a] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#003C5E] p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#FFB703]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-[#0a0a0a]">
                  CLUB-EVE
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase bg-[#007F6E]/10 text-[#007F6E] border border-[#007F6E]/30 rounded-full">
                  1% CLUB
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-mono tracking-tighter">
                SECURE FOCUS & INTEGRITY PLATFORM
              </p>
            </div>
          </Link>

          {/* Integrated Brand Mark */}
          <div className="hidden sm:block pl-2 border-l border-slate-300">
            <BrandMark role={isAdmin ? 'admin' : 'user'} />
          </div>
        </div>

        {/* Mode Switcher & Pattern Selector */}
        {!isRound && (
          <div className="flex items-center space-x-3">
            
            {/* Pattern Switcher Dropdown */}
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs">
              <Layers className="w-3.5 h-3.5 text-[#003C5E]" />
              <span className="text-[11px] font-mono text-slate-700 uppercase font-bold">Pattern:</span>
              <select
                value={activePattern}
                onChange={(e) => changePattern(e.target.value)}
                className="bg-white text-slate-900 font-mono text-[11px] rounded-lg px-2 py-1 focus:outline-none border border-slate-300 cursor-pointer font-semibold"
              >
                <option value="grid">Grid</option>
                <option value="dots">Dots</option>
                <option value="cross">Cross</option>
                <option value="diagonal">Diagonal</option>
                <option value="waves">Waves</option>
                <option value="hexagon">Hexagon</option>
                <option value="circuit">Circuit</option>
                <option value="none">None</option>
              </select>
            </div>

            {/* Role Switcher Nav */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-300">
              <Link
                href="/"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  !isAdmin
                    ? 'bg-[#003C5E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-black hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Contributor</span>
              </Link>

              <Link
                href="/admin"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  isAdmin
                    ? 'bg-[#007F6E] text-white shadow-sm'
                    : 'text-slate-600 hover:text-black hover:bg-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Admin Audit</span>
              </Link>
            </div>

          </div>
        )}

        {/* Focus Mode Active Indicator for Round page */}
        {isRound && (
          <div className="flex items-center space-x-3 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-300 text-emerald-800 text-xs font-mono font-bold tracking-widest animate-pulse-subtle">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>FOCUS MODE ACTIVE</span>
          </div>
        )}

      </div>
    </header>
  );
}
