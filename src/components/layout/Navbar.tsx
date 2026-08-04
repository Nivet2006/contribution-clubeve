'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import BrandMark from '@/components/common/BrandMark';
import PatternPicker from '@/components/common/PatternPicker';
import { UserCheck, Eye, Layers, BarChart2, Menu, X, Shield } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isRound = pathname.startsWith('/round');
  const isPolls = pathname === '/polls';
  const isPollDetail = pathname.startsWith('/polls/');

  // Hide nav items on shared direct links (e.g. /polls/poll_123 or /round/rnd_123)
  const isSharedPage = isRound || isPollDetail;

  const [activePattern, setActivePattern] = useState<string>('grid');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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

  const activeRoleLabel = isAdmin ? 'admin' : 'user';

  const badgeStyles = isAdmin
    ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
    : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b-2 border-black text-[#0a0a0a] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand + Role Badge */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-auto group-hover:scale-105 transition-transform flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Club-Eve Logo"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Integrated Role Badge */}
          <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-300">
            <span className={`px-2.5 py-0.5 text-[11px] font-mono font-extrabold rounded-full border uppercase tracking-wider ${badgeStyles}`}>
              {activeRoleLabel}
            </span>
            <BrandMark role={activeRoleLabel} />
          </div>
        </div>

        {/* Center/Right: Desktop Navigation & Utility Hub */}
        {!isSharedPage && (
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1">
              <Link
                href="/"
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  !isAdmin && !isPolls
                    ? 'bg-zinc-100 text-zinc-900 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <UserCheck className="w-4 h-4 text-[#003C5E]" />
                <span>Rounds</span>
              </Link>

              <Link
                href="/polls"
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isPolls
                    ? 'bg-zinc-100 text-zinc-900 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-[#FFB703]" />
                <span>Polls</span>
              </Link>

              <Link
                href="/admin"
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isAdmin
                    ? 'bg-zinc-100 text-zinc-900 font-bold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Eye className="w-4 h-4 text-[#007F6E]" />
                <span>Admin Portal</span>
              </Link>
            </div>

            <div className="h-4 w-px bg-zinc-200" />

            {/* Pattern Picker Button Dropdown */}
            <PatternPicker />

          </div>
        )}

        {/* Focus Mode Indicator on Evaluation Round Pages */}
        {isRound && (
          <div className="flex items-center space-x-3 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-300 text-emerald-800 text-xs font-mono font-bold tracking-widest animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>FOCUS MODE ACTIVE</span>
          </div>
        )}

        {/* Mobile Menu Button */}
        {!isSharedPage && (
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}

      </div>

      {/* Mobile Off-Canvas Drawer */}
      {mobileMenuOpen && !isSharedPage && (
        <div className="md:hidden border-t-2 border-black bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-full border uppercase tracking-wider ${badgeStyles}`}>
              Role: {activeRoleLabel}
            </span>
            <div className="flex items-center space-x-1.5 text-xs font-mono">
              <Layers className="w-3.5 h-3.5 text-[#003C5E]" />
              <select
                value={activePattern}
                onChange={(e) => changePattern(e.target.value)}
                className="bg-slate-100 text-slate-900 font-mono text-xs rounded-lg px-2 py-1 focus:outline-none border border-slate-300 cursor-pointer font-bold"
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
          </div>

          <div className="space-y-1.5 pt-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                !isAdmin && !isPolls
                  ? 'bg-[#003C5E] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Evaluation Rounds</span>
            </Link>

            <Link
              href="/polls"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                isPolls
                  ? 'bg-[#003C5E] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-[#FFB703]" />
              <span>Community Polls</span>
            </Link>

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                isAdmin
                  ? 'bg-[#007F6E] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Admin Integrity Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
