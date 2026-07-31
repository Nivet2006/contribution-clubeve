'use client';

import React from 'react';
import { Submission } from '@/types/focus';
import { X, ShieldAlert, Monitor, Clock, FileText, CheckCircle2, AlertTriangle, Download, Lock } from 'lucide-react';

interface ContributorAuditModalProps {
  submission: Submission | null;
  onClose: () => void;
}

export default function ContributorAuditModal({
  submission,
  onClose,
}: ContributorAuditModalProps) {
  if (!submission) return null;

  const isAuto = submission.status === 'AUTO_SUBMITTED';

  const downloadSingleJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(submission, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `integrity_audit_${submission.contributorName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${isAuto ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{submission.contributorName}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${isAuto ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                  {submission.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400">{submission.roundTitle} • {submission.contributorEmail}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadSingleJSON}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-slate-300 text-sm">
          
          {/* Key Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Focus Score</p>
              <p className={`text-2xl font-black font-mono ${submission.focusScore >= 80 ? 'text-emerald-400' : submission.focusScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {submission.focusScore}%
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Violations Count</p>
              <p className="text-2xl font-black font-mono text-white">{submission.violationCount}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Completion Duration</p>
              <p className="text-lg font-bold font-mono text-indigo-400 mt-1">{submission.completionTimeFormatted || '15m 30s'}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Last Draft Save</p>
              <p className="text-xs font-mono text-slate-300 mt-2">
                {new Date(submission.lastSaveTime).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Auto submit reason banner */}
          {isAuto && submission.autoSubmitReason && (
            <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-rose-400 uppercase tracking-wider block">Auto-Submit Trigger Reason:</span>
              <p className="text-rose-200 font-mono">{submission.autoSubmitReason}</p>
            </div>
          )}

          {/* Device & Session Footprint */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>Device & Environment Footprint</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Browser & Engine:</span>
                <span className="font-medium text-slate-200">{submission.device.browser}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Operating System:</span>
                <span className="font-medium text-slate-200">{submission.device.os}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Screen Resolution:</span>
                <span className="font-medium text-slate-200">{submission.device.screenResolution}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Session Token ID:</span>
                <span className="font-mono text-indigo-300">{submission.device.sessionID}</span>
              </div>
              <div>
                <span className="text-slate-500 block">IP Address:</span>
                <span className="font-mono text-slate-200">{submission.device.ipAddress}</span>
              </div>
            </div>
          </div>

          {/* Chronological Focus Violation Stream */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Focus Violation Log Stream ({submission.violations.length})</span>
              </h4>
            </div>

            {submission.violations.length === 0 ? (
              <div className="p-4 bg-slate-900/60 rounded-xl text-center text-xs text-emerald-400 font-mono">
                ✓ No focus mode violations recorded for this submission. Perfect integrity.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {submission.violations.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-500">{new Date(v.timestamp).toLocaleTimeString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        {v.type}
                      </span>
                      <span className="text-slate-300 font-sans">{v.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question Answers Audit */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Submitted Responses</span>
            </h4>

            <div className="space-y-3">
              {Object.entries(submission.answers).map(([qId, answerText], idx) => (
                <div key={qId} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Question {idx + 1} ({qId})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Locked Snapshot</span>
                  </div>
                  <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap bg-slate-950 p-3 rounded-lg border border-slate-800/80 max-h-40 overflow-y-auto">
                    {answerText || '(No response recorded)'}
                  </pre>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Audit Report
          </button>
        </div>

      </div>
    </div>
  );
}
