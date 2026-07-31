'use client';

import React, { useState } from 'react';
import { FocusConfig, Submission, Round } from '@/types/focus';
import SubmissionExportPanel from './SubmissionExportPanel';
import AdminConfigPanel from './AdminConfigPanel';
import RoundManagerPanel from './RoundManagerPanel';
import BrandMark from '@/components/common/BrandMark';
import { ShieldCheck, ShieldAlert, Search, Filter, Download, Sliders, Eye, RefreshCw, AlertTriangle, Users, FileCheck, Award, Layers } from 'lucide-react';

interface IntegrityDashboardProps {
  submissions: Submission[];
  config: FocusConfig;
  rounds: Round[];
  adminEmail: string;
  onSaveConfig: (cfg: FocusConfig) => void;
  onRefreshData: () => void;
}

export default function IntegrityDashboard({
  submissions,
  config,
  rounds,
  adminEmail,
  onSaveConfig,
  onRefreshData,
}: IntegrityDashboardProps) {
  const [activeTab, setActiveTab] = useState<'submissions' | 'rounds' | 'config'>('submissions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MANUAL_SUBMITTED' | 'AUTO_SUBMITTED'>('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const selectedRound = selectedSubmission ? rounds.find((r) => r.id === selectedSubmission.roundId) || null : null;

  // Compute Metrics
  const totalSubmissions = submissions.length;
  const autoSubmittedCount = submissions.filter((s) => s.status === 'AUTO_SUBMITTED').length;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-black p-8 rounded-[2.5rem] shadow-sm text-slate-900">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#003C5E] p-0.5 shadow-md flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#FFB703]" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-[#0a0a0a] tracking-tight uppercase">Admin Integrity Portal</h1>
              <BrandMark role="admin" />
            </div>
            <p className="text-xs text-slate-600 font-mono mt-1 font-semibold">Real-time focus violation tracking & submission audit logs</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefreshData}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Data</span>
          </button>

          <button
            onClick={exportAllCSV}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#E85D04] hover:bg-[#ba4a03] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-mono uppercase tracking-widest font-bold">Total Submissions</span>
            <Users className="w-4 h-4 text-[#003C5E]" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{totalSubmissions}</p>
          <p className="text-[11px] text-slate-600 font-mono font-medium">Active evaluation sessions</p>
        </div>

        <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-mono uppercase tracking-widest font-bold">Auto-Submitted</span>
            <ShieldAlert className="w-4 h-4 text-[#E85D04]" />
          </div>
          <p className="text-3xl font-black text-[#E85D04] font-mono">{autoSubmittedCount}</p>
          <p className="text-[11px] text-[#E85D04] font-mono font-bold">Violations limit exceeded</p>
        </div>

        <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-mono uppercase tracking-widest font-bold">Average Focus</span>
            <Award className="w-4 h-4 text-[#007F6E]" />
          </div>
          <p className={`text-3xl font-black font-mono ${avgFocusScore >= 80 ? 'text-[#007F6E]' : 'text-[#D97706]'}`}>
            {avgFocusScore}%
          </p>
          <p className="text-[11px] text-slate-600 font-mono font-medium">Aggregated integrity score</p>
        </div>

        <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-mono uppercase tracking-widest font-bold">Violations Logged</span>
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          </div>
          <p className="text-3xl font-black text-[#D97706] font-mono">{totalViolations}</p>
          <p className="text-[11px] text-slate-600 font-mono font-medium">Anti-cheat events intercepted</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-3 border-b-2 border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            activeTab === 'submissions'
              ? 'bg-[#003C5E] text-white shadow-sm'
              : 'text-slate-600 hover:text-black hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4 text-[#FFB703]" />
          <span>Submissions Audit ({filteredSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rounds')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            activeTab === 'rounds'
              ? 'bg-[#003C5E] text-white shadow-sm'
              : 'text-slate-600 hover:text-black hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-[#FFB703]" />
          <span>Manage Rounds ({rounds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            activeTab === 'config'
              ? 'bg-[#003C5E] text-white shadow-sm'
              : 'text-slate-600 hover:text-black hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#FFB703]" />
          <span>Security Rules & Thresholds</span>
        </button>
      </div>

      {/* Tab Content 1: Submissions Table */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          
          {/* Controls: Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search contributor, email, or round..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black font-semibold"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:border-black"
              >
                <option value="ALL">All Submissions</option>
                <option value="MANUAL_SUBMITTED">Manual Submissions</option>
                <option value="AUTO_SUBMITTED">Auto-Submitted (Violations)</option>
              </select>
            </div>

          </div>

          {/* Submissions Table */}
          <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-900">
                <thead className="bg-slate-100 text-slate-700 font-mono uppercase tracking-widest text-[10px] border-b-2 border-black">
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

                <tbody className="divide-y divide-slate-200">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-mono font-bold">
                        No submission logs found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const isAuto = sub.status === 'AUTO_SUBMITTED';
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                          
                          {/* Contributor */}
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 font-sans">{sub.contributorName}</div>
                            <div className="text-[11px] text-slate-500 font-mono font-semibold">{sub.contributorEmail}</div>
                          </td>

                          {/* Round */}
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900">{sub.roundTitle}</div>
                            <div className="text-[10px] text-slate-500 font-mono font-semibold">ID: {sub.roundId}</div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span
                              className={`rounded-full font-mono text-[10px] uppercase tracking-widest px-3 py-1 border font-bold ${
                                isAuto
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {isAuto ? 'AUTO SUBMITTED' : 'MANUAL'}
                            </span>
                          </td>

                          {/* Violations */}
                          <td className="py-4 px-6">
                            <span
                              className={`font-mono font-bold ${
                                sub.violationCount > 0 ? 'text-[#E85D04]' : 'text-[#007F6E]'
                              }`}
                            >
                              {sub.violationCount} Violations
                            </span>
                          </td>

                          {/* Focus Score */}
                          <td className="py-4 px-6">
                            <span
                              className={`font-mono font-bold px-2.5 py-1 rounded-lg ${
                                sub.focusScore >= 80
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sub.focusScore >= 50
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {sub.focusScore}%
                            </span>
                          </td>

                          {/* Device & OS */}
                          <td className="py-4 px-6">
                            <div className="text-slate-900 font-mono text-[11px] font-bold">{sub.device.browser}</div>
                            <div className="text-[10px] text-slate-500 font-mono font-medium">{sub.device.os}</div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setSelectedSubmission(sub)}
                              className="px-3.5 py-1.5 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ml-auto shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#FFB703]" />
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

      {/* Tab Content 2: Rounds Manager */}
      {activeTab === 'rounds' && (
        <RoundManagerPanel
          rounds={rounds}
          adminEmail={adminEmail}
          onRoundsUpdated={onRefreshData}
        />
      )}

      {/* Tab Content 3: Security Configuration */}
      {activeTab === 'config' && (
        <AdminConfigPanel config={config} onSaveConfig={onSaveConfig} />
      )}

      {/* Submission Export Panel */}
      <SubmissionExportPanel
        submission={selectedSubmission}
        round={selectedRound}
        onClose={() => setSelectedSubmission(null)}
      />

    </div>
  );
}
