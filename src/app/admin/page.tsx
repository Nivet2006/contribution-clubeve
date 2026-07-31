'use client';

import React, { useState, useEffect } from 'react';
import { getSubmissions, getAdminConfig, saveAdminConfig } from '@/lib/storage';
import { FocusConfig, Submission } from '@/types/focus';
import IntegrityDashboard from '@/components/admin/IntegrityDashboard';

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [config, setConfig] = useState<FocusConfig>(getAdminConfig());

  const refreshData = () => {
    setSubmissions(getSubmissions());
    setConfig(getAdminConfig());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveConfig = (updated: FocusConfig) => {
    saveAdminConfig(updated);
    setConfig(updated);
  };

  return (
    <div className="space-y-6">
      <IntegrityDashboard
        submissions={submissions}
        config={config}
        onSaveConfig={handleSaveConfig}
        onRefreshData={refreshData}
      />
    </div>
  );
}
