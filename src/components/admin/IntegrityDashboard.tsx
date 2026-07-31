'use client';

import React, { useState } from 'react';
import { FocusConfig, Submission } from '@/types/focus';
import ContributorAuditModal from './ContributorAuditModal';
import AdminConfigPanel from './AdminConfigPanel';
import { ShieldCheck, ShieldAlert, Search, Filter, Download, Sliders, Eye, RefreshCw, AlertTriangle, Users, FileCheck, Award } from 'lucide-react';

interface IntegrityDashboardProps {
  submissions: Submission[];
  config: FocusConfig;
  onSaveConfig: (cfg: FocusConfig) => void;
  onRefreshData: () => void;
}

export default function IntegrityDashboard({
  submissions,
  config,
  onSaveConfig,
  onRefreshData,
}: IntegrityDashboardProps) {
  const [activeTab, setActiveTab] = useState<'submissions' | 'config'>('submissions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MANUAL_SUBMITTED' | 'AUTO_SUBMITTED'>('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Compute Metrics
  const totalSubmissions = submissions.length;
  const autoSubmittedCount = submissions.filter((s) => s.status === 'AUTO_SUBMITTED').length;
  const manualSubmittedCount = submissions.filter((s) => s.status === 'MANUAL_SUBMITTED').length;
  const avgFocusScore = totalSubmissions > 0
    ? Math.round(submissions.reduce((acc, s) => acc + s.focusScore, 0) / totalSubmissions)
    : 100;
  const totalViolations = submissions.reduce((acc, s) => acc + s.violationCount, 0);

  // Filter Submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.contributorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contributorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roundTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportAllCSV = () => {
    const headers = ['ID', 'Contributor', 'Email', 'Round', 'Status', 'Violations', 'Focus Score', 'Browser', 'OS', 'IP'];
    const rows = submissions.map((s) => [
      s.id,
      `"${s.contributorName}"`,
      s.contributorEmail,
      `"${s.roundTitle}"`,
      s.status,
      s.violationCount,
      `${s.focusScore}%`,
      `"${s.device.browser}"`,
      `"${s.device.os}"`,
      s.device.ipAddress,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `integrity_submissions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Integrity Dashboard</h1>
            <p className="text-xs text-slate-400">Real-time focus violation tracking & submission audit logs</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefreshData}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Latest Data</span>
          </button>

          <button
            onClick={exportAllCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Submissions</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">{totalSubmissions}</p>
          <p className="text-[11px] text-slate-400">Active contributor sessions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Auto-Submitted</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-400 font-mono">{autoSubmittedCount}</p>
          <p className="text-[11px] text-rose-300/80 font-medium">Focus mode violations threshold exceeded</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Average Focus Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className={`text-3xl font-black font-mono ${avgFocusScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {avgFocusScore}%
          </p>
          <p className="text-[11px] text-slate-400">Aggregated session focus metric</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Violations Logged</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 font-mono">{totalViolations}</p>
          <p className="text-[11px] text-slate-400">Total detected anti-cheat events</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'submissions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Submissions Integrity Audit ({filteredSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'config'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Security Rules & Thresholds</span>
        </button>
      </div>

      {/* Tab Content 1: Submissions Table */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          
          {/* Controls: Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search contributor name, email, or round..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Submission Types</option>
                <option value="MANUAL_SUBMITTED">Manual Submissions</option>
                <option value="AUTO_SUBMITTED">Auto-Submitted (Violations)</option>
              </select>
            </div>

          </div>

          {/* Submissions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Contributor</th>
                    <th className="py-4 px-6">Round Title</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Violations</th>
                    <th className="py-4 px-6">Focus Score</th>
                    <th className="py-4 px-6">Device & OS</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                        No submission logs found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const isAuto = sub.status === 'AUTO_SUBMITTED';
                      return (
                        <tr key={sub.id} className="hover:bg-slate-950/40 transition-colors">
                          
                          {/* Contributor */}
                          <td className="py-4 px-6">
                            <div className="font-bold text-white">{sub.contributorName}</div>
                            <div className="text-[11px] text-slate-400">{sub.contributorEmail}</div>
                          </td>

                          {/* Round */}
                          <td className="py-4 px-6">
                            <div className="font-medium text-slate-200">{sub.roundTitle}</div>
                            <div className="text-[10px] text-slate-500 font-mono">ID: {sub.roundId}</div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                isAuto
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {isAuto ? 'AUTO SUBMITTED' : 'MANUAL'}
                            </span>
                          </td>

                          {/* Violations */}
                          <td className="py-4 px-6">
                            <span
                              className={`font-mono font-bold ${
                                sub.violationCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {sub.violationCount} Violations
                            </span>
                          </td>

                          {/* Focus Score */}
                          <td className="py-4 px-6">
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded-lg ${
                                sub.focusScore >= 80
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : sub.focusScore >= 50
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {sub.focusScore}%
                            </span>
                          </td>

                          {/* Device & OS */}
                          <td className="py-4 px-6">
                            <div className="text-slate-300">{sub.device.browser}</div>
                            <div className="text-[10px] text-slate-500">{sub.device.os}</div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setSelectedSubmission(sub)}
                              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-indigo-500/30 flex items-center space-x-1.5 ml-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Audit Details</span>
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab Content 2: Security Configuration */}
      {activeTab === 'config' && (
        <AdminConfigPanel config={config} onSaveConfig={onSaveConfig} />
      )}

      {/* Contributor Integrity Audit Drawer/Modal */}
      <ContributorAuditModal
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />

    </div>
  );
}
