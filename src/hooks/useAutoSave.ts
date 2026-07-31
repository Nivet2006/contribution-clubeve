import { useEffect, useRef, useState } from 'react';
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

  // Keep stateRef fresh
  useEffect(() => {
    stateRef.current = stateToSave;
  }, [stateToSave]);

  const performSave = () => {
    if (!isSessionActive) return;
    setIsSaving(true);
    const now = Date.now();
    saveDraft(roundId, {
      ...stateRef.current,
      lastSavedAt: now,
    });
    setLastSavedTime(now);
    setTimeout(() => setIsSaving(false), 400);
  };

  // Periodic Auto Save
  useEffect(() => {
    if (!isSessionActive) return;
    const intervalMs = Math.max(2, intervalSeconds) * 1000;
    const timer = setInterval(() => {
      performSave();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [roundId, intervalSeconds, isSessionActive]);

  return {
    lastSavedTime,
    isSaving,
    forceAutoSave: performSave,
  };
}
