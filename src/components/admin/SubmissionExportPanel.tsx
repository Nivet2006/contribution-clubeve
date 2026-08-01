'use client';

import React, { useState, useCallback } from 'react';
import { Submission, Round } from '@/types/focus';
import { X, Download, FileJson, FileSpreadsheet, FileText, Eye, CheckCircle, AlertTriangle, Clock, Monitor } from 'lucide-react';

interface Props {
  submission: Submission | null;
  round?: Round | null;
  onClose: () => void;
}

type ExportTab = 'form' | 'json' | 'excel' | 'pdf';

const TAB_CONFIG: { key: ExportTab; label: string; icon: React.ReactNode }[] = [
  { key: 'form', label: 'Form View', icon: <Eye className="w-3.5 h-3.5" /> },
  { key: 'json', label: 'JSON', icon: <FileJson className="w-3.5 h-3.5" /> },
  { key: 'excel', label: 'Excel (.xlsx)', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
  { key: 'pdf', label: 'PDF Report', icon: <FileText className="w-3.5 h-3.5" /> },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export default function SubmissionExportPanel({ submission, round, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<ExportTab>('form');
  const [exporting, setExporting] = useState(false);

  // ── EXCEL ─────────────────────────────────────────────────────────────────────
  const handleDownloadExcel = useCallback(async () => {
    if (!submission) return;
    setExporting(true);
    try {
      const XLSX = (await import('xlsx')).default;

      // Sheet 1: Summary
      const summaryData = [
        ['Field', 'Value'],
        ['Contributor Name', submission.contributorName],
        ['Email', submission.contributorEmail],
        ['Round Title', submission.roundTitle],
        ['Round ID', submission.roundId],
        ['Submission Status', submission.status],
        ['Focus Score', `${submission.focusScore}%`],
        ['Violations', submission.violationCount],
        ['Start Time', new Date(submission.startTime).toLocaleString()],
        ['End Time', submission.endTime ? new Date(submission.endTime).toLocaleString() : '-'],
        ['Completion Time', submission.completionTimeFormatted || '-'],
        ['Browser', submission.device.browser],
        ['OS', submission.device.os],
        ['Screen Resolution', submission.device.screenResolution],
        ['Session ID', submission.device.sessionID],
        ['IP Address', submission.device.ipAddress],
        ['Auto Submit Reason', submission.autoSubmitReason || '-'],
      ];

      // Sheet 2: Answers
      const answersData = [['Question ID', 'Answer']];
      Object.entries(submission.answers).forEach(([qId, ans]) => {
        const qTitle = round?.questions.find((q) => q.id === qId)?.title || qId;
        answersData.push([qTitle, ans]);
      });

      // Sheet 3: Violations
      const violationsData = [['#', 'Timestamp', 'Type', 'Severity', 'Detail']];
      submission.violations.forEach((v, i) => {
        violationsData.push([
          String(i + 1),
          new Date(v.timestamp).toLocaleString(),
          v.type,
          v.severity,
          v.detail,
        ]);
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(answersData), 'Answers');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(violationsData), 'Violations');

      XLSX.writeFile(wb, `submission_${safeName(submission.contributorName)}_${submission.id}.xlsx`);
    } finally {
      setExporting(false);
    }
  }, [submission, round]);

  // ── PDF ──────────────────────────────────────────────────────────────────────
  const handleDownloadPDF = useCallback(async () => {
    if (!submission) return;
    setExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const accent = [0, 60, 94] as [number, number, number];
      const gold = [215, 119, 6] as [number, number, number];

      // Header
      doc.setFillColor(...accent);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('CLUB-EVE 1% CLUB', 14, 12);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Evaluation Round Submission Report', 14, 20);
      doc.setTextColor(...gold);
      doc.text('|||..||', 185, 14);

      // Submission meta
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(submission.roundTitle.toUpperCase(), 14, 40);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Contributor: ${submission.contributorName} (${submission.contributorEmail})`, 14, 47);
      doc.text(`Status: ${submission.status}   Focus Score: ${submission.focusScore}%   Violations: ${submission.violationCount}`, 14, 53);
      doc.text(`Submitted: ${submission.endTime ? new Date(submission.endTime).toLocaleString() : '-'}   Duration: ${submission.completionTimeFormatted || '-'}`, 14, 59);

      // Answers table
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Question Answers', 14, 72);

      const answerRows = Object.entries(submission.answers).map(([qId, ans]) => {
        const qTitle = round?.questions.find((q) => q.id === qId)?.title || qId;
        return [qTitle, ans || '(No answer)'];
      });

      autoTable(doc, {
        startY: 76,
        head: [['Question', 'Answer']],
        body: answerRows,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: accent, textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 120 } },
      });

      // Violations table
      const afterAnswers = (doc as any).lastAutoTable?.finalY || 140;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Focus Violations Log', 14, afterAnswers + 12);

      if (submission.violations.length === 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('No violations recorded.', 14, afterAnswers + 20);
      } else {
        autoTable(doc, {
          startY: afterAnswers + 16,
          head: [['#', 'Time', 'Type', 'Severity', 'Detail']],
          body: submission.violations.map((v, i) => [
            i + 1,
            new Date(v.timestamp).toLocaleTimeString(),
            v.type,
            v.severity,
            v.detail,
          ]),
          styles: { fontSize: 7.5, cellPadding: 2 },
          headStyles: { fillColor: [220, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
        });
      }

      // Device footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`Club-Eve Secure Platform · ${submission.device.browser} on ${submission.device.os} · Session: ${submission.device.sessionID}`, 14, 290);
        doc.text(`Page ${i} of ${totalPages}`, 185, 290);
      }

      doc.save(`submission_report_${safeName(submission.contributorName)}_${submission.id}.pdf`);
    } finally {
      setExporting(false);
    }
  }, [submission, round]);

  if (!submission) return null;

  // ── JSON ─────────────────────────────────────────────────────────────────────
  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(submission, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `submission_${safeName(submission.contributorName)}_${submission.id}.json`);
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white border-2 border-black rounded-[2.5rem] shadow-2xl overflow-hidden my-6">

        {/* Header */}
        <div className="bg-[#003C5E] p-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight">Submission Report</h2>
            <p className="text-xs text-white/70 font-mono">{submission.contributorName} · {submission.roundTitle}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center space-x-1 px-5 pt-4 pb-2 border-b border-slate-200">
          {TAB_CONFIG.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${activeTab === t.key ? 'bg-[#003C5E] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="p-5 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-4">

          {/* ── FORM VIEW ──────────────────────────────────────────────────── */}
          {activeTab === 'form' && (
            <div className="space-y-5">
              {/* Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Status', value: submission.status === 'AUTO_SUBMITTED' ? '⚠ AUTO' : '✓ MANUAL', color: submission.status === 'AUTO_SUBMITTED' ? 'text-rose-600' : 'text-emerald-700' },
                  { label: 'Focus Score', value: `${submission.focusScore}%`, color: submission.focusScore >= 80 ? 'text-emerald-700' : submission.focusScore >= 50 ? 'text-amber-700' : 'text-rose-600' },
                  { label: 'Violations', value: String(submission.violationCount), color: submission.violationCount > 0 ? 'text-rose-600' : 'text-emerald-700' },
                  { label: 'Duration', value: submission.completionTimeFormatted || '-', color: 'text-slate-700' },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 font-mono uppercase">{item.label}</p>
                    <p className={`text-lg font-black font-mono ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Contributor Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
                {[
                  ['Name', submission.contributorName],
                  ['Email', submission.contributorEmail],
                  ['Browser', submission.device.browser],
                  ['OS', submission.device.os],
                  ['Screen', submission.device.screenResolution],
                  ['IP Address', submission.device.ipAddress],
                  ['Started', formatTime(submission.startTime)],
                  ['Submitted', submission.endTime ? formatTime(submission.endTime) : '-'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">{label}</p>
                    <p className="font-semibold text-slate-800 break-all">{value}</p>
                  </div>
                ))}
              </div>

              {/* Answers */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#003C5E]">Question Answers</h3>
                {round && round.questions.length > 0 ? (
                  round.questions.map((q, idx) => {
                    const rawAns = submission.answers[q.id];
                    const hasAnswer = rawAns !== undefined && rawAns !== null && rawAns.trim().length > 0;
                    return (
                      <div key={q.id} className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase border border-slate-200">
                              Question {idx + 1} · {q.type.toUpperCase()}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 mt-1.5">{q.title}</h4>
                            {q.description && (
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{q.description}</p>
                            )}
                          </div>
                          {hasAnswer ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1 shrink-0">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ANSWERED</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1 shrink-0">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>NO ANSWER</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Contributor Response</p>
                          <div
                            className={`p-3.5 rounded-xl text-xs font-mono break-words whitespace-pre-wrap ${
                              q.type === 'code'
                                ? 'bg-slate-900 text-emerald-300 border border-slate-800 leading-relaxed'
                                : 'bg-slate-50 text-slate-800 border border-slate-200 font-semibold'
                            }`}
                          >
                            {hasAnswer ? rawAns : <span className="text-slate-400 italic">No response submitted</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  Object.entries(submission.answers).map(([qId, ans], idx) => (
                    <div key={qId} className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Question {idx + 1} ({qId})</span>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 font-semibold break-words whitespace-pre-wrap">
                        {ans || <span className="text-slate-400 italic">No answer provided</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Violations */}
              {submission.violations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-rose-600">Violations ({submission.violationCount})</h3>
                  <div className="space-y-1.5">
                    {submission.violations.map((v, i) => (
                      <div key={v.id} className="flex items-start space-x-3 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                        <span className="text-[10px] font-mono text-rose-400 font-bold w-5">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold text-rose-700 uppercase">{v.type}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold ${v.severity === 'CRITICAL' ? 'bg-rose-200 text-rose-800' : v.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>{v.severity}</span>
                          </div>
                          <p className="text-[10px] text-rose-600 mt-0.5">{v.detail}</p>
                        </div>
                        <span className="text-[9px] text-rose-400 font-mono shrink-0">{new Date(v.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── JSON ────────────────────────────────────────────────────────── */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={handleDownloadJSON} className="flex items-center space-x-2 px-4 py-2 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-sm">
                  <Download className="w-4 h-4" /><span>Download JSON</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-300 font-mono text-[11px] p-5 rounded-2xl overflow-x-auto max-h-[50vh] custom-scrollbar leading-relaxed">
                {JSON.stringify(submission, null, 2)}
              </pre>
            </div>
          )}

          {/* ── EXCEL ───────────────────────────────────────────────────────── */}
          {activeTab === 'excel' && (
            <div className="space-y-4 text-center">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 space-y-4">
                <FileSpreadsheet className="w-12 h-12 text-emerald-600 mx-auto" />
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-sm">Excel Workbook Export</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">Generates a multi-sheet .xlsx file with 3 tabs: Summary, Answers, and Violations Log.</p>
                </div>
                <button disabled={exporting} onClick={handleDownloadExcel} className="flex items-center space-x-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-sm mx-auto disabled:opacity-60">
                  <Download className="w-4 h-4" /><span>{exporting ? 'Generating...' : 'Download .xlsx'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ── PDF ─────────────────────────────────────────────────────────── */}
          {activeTab === 'pdf' && (
            <div className="space-y-4 text-center">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 space-y-4">
                <FileText className="w-12 h-12 text-rose-600 mx-auto" />
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-sm">PDF Report Export</h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">Generates a formatted A4 PDF with Club-Eve branding, contributor details, all answers, and violation log.</p>
                </div>
                <button disabled={exporting} onClick={handleDownloadPDF} className="flex items-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-sm mx-auto disabled:opacity-60">
                  <Download className="w-4 h-4" /><span>{exporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
