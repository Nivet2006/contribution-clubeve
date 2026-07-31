'use client';

import React from 'react';
import { Submission } from '@/types/focus';
import { X, ShieldAlert, Monitor, FileText, AlertTriangle, Download } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border-2 border-black rounded-[2.5rem] shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh] text-slate-900">
        
        {/* Header */}
        <div className="bg-slate-100 p-6 border-b-2 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${isAuto ? 'bg-rose-100 text-[#E85D04] border-rose-300' : 'bg-emerald-100 text-[#007F6E] border-emerald-300'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-[#0a0a0a] tracking-tight uppercase">{submission.contributorName}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border ${isAuto ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                  {submission.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono font-medium">{submission.roundTitle} • {submission.contributorEmail}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadSingleJSON}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-black rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-slate-800 text-sm">
          
          {/* Key Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
              <p className="text-xs text-slate-600 font-mono uppercase font-bold">Focus Score</p>
              <p className={`text-2xl font-black font-mono mt-1 ${submission.focusScore >= 80 ? 'text-[#007F6E]' : submission.focusScore >= 50 ? 'text-[#D97706]' : 'text-[#E85D04]'}`}>
                {submission.focusScore}%
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
              <p className="text-xs text-slate-600 font-mono uppercase font-bold">Violations Count</p>
              <p className="text-2xl font-black font-mono text-slate-900 mt-1">{submission.violationCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
              <p className="text-xs text-slate-600 font-mono uppercase font-bold">Duration</p>
              <p className="text-lg font-bold font-mono text-[#003C5E] mt-1">{submission.completionTimeFormatted || '15m 30s'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
              <p className="text-xs text-slate-600 font-mono uppercase font-bold">Last Draft Save</p>
              <p className="text-xs font-mono text-slate-900 mt-2 font-bold">
                {new Date(submission.lastSaveTime).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Auto submit reason banner */}
          {isAuto && submission.autoSubmitReason && (
            <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-[#E85D04] uppercase tracking-wider block font-mono">Auto-Submit Trigger Reason:</span>
              <p className="text-rose-900 font-mono font-bold">{submission.autoSubmitReason}</p>
            </div>
          )}

          {/* Device & Session Footprint */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#003C5E] flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>Device & Environment Footprint</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-mono block font-semibold">Browser & Engine:</span>
                <span className="font-bold text-slate-900 font-mono">{submission.device.browser}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono block font-semibold">Operating System:</span>
                <span className="font-bold text-slate-900 font-mono">{submission.device.os}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono block font-semibold">Screen Resolution:</span>
                <span className="font-bold text-slate-900 font-mono">{submission.device.screenResolution}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono block font-semibold">Session Token ID:</span>
                <span className="font-mono text-[#003C5E] font-bold">{submission.device.sessionID}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono block font-semibold">IP Address:</span>
                <span className="font-mono text-slate-900 font-bold">{submission.device.ipAddress}</span>
              </div>
            </div>
          </div>

          {/* Chronological Focus Violation Stream */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D97706] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Focus Violation Log Stream ({submission.violations.length})</span>
              </h4>
            </div>

            {submission.violations.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-center text-xs text-[#007F6E] font-mono font-bold border border-emerald-200">
                ✓ No focus mode violations recorded for this submission. Perfect integrity.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {submission.violations.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="p-3 bg-white rounded-xl border border-slate-300 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-500 font-bold">{new Date(v.timestamp).toLocaleTimeString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                        {v.type}
                      </span>
                      <span className="text-slate-900 font-sans font-semibold">{v.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question Answers Audit */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#003C5E] flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Submitted Responses</span>
            </h4>

            <div className="space-y-3">
              {Object.entries(submission.answers).map(([qId, answerText], idx) => (
                <div key={qId} className="bg-white p-4 rounded-xl border border-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                      Question {idx + 1} ({qId})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">Locked Snapshot</span>
                  </div>
                  <pre className="text-xs text-slate-900 font-mono whitespace-pre-wrap bg-slate-100 p-3 rounded-lg border border-slate-300 max-h-40 overflow-y-auto">
                    {answerText || '(No response recorded)'}
                  </pre>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t-2 border-black flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors"
          >
            Close Audit Report
          </button>
        </div>

      </div>
    </div>
  );
}
