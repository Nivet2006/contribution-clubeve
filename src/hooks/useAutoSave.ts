import { useCallback, useEffect, useRef, useState } from 'react';
import { saveDraft, DraftState } from '@/lib/storage';

export function useAutoSave(
  roundId: string,
  stateToSave: DraftState,
  intervalSeconds: number,
  isSessionActive: boolean
) {
  const [lastSavedTime, setLastSavedTime] = useState<number>(Date.now());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const stateRef = useRef(stateToSave);
  const isSessionActiveRef = useRef(isSessionActive);

  // Keep refs fresh
  useEffect(() => {
    stateRef.current = stateToSave;
  }, [stateToSave]);

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  const performSave = useCallback(() => {
    if (!isSessionActiveRef.current) return;
    setIsSaving(true);
    const now = Date.now();
    saveDraft(roundId, {
      ...stateRef.current,
      lastSavedAt: now,
    });
    setLastSavedTime(now);
    setTimeout(() => setIsSaving(false), 400);
  }, [roundId]);

  // Periodic Auto Save
  useEffect(() => {
    if (!isSessionActive) return;
    const intervalMs = Math.max(2, intervalSeconds) * 1000;
    const timer = setInterval(() => {
      performSave();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [roundId, intervalSeconds, isSessionActive, performSave]);

  return {
    lastSavedTime,
    isSaving,
    forceAutoSave: performSave,
  };
}
