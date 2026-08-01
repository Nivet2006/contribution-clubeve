'use client';

import React, { useState } from 'react';
import { Round, Question, RoundStatus, MCQOption } from '@/types/focus';
import { saveRoundToFirestore } from '@/lib/firestore-service';
import { compressImage } from '@/lib/image-compressor';
import { X, Plus, Trash2, ChevronRight, ChevronLeft, Check, Code, FileText, CheckSquare, Upload, Image as ImageIcon } from 'lucide-react';

interface Props {
  adminEmail: string;
  onClose: () => void;
  onSaved: (round: Round) => void;
}

const EMPTY_QUESTION = (): Question => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  title: '',
  description: '',
  type: 'text',
  placeholder: '',
  options: [
    { type: 'text', value: '' },
    { type: 'text', value: '' },
    { type: 'text', value: '' },
    { type: 'text', value: '' },
  ],
  initialCode: '',
});

export default function CreateRoundModal({ adminEmail, onClose, onSaved }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState(30);
  const [initialStatus, setInitialStatus] = useState<RoundStatus>('HIDDEN');

  // Step 2 fields
  const [questions, setQuestions] = useState<Question[]>([EMPTY_QUESTION()]);

  const addQuestion = () => setQuestions((q) => [...q, EMPTY_QUESTION()]);

  const removeQuestion = (idx: number) =>
    setQuestions((q) => q.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, patch: Partial<Question>) =>
    setQuestions((q) => q.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

  const updateOption = (qIdx: number, oIdx: number, val: string | MCQOption) => {
    const q = [...questions];
    const opts = [...(q[qIdx].options || [])];
    opts[oIdx] = val;
    q[qIdx] = { ...q[qIdx], options: opts };
    setQuestions(q);
  };

  const handleImageUpload = async (qIdx: number, oIdx: number, file: File) => {
    try {
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.75,
        mimeType: 'image/webp',
      });
      updateOption(qIdx, oIdx, { type: 'image', value: compressedDataUrl });
    } catch (err) {
      console.error('Image compression failed:', err);
      setError('Failed to compress image. Please try a different image.');
    }
  };

  const addOption = (qIdx: number) => {
    const q = [...questions];
    q[qIdx] = { ...q[qIdx], options: [...(q[qIdx].options || []), { type: 'text', value: '' }] };
    setQuestions(q);
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    const q = [...questions];
    q[qIdx] = { ...q[qIdx], options: (q[qIdx].options || []).filter((_, i) => i !== oIdx) };
    setQuestions(q);
  };

  const validateStep1 = () => {
    if (!title.trim()) return 'Round title is required.';
    if (!category.trim()) return 'Category is required.';
    if (duration < 1) return 'Duration must be at least 1 minute.';
    return null;
  };

  const validateStep2 = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.title.trim()) return `Question ${i + 1}: Title is required.`;
      if (!q.description.trim()) return `Question ${i + 1}: Description is required.`;
      if (q.type === 'mcq') {
        const opts = (q.options || []).filter((o) => {
          if (typeof o === 'string') return o.trim().length > 0;
          return o.value && o.value.trim().length > 0;
        });
        if (opts.length < 2) return `Question ${i + 1}: MCQ needs at least 2 valid options (text or image).`;
      }
    }
    return null;
  };

  const goNext = () => {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
      setStep(3);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const cleanedQuestions = questions.map((q) => {
      const base = { id: q.id, title: q.title.trim(), description: q.description.trim(), type: q.type };
      if (q.type === 'mcq') {
        const validOpts = (q.options || []).filter((o) => {
          if (typeof o === 'string') return o.trim().length > 0;
          return o.value && o.value.trim().length > 0;
        }).map((o) => typeof o === 'string' ? { type: 'text', value: o.trim() } : { type: o.type, value: o.value });
        return { ...base, options: validOpts };
      }
      if (q.type === 'text') return { ...base, placeholder: q.placeholder || '' };
      if (q.type === 'code') return { ...base, initialCode: q.initialCode || '' };
      return base;
    });

    const round: Round = {
      id: `round_${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      durationMinutes: duration,
      totalQuestions: cleanedQuestions.length,
      questions: cleanedQuestions as Question[],
      status: initialStatus,
      createdAt: Date.now(),
      createdBy: adminEmail,
    };

    const ok = await saveRoundToFirestore(round);
    setSaving(false);
    if (!ok) { setError('Failed to save round to Firestore. Check your connection.'); return; }
    onSaved(round);
    onClose();
  };

  const statusColors: Record<RoundStatus, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    CLOSED: 'bg-amber-100 text-amber-800 border-amber-300',
    HIDDEN: 'bg-slate-100 text-slate-600 border-slate-300',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border-2 border-black rounded-[2.5rem] shadow-2xl overflow-hidden my-6">

        {/* Header */}
        <div className="bg-[#003C5E] p-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Create New Evaluation Round</h2>
            <p className="text-xs text-white/70 font-mono">Step {step} of 3 — {step === 1 ? 'Round Info' : step === 2 ? 'Add Questions' : 'Review & Save'}</p>
          </div>
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= s ? 'bg-[#FFB703] border-[#FFB703] text-black' : 'bg-white/10 border-white/30 text-white/50'}`}>{s}</div>
            ))}
            <button onClick={onClose} className="ml-3 text-white/70 hover:text-white p-1 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Round Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. System Design & Architecture Challenge" className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-sm font-semibold focus:outline-none focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Category *</label>
                  <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. System Architecture" className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-sm font-semibold focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">Duration (Minutes) *</label>
                  <input type="number" min={1} max={180} value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 30)} className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 text-sm font-bold font-mono focus:outline-none focus:border-black" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-2">Initial Visibility Status</label>
                <div className="flex items-center space-x-2">
                  {(['HIDDEN', 'ACTIVE', 'CLOSED'] as RoundStatus[]).map((s) => (
                    <button key={s} type="button" onClick={() => setInitialStatus(s)} className={`px-4 py-2 rounded-xl border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${initialStatus === s ? statusColors[s] + ' border-current' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>{s}</button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">HIDDEN = invisible to contributors · ACTIVE = visible & open · CLOSED = visible but closed</p>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#003C5E] uppercase tracking-widest">Question {idx + 1}</span>
                    <div className="flex items-center space-x-2">
                      {/* Type picker */}
                      <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-xl p-1">
                        {([['text', <FileText className="w-3.5 h-3.5" />, 'Essay'], ['mcq', <CheckSquare className="w-3.5 h-3.5" />, 'MCQ'], ['code', <Code className="w-3.5 h-3.5" />, 'Code']] as [Question['type'], React.ReactNode, string][]).map(([t, icon, label]) => (
                          <button key={t} type="button" onClick={() => updateQuestion(idx, { type: t })} className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${q.type === t ? 'bg-[#003C5E] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{icon}<span>{label}</span></button>
                        ))}
                      </div>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>

                  <input value={q.title} onChange={(e) => updateQuestion(idx, { title: e.target.value })} placeholder="Question title" className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold focus:outline-none focus:border-black" />
                  <textarea rows={2} value={q.description} onChange={(e) => updateQuestion(idx, { description: e.target.value })} placeholder="Full question description / prompt..." className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-medium focus:outline-none focus:border-black resize-none custom-scrollbar" />

                  {q.type === 'mcq' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Answer Options (Text or Compressed Image)</p>
                        <button type="button" onClick={() => addOption(idx)} className="text-[10px] font-mono font-bold text-[#003C5E] hover:underline flex items-center space-x-1"><Plus className="w-3 h-3" /><span>Add Option</span></button>
                      </div>

                      {(q.options || []).map((opt, oIdx) => {
                        const optObj: MCQOption = typeof opt === 'string'
                          ? { type: 'text', value: opt }
                          : opt;
                        const isImage = optObj.type === 'image';

                        return (
                          <div key={oIdx} className="bg-white border border-slate-300 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-mono font-bold text-slate-500 w-5">{String.fromCharCode(65 + oIdx)})</span>
                                <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => updateOption(idx, oIdx, { type: 'text', value: isImage ? '' : optObj.value })}
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${!isImage ? 'bg-[#003C5E] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                  >
                                    Text
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateOption(idx, oIdx, { type: 'image', value: isImage ? optObj.value : '' })}
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${isImage ? 'bg-[#003C5E] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                  >
                                    Image
                                  </button>
                                </div>
                              </div>
                              {(q.options || []).length > 2 && (
                                <button type="button" onClick={() => removeOption(idx, oIdx)} className="text-slate-400 hover:text-rose-500 p-1 rounded"><X className="w-3.5 h-3.5" /></button>
                              )}
                            </div>

                            {!isImage ? (
                              <input
                                value={optObj.value}
                                onChange={(e) => updateOption(idx, oIdx, { type: 'text', value: e.target.value })}
                                placeholder={`Option ${String.fromCharCode(65 + oIdx)} text content`}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-black"
                              />
                            ) : (
                              <div className="space-y-2">
                                {optObj.value ? (
                                  <div className="relative group inline-block bg-slate-100 rounded-xl p-2 border border-slate-300">
                                    {/* Compression size indicator */}
                                    <div className="relative max-w-[200px] max-h-[150px] overflow-hidden rounded-lg">
                                      <img src={optObj.value} alt={`Option ${String.fromCharCode(65 + oIdx)}`} className="object-contain max-h-[140px] rounded-lg" />
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-slate-500">
                                      <span>Compressed WebP</span>
                                      <span>~{Math.round((optObj.value.length * 3) / 4 / 1024)} KB</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => updateOption(idx, oIdx, { type: 'image', value: '' })}
                                      className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 transition-colors"
                                      title="Remove Image"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-slate-300 hover:border-[#003C5E] rounded-xl p-4 text-center transition-colors">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      id={`opt_img_${idx}_${oIdx}`}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(idx, oIdx, file);
                                      }}
                                    />
                                    <label htmlFor={`opt_img_${idx}_${oIdx}`} className="cursor-pointer flex flex-col items-center justify-center space-y-1">
                                      <Upload className="w-5 h-5 text-slate-400" />
                                      <span className="text-xs font-mono font-bold text-[#003C5E]">Upload Option Image</span>
                                      <span className="text-[9px] font-mono text-slate-400">Auto-compressed to &lt;100KB WebP</span>
                                    </label>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {q.type === 'text' && (
                    <input value={q.placeholder || ''} onChange={(e) => updateQuestion(idx, { placeholder: e.target.value })} placeholder="Input placeholder text (optional)" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none focus:border-black" />
                  )}
                  {q.type === 'code' && (
                    <textarea rows={4} value={q.initialCode || ''} onChange={(e) => updateQuestion(idx, { initialCode: e.target.value })} placeholder="// Optional starter code..." className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono text-xs focus:outline-none resize-none custom-scrollbar" />
                  )}
                </div>
              ))}
              <button type="button" onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs font-mono font-bold uppercase hover:border-black hover:text-black transition-all flex items-center justify-center space-x-2"><Plus className="w-4 h-4" /><span>Add Another Question</span></button>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#003C5E]">Round Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-slate-500 font-mono">Title</span><p className="font-black text-slate-900 uppercase">{title}</p></div>
                  <div><span className="text-xs text-slate-500 font-mono">Category</span><p className="font-bold text-slate-900">{category}</p></div>
                  <div><span className="text-xs text-slate-500 font-mono">Duration</span><p className="font-bold text-slate-900 font-mono">{duration} minutes</p></div>
                  <div><span className="text-xs text-slate-500 font-mono">Questions</span><p className="font-bold text-slate-900 font-mono">{questions.length}</p></div>
                  <div><span className="text-xs text-slate-500 font-mono">Initial Status</span><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border mt-0.5 ${statusColors[initialStatus]}`}>{initialStatus}</span></div>
                  <div><span className="text-xs text-slate-500 font-mono">Created By</span><p className="font-mono text-xs text-slate-700">{adminEmail}</p></div>
                </div>
              </div>
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#003C5E]">Questions ({questions.length})</h3>
                <div className="space-y-2">
                  {questions.map((q, i) => (
                    <div key={q.id} className="flex items-center space-x-3 bg-white border border-slate-200 rounded-xl px-3 py-2">
                      <span className="w-6 h-6 rounded-lg bg-[#003C5E] text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="flex-1 text-xs font-semibold text-slate-800 truncate">{q.title || '(Untitled)'}</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{q.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">{error}</div>}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t-2 border-slate-200 p-4 flex items-center justify-between">
          <button type="button" onClick={step === 1 ? onClose : () => setStep((s) => (s - 1) as 1 | 2 | 3)} className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-mono font-bold uppercase hover:bg-slate-100 transition-all">
            <ChevronLeft className="w-4 h-4" /><span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>
          {step < 3 ? (
            <button type="button" onClick={goNext} className="flex items-center space-x-1.5 px-6 py-2 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-sm">
              <span>Next</span><ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" disabled={saving} onClick={handleSave} className="flex items-center space-x-1.5 px-6 py-2 bg-[#E85D04] hover:bg-[#ba4a03] text-white rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-sm disabled:opacity-60">
              {saving ? <><span>Saving...</span></> : <><Check className="w-4 h-4" /><span>Save Round to Firestore</span></>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
