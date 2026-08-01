'use client';

import React, { useState } from 'react';
import { Submission, Poll, PollQuestion, PollOption } from '@/types/focus';
import { apiSavePoll } from '@/lib/admin-api';
import { compressImage } from '@/lib/image-compressor';
import { X, Plus, Trash2, Upload, AlertCircle } from 'lucide-react';

interface Props {
  selectedSubmissions: Submission[];
  adminEmail: string;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_OPTION = (): PollOption => ({
  id: `opt_${Math.random().toString(36).substring(2, 9)}`,
  type: 'text',
  value: '',
  voteCount: 0,
});

const EMPTY_QUESTION = (): PollQuestion => ({
  id: `pq_${Math.random().toString(36).substring(2, 9)}`,
  title: '',
  description: '',
  options: [EMPTY_OPTION(), EMPTY_OPTION()],
});

export default function CreatePollModal({
  selectedSubmissions,
  adminEmail,
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [questions, setQuestions] = useState<PollQuestion[]>(() => {
    if (selectedSubmissions.length > 0) {
      // Pre-fill Question 1 options anonymously from selected submissions
      const prefilledOptions: PollOption[] = selectedSubmissions.flatMap((sub) =>
        Object.entries(sub.answers).map(([_, ans]) => ({
          id: `opt_${Math.random().toString(36).substring(2, 9)}`,
          type: 'text',
          value: ans || 'Submitted Response',
          voteCount: 0,
        }))
      );

      return [
        {
          id: `pq_${Math.random().toString(36).substring(2, 9)}`,
          title: 'Select Best Contributor Response',
          description: 'Vote for the highest quality response (names & details hidden for full anonymity)',
          options:
            prefilledOptions.length >= 2
              ? prefilledOptions.slice(0, 6)
              : [EMPTY_OPTION(), EMPTY_OPTION()],
        },
      ];
    }
    return [EMPTY_QUESTION()];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Question handlers
  const addQuestion = () => setQuestions((prev) => [...prev, EMPTY_QUESTION()]);
  const removeQuestion = (qIdx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== qIdx));

  const updateQuestion = (qIdx: number, partial: Partial<PollQuestion>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, ...partial } : q))
    );
  };

  // Option handlers
  const addOption = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: [...q.options, EMPTY_OPTION()] } : q
      )
    );
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.filter((_, idx) => idx !== oIdx) }
          : q
      )
    );
  };

  const updateOption = (
    qIdx: number,
    oIdx: number,
    partial: Partial<PollOption>
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOptions = q.options.map((opt, idx) =>
          idx === oIdx ? { ...opt, ...partial } : opt
        );
        return { ...q, options: newOptions };
      })
    );
  };

  const handleImageUpload = async (
    qIdx: number,
    oIdx: number,
    file: File
  ) => {
    try {
      const compressedDataUrl = await compressImage(file);
      updateOption(qIdx, oIdx, { type: 'image', value: compressedDataUrl });
    } catch (err) {
      setError('Image compression failed. Please try a different image.');
    }
  };

  const handlePublishPoll = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Poll Title is required.');
      return;
    }

    if (questions.length === 0) {
      setError('At least one question is required.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.title.trim()) {
        setError(`Question ${i + 1} requires a Title.`);
        return;
      }
      if (q.options.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].value.trim()) {
          setError(`Question ${i + 1}, Option ${j + 1} content cannot be empty.`);
          return;
        }
      }
    }

    setSaving(true);
    const newPoll: Poll = {
      id: `poll_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status: 'ACTIVE',
      questions,
      totalVotes: 0,
      createdAt: Date.now(),
      createdBy: adminEmail,
    };

    const result = await apiSavePoll(newPoll);
    setSaving(false);

    if (!result.success) {
      setError(result.message || 'Failed to publish poll.');
      return;
    }

    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white border-2 border-black rounded-[2.5rem] shadow-2xl overflow-hidden my-6 text-slate-900">
        
        {/* Header */}
        <div className="bg-[#003C5E] p-5 flex items-center justify-between text-white">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Create Anonymous Community Poll
            </h2>
            <p className="text-xs text-white/80 font-mono mt-0.5">
              {selectedSubmissions.length > 0
                ? `Building poll from ${selectedSubmissions.length} selected submission responses`
                : 'Construct custom multi-question community voting poll'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-800 text-sm">
          
          {/* Poll Meta */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                Poll Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Best System Design Architecture Proposal 2026"
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm font-semibold focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                Poll Description / Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief guidelines or voting context for community voters..."
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-none focus:border-black resize-none"
              />
            </div>
          </div>

          {/* Poll Questions List */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#003C5E]">
                Poll Questions ({questions.length})
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1.5 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center space-x-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={q.id} className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="w-6 h-6 rounded-lg bg-[#003C5E] text-white text-xs font-bold font-mono flex items-center justify-center">
                    {qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                    Question Title *
                  </label>
                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) => updateQuestion(qIdx, { title: e.target.value })}
                    placeholder="e.g. Which solution handles high concurrency best?"
                    className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-bold focus:outline-none focus:border-black"
                  />
                </div>

                {/* Question Options */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono font-bold text-slate-600 uppercase">
                      Voting Options ({q.options.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => addOption(qIdx)}
                      className="text-xs text-[#003C5E] font-mono font-bold hover:underline flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Option</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.id} className="flex items-start space-x-2 bg-white p-3 rounded-xl border border-slate-300">
                        <span className="text-xs font-mono font-bold text-slate-400 mt-2 shrink-0">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            {/* Option Type Switcher */}
                            <button
                              type="button"
                              onClick={() => updateOption(qIdx, oIdx, { type: 'text', value: '' })}
                              className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                                opt.type === 'text' ? 'bg-[#003C5E] text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              Text
                            </button>
                            <button
                              type="button"
                              onClick={() => updateOption(qIdx, oIdx, { type: 'image', value: '' })}
                              className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                                opt.type === 'image' ? 'bg-[#003C5E] text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              Image
                            </button>
                          </div>

                          {opt.type === 'text' ? (
                            <textarea
                              rows={2}
                              value={opt.value}
                              onChange={(e) => updateOption(qIdx, oIdx, { value: e.target.value })}
                              placeholder="Enter option response text..."
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-semibold focus:outline-none focus:border-black resize-none"
                            />
                          ) : (
                            <div>
                              {opt.value ? (
                                <div className="relative inline-block border-2 border-black rounded-lg overflow-hidden">
                                  <img src={opt.value} alt="Option preview" className="max-h-28 object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => updateOption(qIdx, oIdx, { value: '' })}
                                    className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-md text-[10px]"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <label className="border-2 border-dashed border-slate-300 hover:border-black rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer">
                                  <Upload className="w-4 h-4 text-slate-400 mb-1" />
                                  <span className="text-xs font-mono font-bold text-[#003C5E]">Upload Option Image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) handleImageUpload(qIdx, oIdx, e.target.files[0]);
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          )}
                        </div>

                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIdx, oIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1 mt-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 text-xs font-mono font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-5 border-t-2 border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-mono">100% Anonymous Public Poll</span>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-mono font-bold uppercase transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handlePublishPoll}
              className="px-6 py-2.5 bg-[#E85D04] hover:bg-[#ba4a03] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
            >
              {saving ? 'Publishing Poll...' : 'Publish Anonymous Poll'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
