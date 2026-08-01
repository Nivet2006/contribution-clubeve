'use client';

import React, { useState, useEffect } from 'react';
import { getSubmissions, getAdminConfig, saveAdminConfig } from '@/lib/storage';
import { subscribeToSubmissions, subscribeToConfig, subscribeToRounds, subscribeToPolls, fetchAllSubmissionsFromFirestore } from '@/lib/firestore-service';
import { FocusConfig, Submission, Round, Poll } from '@/types/focus';
import IntegrityDashboard from '@/components/admin/IntegrityDashboard';
import AdminLoginModal from '@/components/admin/AdminLoginModal';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { LogOut, Shield } from 'lucide-react';

export default function AdminPage() {
  const { user, loading, authError, signIn, signOut } = useAdminAuth();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [config, setConfig] = useState<FocusConfig>(getAdminConfig());
  const [rounds, setRounds] = useState<Round[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshData = async () => {
    setIsSyncing(true);
    // 1. Load Local Storage fallback
    const local = getSubmissions();
    setConfig(getAdminConfig());

    // 2. Query Cloud Firestore directly
    const cloudSubs = await fetchAllSubmissionsFromFirestore();
    if (cloudSubs.length > 0) {
      setSubmissions(cloudSubs);
    } else {
      setSubmissions(local);
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    if (!user) return;

    refreshData();

    const unsubSubs = subscribeToSubmissions((cloudSubmissions) => {
      if (cloudSubmissions?.length > 0) setSubmissions(cloudSubmissions);
    });

    const unsubConfig = subscribeToConfig((cloudConfig) => {
      if (cloudConfig) setConfig(cloudConfig);
    });

    const unsubRounds = subscribeToRounds((cloudRounds) => {
      setRounds(cloudRounds);
    });

    const unsubPolls = subscribeToPolls((cloudPolls) => {
      setPolls(cloudPolls);
    });

    return () => {
      unsubSubs();
      unsubConfig();
      unsubRounds();
      unsubPolls();
    };
  }, [user]);

  const handleSaveConfig = (updated: FocusConfig) => {
    saveAdminConfig(updated);
    setConfig(updated);
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#003C5E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — show login gate
  if (!user) {
    return <AdminLoginModal onSignIn={signIn} authError={authError} />;
  }

  // Authenticated — show dashboard
  return (
    <div className="space-y-6">
      {/* Auth Bar */}
      <div className="flex items-center justify-between bg-[#003C5E]/5 border border-[#003C5E]/20 rounded-2xl px-5 py-2.5">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <Shield className="w-3.5 h-3.5 text-[#007F6E]" />
          <span className="text-slate-600">Signed in as</span>
          <span className="font-bold text-[#003C5E]">{user.email}</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-mono font-bold uppercase hover:bg-slate-100 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <IntegrityDashboard
        submissions={submissions}
        config={config}
        rounds={rounds}
        polls={polls}
        adminEmail={user.email || 'admin'}
        isSyncing={isSyncing}
        onSaveConfig={handleSaveConfig}
        onRefreshData={refreshData}
      />
    </div>
  );
}
