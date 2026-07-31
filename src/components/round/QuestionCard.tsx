'use client';

import React from 'react';
import { Question } from '@/types/focus';
import { CheckCircle, Code, FileText, CheckSquare } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  currentAnswer: string;
  onChangeAnswer: (val: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  currentAnswer,
  onChangeAnswer,
  onNext,
  onPrev,
}: QuestionCardProps) {
  return (
    <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6 text-slate-900">
      
      {/* Question Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#003C5E] text-white border border-[#003C5E] flex items-center justify-center font-bold font-mono text-xs shadow-sm">
            {currentIndex + 1}
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0a0a0a] tracking-tight uppercase">{question.title}</h3>
            <p className="text-xs text-slate-500 font-mono font-semibold">Question {currentIndex + 1} of {totalQuestions}</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-slate-100 text-[#003C5E] border border-slate-300 rounded-full text-xs font-mono font-bold uppercase tracking-widest flex items-center space-x-1.5">
          {question.type === 'mcq' && <CheckSquare className="w-3.5 h-3.5 text-[#007F6E]" />}
          {question.type === 'text' && <FileText className="w-3.5 h-3.5 text-[#007F6E]" />}
          {question.type === 'code' && <Code className="w-3.5 h-3.5 text-[#007F6E]" />}
          <span>{question.type === 'mcq' ? 'Multiple Choice' : question.type === 'code' ? 'Code Editor' : 'Short Essay'}</span>
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 font-sans font-medium">
        {question.description}
      </p>

      {/* Question Input Types */}
      <div className="space-y-4 pt-2">
        {/* 1. Multiple Choice Options */}
        {question.type === 'mcq' && question.options && (
          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const isSelected = currentAnswer === opt;
              return (
                <div
                  key={idx}
                  onClick={() => onChangeAnswer(opt)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-[#007F6E] text-slate-900 shadow-sm font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-semibold'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{opt}</span>
                  {isSelected && <CheckCircle className="w-5 h-5 text-[#007F6E] shrink-0" />}
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Text Essay Input */}
        {question.type === 'text' && (
          <div>
            <textarea
              rows={6}
              value={currentAnswer}
              onChange={(e) => onChangeAnswer(e.target.value)}
              placeholder={question.placeholder || 'Type your complete response here...'}
              className="w-full bg-[#f8fafc] border-2 border-slate-300 rounded-2xl p-4 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-black custom-scrollbar leading-relaxed font-sans font-medium"
            />
          </div>
        )}

        {/* 3. Code Editor Input */}
        {question.type === 'code' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-2 border-slate-900 rounded-t-2xl text-[11px] font-mono text-slate-200">
              <span>TypeScript Code Studio</span>
              <span className="text-emerald-400 font-bold">Syntax Check Active</span>
            </div>
            <textarea
              rows={10}
              value={currentAnswer || question.initialCode || ''}
              onChange={(e) => onChangeAnswer(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-900 rounded-b-2xl p-4 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500 custom-scrollbar leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
        <button
          disabled={currentIndex === 0}
          onClick={onPrev}
          className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
          }`}
        >
          Previous Question
        </button>

        <button
          disabled={currentIndex === totalQuestions - 1}
          onClick={onNext}
          className={`px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            currentIndex === totalQuestions - 1
              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
              : 'bg-[#003C5E] hover:bg-[#00253b] text-white shadow-sm'
          }`}
        >
          Next Question
        </button>
      </div>

    </div>
  );
}
