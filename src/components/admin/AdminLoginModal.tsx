'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldAlert, Eye, EyeOff, Lock } from 'lucide-react';

interface AdminLoginModalProps {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  authError: string | null;
}

export default function AdminLoginModal({ onSignIn, authError }: AdminLoginModalProps) {
  const [email, setEmail] = useState('help@clubeve.nivet2006.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSignIn(email, password);
    setIsLoading(false);
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-black rounded-[2.5rem] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#003C5E] p-6 flex flex-col items-center text-white space-y-3">
          <div className="h-12 w-auto">
            <Image src="/logo.png" alt="Club-Eve Logo" width={140} height={48} className="h-12 w-auto object-contain" priority />
          </div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#FFB703]" />
            <h2 className="text-lg font-black tracking-tight uppercase text-white" style={{ color: '#ffffff' }}>Admin Portal Access</h2>
          </div>
          <p className="text-xs text-white/80 font-mono text-center">
            Restricted to authorised Club-Eve administrators only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-sm font-semibold focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter admin password"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2.5 pr-10 text-slate-900 text-sm font-semibold focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Auth Error */}
          {authError && (
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-60"
          >
            <Lock className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
