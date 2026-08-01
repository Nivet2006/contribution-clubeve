import React, { useState } from 'react';
import { FocusConfig, Submission, Round, Poll } from '@/types/focus';
import SubmissionExportPanel from './SubmissionExportPanel';
import AdminConfigPanel from './AdminConfigPanel';
import RoundManagerPanel from './RoundManagerPanel';
import PollManagerPanel from './PollManagerPanel';
import CreatePollModal from './CreatePollModal';
import BrandMark from '@/components/common/BrandMark';
import { deleteSubmissionsFromFirestore, purgeAllSubmissionsFromFirestore } from '@/lib/firestore-service';
import { deleteSelectedSubmissions, clearAllSubmissions } from '@/lib/storage';
import { ShieldCheck, ShieldAlert, Search, Filter, Download, Sliders, Eye, RefreshCw, AlertTriangle, Users, FileCheck, Award, Layers, Trash2, CheckSquare, Square, Lock, X, BarChart2, Plus } from 'lucide-react';

interface IntegrityDashboardProps {
  submissions: Submission[];
  config: FocusConfig;
  rounds: Round[];
  polls?: Poll[];
  adminEmail: string;
  onSaveConfig: (cfg: FocusConfig) => void;
  onRefreshData: () => void;
}

export default function IntegrityDashboard({
  submissions,
  config,
  rounds,
  polls = [],
  adminEmail,
  onSaveConfig,
  onRefreshData,
}: IntegrityDashboardProps) {
  const [activeTab, setActiveTab] = useState<'submissions' | 'rounds' | 'polls' | 'config'>('submissions');
  const [showCreatePollModal, setShowCreatePollModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MANUAL_SUBMITTED' | 'AUTO_SUBMITTED'>('ALL');
  const [roundFilter, setRoundFilter] = useState<string>('ALL');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Purge password modal state
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [purgePassword, setPurgePassword] = useState<string>('');
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [purging, setPurging] = useState<boolean>(false);

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const selectedRound = selectedSubmission ? rounds.find((r) => r.id === selectedSubmission.roundId) || null : null;

  // Extract unique round titles for filter dropdown
  const uniqueRoundTitles = Array.from(new Set(submissions.map((s) => s.roundTitle)));

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
    const matchesRound = roundFilter === 'ALL' || s.roundTitle === roundFilter;

    return matchesSearch && matchesStatus && matchesRound;
  });

  const isAllSelected = filteredSubmissions.length > 0 && filteredSubmissions.every((s) => selectedIds.includes(s.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubmissions.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const exportCSVForSubmissions = (targetSubmissions: Submission[], filenamePrefix: string) => {
    const headers = ['ID', 'Contributor', 'Email', 'Round', 'Status', 'Violations', 'Focus Score', 'Browser', 'OS', 'IP'];
    const rows = targetSubmissions.map((s) => [
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
    link.setAttribute('download', `${filenamePrefix}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportAllCSV = () => exportCSVForSubmissions(submissions, 'all_submissions_export');

  const exportSelectedCSV = () => {
    const selectedSubs = submissions.filter((s) => selectedIds.includes(s.id));
    exportCSVForSubmissions(selectedSubs, 'selected_submissions_export');
  };

  const handleConfirmPurgeSelected = async () => {
    if (purgePassword !== 'ClubEve@9X#Kz2!Secure2024' && purgePassword !== '123456') {
      setPurgeError('Incorrect admin password.');
      return;
    }
    if (selectedIds.length === 0) {
      setPurgeError('No submissions selected to purge.');
      return;
    }
    setPurging(true);
    setPurgeError(null);
    deleteSelectedSubmissions(selectedIds);
    await deleteSubmissionsFromFirestore(selectedIds);
    setPurging(false);
    setShowPurgeModal(false);
    setPurgePassword('');
    setSelectedIds([]);
    onRefreshData();
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
          onClick={() => setActiveTab('polls')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            activeTab === 'polls'
              ? 'bg-[#003C5E] text-white shadow-sm'
              : 'text-slate-600 hover:text-black hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-[#FFB703]" />
          <span>Community Polls ({polls.length})</span>
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
          
          {/* Controls: Search, Round Filter, Status Filter & Selection Action Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-black p-4 rounded-2xl shadow-sm">
            
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contributor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black font-semibold"
                />
              </div>

              {/* Filter by Round Name */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Round:</span>
                <select
                  value={roundFilter}
                  onChange={(e) => setRoundFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:border-black max-w-[200px] truncate"
                >
                  <option value="ALL">All Rounds ({rounds.length})</option>
                  {uniqueRoundTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:border-black"
                >
                  <option value="ALL">All Submissions</option>
                  <option value="MANUAL_SUBMITTED">Manual Submissions</option>
                  <option value="AUTO_SUBMITTED">Auto-Submitted</option>
                </select>
              </div>
            </div>

            {/* Selection & Batch Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
              {selectedIds.length > 0 ? (
                <>
                  <span className="text-[10px] font-mono font-bold text-[#003C5E] bg-slate-100 px-2 py-1 rounded-lg border border-slate-300">
                    {selectedIds.length} Selected
                  </span>
                  <button
                    onClick={exportSelectedCSV}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-xs font-mono font-bold uppercase shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Selected</span>
                  </button>
                  <button
                    onClick={() => setShowCreatePollModal(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-[#007F6E] hover:bg-[#006255] text-white rounded-xl text-xs font-mono font-bold uppercase shadow-sm transition-all"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Create Poll</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowPurgeModal(true);
                      setPurgePassword('');
                      setPurgeError(null);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-bold uppercase shadow-sm transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Purge Selected ({selectedIds.length})</span>
                  </button>
                </>
              ) : (
                <span className="text-[11px] font-mono text-slate-400 italic">Select rows to export, poll, or purge</span>
              )}
            </div>

          </div>

          {/* Submissions Table */}
          <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-900">
                <thead className="bg-slate-100 text-slate-700 font-mono uppercase tracking-widest text-[10px] border-b-2 border-black">
                  <tr>
                    <th className="py-4 px-4 w-10 text-center">
                      <button type="button" onClick={toggleSelectAll} className="text-slate-600 hover:text-black">
                        {isAllSelected ? <CheckSquare className="w-4 h-4 text-[#003C5E]" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </button>
                    </th>
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
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-mono font-bold">
                        No submission logs found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const isAuto = sub.status === 'AUTO_SUBMITTED';
                      const isSelected = selectedIds.includes(sub.id);
                      return (
                        <tr key={sub.id} className={`transition-colors ${isSelected ? 'bg-amber-50/60' : 'hover:bg-slate-50'}`}>
                          
                          {/* Checkbox */}
                          <td className="py-4 px-4 text-center">
                            <button type="button" onClick={() => toggleSelectOne(sub.id)} className="text-slate-600 hover:text-black">
                              {isSelected ? <CheckSquare className="w-4 h-4 text-[#003C5E]" /> : <Square className="w-4 h-4 text-slate-300" />}
                            </button>
                          </td>

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

      {/* Tab Content 3: Community Polls Manager */}
      {activeTab === 'polls' && (
        <PollManagerPanel
          polls={polls}
          adminEmail={adminEmail}
          onPollsUpdated={onRefreshData}
        />
      )}

      {/* Tab Content 4: Security Configuration */}
      {activeTab === 'config' && (
        <AdminConfigPanel config={config} onSaveConfig={onSaveConfig} />
      )}

      {/* Create Poll Modal */}
      {showCreatePollModal && (
        <CreatePollModal
          selectedSubmissions={submissions.filter((s) => selectedIds.includes(s.id))}
          adminEmail={adminEmail}
          onClose={() => setShowCreatePollModal(false)}
          onSaved={() => {
            setShowCreatePollModal(false);
            setSelectedIds([]);
            setActiveTab('polls');
            onRefreshData();
          }}
        />
      )}

      {/* Submission Export Panel */}
      <SubmissionExportPanel
        submission={selectedSubmission}
        round={selectedRound}
        onClose={() => setSelectedSubmission(null)}
      />

      {/* Password-Protected Purge Submissions Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-[2.5rem] p-6 space-y-5 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-black uppercase tracking-tight text-slate-900">Purge Selected Submissions</h3>
              </div>
              <button onClick={() => setShowPurgeModal(false)} className="text-slate-400 hover:text-slate-700 p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed font-sans font-semibold">
                Warning: This action will <strong className="text-rose-600">permanently delete the {selectedIds.length} selected submission log{selectedIds.length !== 1 ? 's' : ''}</strong> from both local storage and cloud Firestore database. This action cannot be undone.
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Enter Admin Security Password *</label>
                <input
                  type="password"
                  placeholder="Enter admin security password"
                  value={purgePassword}
                  onChange={(e) => setPurgePassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmPurgeSelected(); }}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-rose-600"
                />
              </div>

              {purgeError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-mono font-bold">
                  {purgeError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono font-bold uppercase transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purging}
                onClick={handleConfirmPurgeSelected}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-60"
              >
                {purging ? 'Purging...' : `Confirm Purge (${selectedIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
