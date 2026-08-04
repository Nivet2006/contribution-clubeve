'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { saveSubmission, getAdminConfig } from '@/lib/storage';
import { getRoundById, loadDraftFromFirestore } from '@/lib/firestore-service';
import { ensureAnonymousAuth } from '@/lib/firebase';
import { FocusConfig, Round, Submission, ViolationLog } from '@/types/focus';
import { getDeviceInfo, calculateFocusScore } from '@/lib/focus-engine';

import { useFocusMonitor } from '@/hooks/useFocusMonitor';
import { useAutoSave } from '@/hooks/useAutoSave';

import PreFlightModal from '@/components/round/PreFlightModal';
import FullscreenWarningOverlay from '@/components/round/FullscreenWarningOverlay';
import ViolationToast from '@/components/round/ViolationToast';
import AutoSubmitModal from '@/components/round/AutoSubmitModal';
import QuestionCard from '@/components/round/QuestionCard';

import { Maximize2, Clock, Save, AlertTriangle, RefreshCw } from 'lucide-react';

export default function RoundPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params?.id as string;

  const [round, setRound] = useState<Round | null>(null);
  const [loadingRound, setLoadingRound] = useState<boolean>(true);

  const [adminConfig, setAdminConfig] = useState<FocusConfig>(getAdminConfig());
  const [contributorName, setContributorName] = useState<string>('');
  const [contributorEmail, setContributorEmail] = useState<string>('');
  const [isRulesAccepted, setIsRulesAccepted] = useState<boolean>(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800);

  const [finalSubmission, setFinalSubmission] = useState<Submission | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Fetch Round Data on Mount
  useEffect(() => {
    async function fetchRound() {
      if (!roundId) return;
      ensureAnonymousAuth();
      setLoadingRound(true);
      const data = await getRoundById(roundId);
      if (data) {
        setRound(data);
        setRemainingSeconds(data.durationMinutes * 60);

        const draft = await loadDraftFromFirestore(data.id);
        if (draft) {
          setAnswers(draft.answers || {});
          setRemainingSeconds(draft.remainingSeconds || data.durationMinutes * 60);
          if (draft.contributorName) setContributorName(draft.contributorName);
          if (draft.contributorEmail) setContributorEmail(draft.contributorEmail);
          if (draft.isRulesAccepted) setIsRulesAccepted(draft.isRulesAccepted);
        }
      }
      setLoadingRound(false);
    }
    fetchRound();
  }, [roundId]);

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
    round?.id || 'unknown',
    draftState,
    adminConfig.autoSaveIntervalSeconds,
    isSessionActive
  );

  // Submission Finalizer
  const finalizeSubmission = useCallback(
    (status: 'MANUAL_SUBMITTED' | 'AUTO_SUBMITTED', reason?: string, currentViolations: ViolationLog[] = []) => {
      if (isSubmitted || !round) return;

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

  // Render Pre-flight Modal
  if (loadingRound) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#003C5E] animate-spin" />
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Loading round details...</p>
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="bg-white border-2 border-black rounded-[2.5rem] p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900 uppercase">Evaluation Round Not Found</h2>
        <p className="text-xs text-slate-600 font-mono">This round may have been removed or is no longer accessible.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-[#003C5E] text-white rounded-xl text-xs font-mono font-bold uppercase shadow-sm hover:bg-[#00253b] transition-all"
        >
          Return to Rounds Catalog
        </button>
      </div>
    );
  }

  if (round.status !== 'ACTIVE' && !isRulesAccepted) {
    return (
      <div className="bg-white border-2 border-black rounded-[2.5rem] p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900 uppercase">Round Currently Unavailable</h2>
        <p className="text-xs text-slate-600 font-mono">
          This evaluation round is currently <strong className="uppercase font-black text-slate-900">{round.status}</strong> and is not open for contributor participation.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-[#003C5E] text-white rounded-xl text-xs font-mono font-bold uppercase shadow-sm hover:bg-[#00253b] transition-all"
        >
          Return to Rounds Catalog
        </button>
      </div>
    );
  }

  const currentQuestion = round.questions[currentQuestionIndex];

  // Pre-flight setup modal
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
      <div className="bg-[#15171A] border-2 border-slate-800 rounded-[2rem] p-4 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 text-white">
        
        {/* Title & Contributor */}
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-black text-white tracking-tight uppercase">{round.title}</h2>
            <span className="px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-widest bg-slate-800 text-[#FFB703] border border-slate-700 font-bold">
              Question {currentQuestionIndex + 1}/{round.totalQuestions}
            </span>
          </div>
          <p className="text-xs text-white/80 font-mono mt-1 font-semibold">Contributor: {contributorName} ({contributorEmail})</p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold">
          
          {/* Fullscreen Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border ${isFullscreen ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' : 'bg-rose-950/80 text-rose-300 border-rose-800'}`}>
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isFullscreen ? 'FULLSCREEN ACTIVE' : 'FULLSCREEN EXITED'}</span>
          </div>

          {/* Auto-Save Status */}
          <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-white">
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'text-[#D97706] animate-spin' : 'text-[#007F6E]'}`} />
            <span>{isSaving ? 'Saving...' : `Last saved ${secondsAgo}s ago`}</span>
          </div>

          {/* Violations Counter */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border ${violationCount > 0 ? 'bg-amber-950/80 text-amber-300 border-amber-800' : 'bg-slate-800 text-white/80 border-slate-700'}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Violations: {violationCount}/{adminConfig.maxViolations}</span>
          </div>

          {/* Timer Countdown */}
          <div className="flex items-center space-x-1.5 bg-[#003C5E] text-white border border-slate-700 px-3.5 py-1.5 rounded-xl">
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
      <div className="flex items-center justify-between bg-[#15171A] border-2 border-slate-800 p-5 rounded-2xl">
        <span className="text-xs text-white/80 font-mono font-bold">
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
