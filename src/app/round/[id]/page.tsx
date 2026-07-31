'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SAMPLE_ROUNDS, loadDraft, saveSubmission, getAdminConfig } from '@/lib/storage';
import { FocusConfig, Round, Submission, ViolationLog } from '@/types/focus';
import { getDeviceInfo, calculateFocusScore } from '@/lib/focus-engine';

import { useFocusMonitor } from '@/hooks/useFocusMonitor';
import { useAutoSave } from '@/hooks/useAutoSave';

import PreFlightModal from '@/components/round/PreFlightModal';
import FullscreenWarningOverlay from '@/components/round/FullscreenWarningOverlay';
import ViolationToast from '@/components/round/ViolationToast';
import AutoSubmitModal from '@/components/round/AutoSubmitModal';
import QuestionCard from '@/components/round/QuestionCard';

import { Maximize2, Clock, Save, AlertTriangle } from 'lucide-react';

export default function RoundPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params?.id as string;

  const round = SAMPLE_ROUNDS.find((r) => r.id === roundId) || SAMPLE_ROUNDS[0];

  const [adminConfig, setAdminConfig] = useState<FocusConfig>(getAdminConfig());
  const [contributorName, setContributorName] = useState<string>('Jordan Vance');
  const [contributorEmail, setContributorEmail] = useState<string>('jordan.vance@example.com');
  const [isRulesAccepted, setIsRulesAccepted] = useState<boolean>(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(round.durationMinutes * 60);

  const [finalSubmission, setFinalSubmission] = useState<Submission | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Load Draft on Mount
  useEffect(() => {
    const draft = loadDraft(round.id);
    if (draft) {
      setAnswers(draft.answers || {});
      setRemainingSeconds(draft.remainingSeconds || round.durationMinutes * 60);
      if (draft.contributorName) setContributorName(draft.contributorName);
      if (draft.contributorEmail) setContributorEmail(draft.contributorEmail);
      if (draft.isRulesAccepted) setIsRulesAccepted(draft.isRulesAccepted);
    }
  }, [round.id, round.durationMinutes]);

  const isSessionActive = isRulesAccepted && !isSubmitted;

  // Auto Save Hook
  const draftState = {
    answers,
    violations: [],
    violationCount: 0,
    remainingSeconds,
    lastSavedAt: Date.now(),
    contributorName,
    contributorEmail,
    isRulesAccepted,
  };

  const { lastSavedTime, isSaving, forceAutoSave } = useAutoSave(
    round.id,
    draftState,
    adminConfig.autoSaveIntervalSeconds,
    isSessionActive
  );

  // Submission Finalizer
  const finalizeSubmission = useCallback(
    (status: 'MANUAL_SUBMITTED' | 'AUTO_SUBMITTED', reason?: string, currentViolations: ViolationLog[] = []) => {
      if (isSubmitted) return;

      const device = getDeviceInfo();
      const focusScore = calculateFocusScore(currentViolations);
      const now = Date.now();

      const sub: Submission = {
        id: 'sub_' + Math.random().toString(36).substring(2, 9),
        contributorName,
        contributorEmail,
        roundId: round.id,
        roundTitle: round.title,
        startTime: now - (round.durationMinutes * 60 - remainingSeconds) * 1000,
        endTime: now,
        completionTimeFormatted: `${Math.floor((round.durationMinutes * 60 - remainingSeconds) / 60)}m ${
          (round.durationMinutes * 60 - remainingSeconds) % 60
        }s`,
        answers,
        violations: currentViolations,
        violationCount: currentViolations.length,
        focusScore,
        status,
        autoSubmitReason: reason,
        device,
        lastSaveTime: lastSavedTime,
        finalSaveTime: now,
      };

      saveSubmission(sub);
      setFinalSubmission(sub);
      setIsSubmitted(true);
    },
    [answers, contributorEmail, contributorName, isSubmitted, lastSavedTime, remainingSeconds, round]
  );

  // Focus Monitor Hook
  const {
    violations,
    violationCount,
    isFullscreen,
    fullscreenCountdown,
    latestToast,
    isOnline,
    requestFullscreen,
    dismissToast,
  } = useFocusMonitor({
    config: adminConfig,
    isActive: isSessionActive,
    onAutoSave: forceAutoSave,
    onAutoSubmit: (reason) => finalizeSubmission('AUTO_SUBMITTED', reason, violations),
  });

  // Countdown Round Timer
  useEffect(() => {
    if (!isSessionActive) return;

    if (remainingSeconds <= 0) {
      finalizeSubmission('AUTO_SUBMITTED', 'Round Duration Time Expired', violations);
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionActive, remainingSeconds, finalizeSubmission, violations]);

  const handleStartRound = async () => {
    setIsRulesAccepted(true);
    await requestFullscreen();
  };

  const currentQuestion = round.questions[currentQuestionIndex];

  // Render Pre-flight Modal
  if (!isRulesAccepted) {
    return (
      <PreFlightModal
        round={round}
        config={adminConfig}
        contributorName={contributorName}
        contributorEmail={contributorEmail}
        onNameChange={setContributorName}
        onEmailChange={setContributorEmail}
        onAcceptAndEnterFullscreen={handleStartRound}
      />
    );
  }

  // Render Final Submission Lock Screen Modal
  if (isSubmitted && finalSubmission) {
    return <AutoSubmitModal submission={finalSubmission} />;
  }

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const secondsAgo = Math.max(0, Math.floor((Date.now() - lastSavedTime) / 1000));

  return (
    <div className={`space-y-6 ${adminConfig.blockSelection ? 'user-select-none' : ''}`}>
      
      {/* Violation Toast Notification */}
      <ViolationToast
        toast={latestToast}
        violationCount={violationCount}
        maxViolations={adminConfig.maxViolations}
        onDismiss={dismissToast}
      />

      {/* Fullscreen Exit Countdown Overlay */}
      {fullscreenCountdown !== null && (
        <FullscreenWarningOverlay
          countdown={fullscreenCountdown}
          onReturnFullscreen={requestFullscreen}
        />
      )}

      {/* Round Header Bar */}
      <div className="bg-white border-2 border-black rounded-[2rem] p-4 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-900">
        
        {/* Title & Contributor */}
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-black text-[#0a0a0a] tracking-tight uppercase">{round.title}</h2>
            <span className="px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest bg-slate-100 text-[#003C5E] border border-slate-300 font-bold">
              Question {currentQuestionIndex + 1}/{round.totalQuestions}
            </span>
          </div>
          <p className="text-xs text-slate-600 font-mono mt-1 font-semibold">Contributor: {contributorName} ({contributorEmail})</p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold">
          
          {/* Fullscreen Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border ${isFullscreen ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'}`}>
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isFullscreen ? 'FULLSCREEN ACTIVE' : 'FULLSCREEN EXITED'}</span>
          </div>

          {/* Auto-Save Status */}
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-800">
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'text-[#D97706] animate-spin' : 'text-[#007F6E]'}`} />
            <span>{isSaving ? 'Saving...' : `Last saved ${secondsAgo}s ago`}</span>
          </div>

          {/* Violations Counter */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border ${violationCount > 0 ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Violations: {violationCount}/{adminConfig.maxViolations}</span>
          </div>

          {/* Timer Countdown */}
          <div className="flex items-center space-x-1.5 bg-[#003C5E] text-white border border-black px-3.5 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

        </div>

      </div>

      {/* Main Question Card Component */}
      <QuestionCard
        question={currentQuestion}
        currentIndex={currentQuestionIndex}
        totalQuestions={round.totalQuestions}
        currentAnswer={answers[currentQuestion.id] || ''}
        onChangeAnswer={(val) => {
          setAnswers({ ...answers, [currentQuestion.id]: val });
        }}
        onNext={() => setCurrentQuestionIndex((prev) => Math.min(round.totalQuestions - 1, prev + 1))}
        onPrev={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
      />

      {/* Footer Submit Button */}
      <div className="flex items-center justify-between bg-white border-2 border-black p-5 rounded-2xl">
        <span className="text-xs text-slate-600 font-mono font-bold">
          Focus Mode Integrity Monitoring active on all inputs.
        </span>

        <button
          onClick={() => finalizeSubmission('MANUAL_SUBMITTED', undefined, violations)}
          className="px-6 py-3 bg-[#E85D04] hover:bg-[#ba4a03] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
        >
          Submit Round Responses
        </button>
      </div>

    </div>
  );
}
