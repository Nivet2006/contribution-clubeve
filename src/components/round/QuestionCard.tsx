'use client';

import React from 'react';
import { Question } from '@/types/focus';
import { CheckCircle, Code, FileText, CheckSquare, Sparkles } from 'lucide-react';

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
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      
      {/* Question Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
            {currentIndex + 1}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{question.title}</h3>
            <p className="text-xs text-slate-400">Question {currentIndex + 1} of {totalQuestions}</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-slate-950 text-indigo-400 border border-slate-800 rounded-full text-xs font-mono font-medium capitalize flex items-center space-x-1.5">
          {question.type === 'mcq' && <CheckSquare className="w-3.5 h-3.5" />}
          {question.type === 'text' && <FileText className="w-3.5 h-3.5" />}
          {question.type === 'code' && <Code className="w-3.5 h-3.5" />}
          <span>{question.type === 'mcq' ? 'Multiple Choice' : question.type === 'code' ? 'Code Editor' : 'Short Essay'}</span>
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
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
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium">{opt}</span>
                  {isSelected && <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />}
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
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 custom-scrollbar leading-relaxed font-sans"
            />
          </div>
        )}

        {/* 3. Code Editor Input */}
        {question.type === 'code' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-t-xl text-[11px] font-mono text-slate-400">
              <span>TypeScript Editor</span>
              <span className="text-emerald-400">Syntax Check Active</span>
            </div>
            <textarea
              rows={10}
              value={currentAnswer || question.initialCode || ''}
              onChange={(e) => onChangeAnswer(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-b-xl p-4 text-emerald-300 font-mono text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 custom-scrollbar leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          disabled={currentIndex === 0}
          onClick={onPrev}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-600'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          Previous Question
        </button>

        <button
          disabled={currentIndex === totalQuestions - 1}
          onClick={onNext}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            currentIndex === totalQuestions - 1
              ? 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-600'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
          }`}
        >
          Next Question
        </button>
      </div>

    </div>
  );
}
