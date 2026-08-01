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
    <div className="bg-[#15171A] border-2 border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6 text-white">
      
      {/* Question Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#003C5E] text-white border border-[#003C5E] flex items-center justify-center font-bold font-mono text-xs shadow-sm">
            {currentIndex + 1}
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight uppercase">{question.title}</h3>
            <p className="text-xs text-white/70 font-mono font-semibold">Question {currentIndex + 1} of {totalQuestions}</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-slate-800 text-[#FFB703] border border-slate-700 rounded-full text-xs font-mono font-bold uppercase tracking-widest flex items-center space-x-1.5">
          {question.type === 'mcq' && <CheckSquare className="w-3.5 h-3.5 text-[#007F6E]" />}
          {question.type === 'text' && <FileText className="w-3.5 h-3.5 text-[#007F6E]" />}
          {question.type === 'code' && <Code className="w-3.5 h-3.5 text-[#007F6E]" />}
          <span>{question.type === 'mcq' ? 'Multiple Choice' : question.type === 'code' ? 'Code Editor' : 'Short Essay'}</span>
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-white/90 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800 font-sans font-medium">
        {question.description}
      </p>

      {/* Question Input Types */}
      <div className="space-y-4 pt-2">
        {/* 1. Multiple Choice Options */}
        {question.type === 'mcq' && question.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              const optObj = typeof opt === 'string'
                ? { type: 'text' as const, value: opt }
                : opt;
              const optionKey = optObj.value;
              const isSelected = currentAnswer === optionKey;
              const letter = String.fromCharCode(65 + idx);

              return (
                <div
                  key={idx}
                  onClick={() => onChangeAnswer(optionKey)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-emerald-950/60 border-[#007F6E] text-white shadow-sm font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-white/90 hover:bg-slate-800 hover:border-slate-700 font-semibold'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#FFB703] bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                      Option {letter}
                    </span>
                    {isSelected && <CheckCircle className="w-5 h-5 text-[#007F6E] shrink-0" />}
                  </div>

                  {optObj.type === 'text' ? (
                    <span className="text-xs sm:text-sm leading-relaxed">{optObj.value}</span>
                  ) : (
                    <div className="w-full flex justify-center bg-black/40 rounded-xl p-2 border border-slate-800/80">
                      <img
                        src={optObj.value}
                        alt={`Option ${letter}`}
                        className="max-h-48 object-contain rounded-lg transition-transform hover:scale-105"
                      />
                    </div>
                  )}
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
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-white custom-scrollbar leading-relaxed font-sans font-medium"
            />
          </div>
        )}

        {/* 3. Code Editor Input */}
        {question.type === 'code' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-2 border-slate-800 rounded-t-2xl text-[11px] font-mono text-white">
              <span>TypeScript Code Studio</span>
              <span className="text-emerald-400 font-bold">Syntax Check Active</span>
            </div>
            <textarea
              rows={10}
              value={currentAnswer || question.initialCode || ''}
              onChange={(e) => onChangeAnswer(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-b-2xl p-4 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500 custom-scrollbar leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-slate-800">
        <button
          disabled={currentIndex === 0}
          onClick={onPrev}
          className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed bg-slate-900 text-white/40 border border-slate-800'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
        >
          Previous Question
        </button>

        <button
          disabled={currentIndex === totalQuestions - 1}
          onClick={onNext}
          className={`px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            currentIndex === totalQuestions - 1
              ? 'opacity-40 cursor-not-allowed bg-slate-900 text-white/40 border border-slate-800'
              : 'bg-[#003C5E] hover:bg-[#00253b] text-white shadow-sm'
          }`}
        >
          Next Question
        </button>
      </div>

    </div>
  );
}
