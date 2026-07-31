'use client';

import React, { useState, useEffect } from 'react';
import { getSubmissions, getAdminConfig, saveAdminConfig } from '@/lib/storage';
import { subscribeToSubmissions, subscribeToConfig } from '@/lib/firestore-service';
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

    // Subscribe to Firestore Real-time Submissions Stream
    const unsubscribeSubmissions = subscribeToSubmissions((cloudSubmissions) => {
      if (cloudSubmissions && cloudSubmissions.length > 0) {
        setSubmissions(cloudSubmissions);
      }
    });

    // Subscribe to Firestore Real-time Config Stream
    const unsubscribeConfig = subscribeToConfig((cloudConfig) => {
      if (cloudConfig) {
        setConfig(cloudConfig);
      }
    });

    return () => {
      unsubscribeSubmissions();
      unsubscribeConfig();
    };
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
