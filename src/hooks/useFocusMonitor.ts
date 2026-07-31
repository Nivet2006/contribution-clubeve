import { useCallback, useEffect, useRef, useState } from 'react';
import { FocusConfig, ViolationLog, ViolationType } from '@/types/focus';
import { getSeverityForViolation, isRestrictedShortcut } from '@/lib/focus-engine';

interface UseFocusMonitorProps {
  config: FocusConfig;
  isActive: boolean;
  onAutoSave: () => void;
  onAutoSubmit: (reason: string) => void;
  initialViolations?: ViolationLog[];
}

export function useFocusMonitor({
  config,
  isActive,
  onAutoSave,
  onAutoSubmit,
  initialViolations = [],
}: UseFocusMonitorProps) {
  const [violations, setViolations] = useState<ViolationLog[]>(initialViolations);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fullscreenCountdown, setFullscreenCountdown] = useState<number | null>(null);
  const [latestToast, setLatestToast] = useState<{ id: string; title: string; detail: string; severity: string } | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [devToolsSuspected, setDevToolsSuspected] = useState<boolean>(false);

  const isActiveRef = useRef(isActive);
  const configRef = useRef(config);
  const violationsRef = useRef(violations);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    violationsRef.current = violations;
  }, [violations]);

  // Log a violation
  const addViolation = useCallback(
    (type: ViolationType, detail: string) => {
      if (!isActiveRef.current) return;

      const severity = getSeverityForViolation(type);
      const newLog: ViolationLog = {
        id: 'v_' + Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        type,
        severity,
        detail,
      };

      const updated = [...violationsRef.current, newLog];
      setViolations(updated);
      violationsRef.current = updated;

      // Show Toast Notification
      setLatestToast({
        id: newLog.id,
        title: getTitleForViolation(type),
        detail,
        severity,
      });

      // Force Auto Save on violation
      onAutoSave();

      // Check max violations threshold
      if (updated.length >= configRef.current.maxViolations) {
        onAutoSubmit(`Exceeded Maximum Focus Mode Violations (${updated.length} / ${configRef.current.maxViolations})`);
      }
    },
    [onAutoSave, onAutoSubmit]
  );

  // 1. Fullscreen monitoring
  useEffect(() => {
    if (typeof document === 'undefined' || !isActive) return;

    const handleFullscreenChange = () => {
      const isFS = Boolean(document.fullscreenElement);
      setIsFullscreen(isFS);

      if (!isFS && isActiveRef.current) {
        addViolation('FULLSCREEN_EXIT', 'Contributor exited fullscreen mode');
        
        // Start Countdown Timer if not already counting down
        setFullscreenCountdown(configRef.current.fullscreenCountdownSeconds);
      } else if (isFS) {
        // Re-entered fullscreen
        setFullscreenCountdown(null);
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    setIsFullscreen(Boolean(document.fullscreenElement));

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isActive, addViolation]);

  // Handle Fullscreen Exit Countdown Ticking
  useEffect(() => {
    if (fullscreenCountdown === null || !isActive) return;

    if (fullscreenCountdown <= 0) {
      onAutoSubmit('Focus Mode Violated: Failed to return to Full Screen before countdown expired.');
      setFullscreenCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setFullscreenCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [fullscreenCountdown, isActive, onAutoSubmit]);

  // 2. Tab Switch & Visibility Change
  useEffect(() => {
    if (typeof document === 'undefined' || !isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden && isActiveRef.current) {
        addViolation('TAB_SWITCH', 'Contributor switched active browser tab or minimized window');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, addViolation]);

  // 3. Window Blur & Focus Loss
  useEffect(() => {
    if (typeof window === 'undefined' || !isActive) return;

    const handleBlur = () => {
      if (isActiveRef.current && !document.hidden) {
        addViolation('BLUR', 'Window lost focus (clicked on secondary monitor or application)');
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [isActive, addViolation]);

  // 4. Restricted Keyboard Shortcuts Interception
  useEffect(() => {
    if (typeof window === 'undefined' || !isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActiveRef.current) return;
      const { isRestricted, label } = isRestrictedShortcut(e);
      if (isRestricted) {
        e.preventDefault();
        e.stopPropagation();
        addViolation('RESTRICTED_KEYBOARD', `Attempted restricted keyboard shortcut: ${label}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isActive, addViolation]);

  // 5. Context Menu (Right Click) Blocking
  useEffect(() => {
    if (typeof window === 'undefined' || !isActive || !config.blockContextMenu) return;

    const handleContextMenu = (e: MouseEvent) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      addViolation('CONTEXT_MENU', 'Attempted right-click context menu');
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isActive, config.blockContextMenu, addViolation]);

  // 6. Clipboard Restrictions (Copy, Cut, Paste)
  useEffect(() => {
    if (typeof window === 'undefined' || !isActive || !config.blockClipboard) return;

    const handleCopy = (e: Event) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      addViolation('CLIPBOARD', 'Attempted Copy action');
    };

    const handleCut = (e: Event) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      addViolation('CLIPBOARD', 'Attempted Cut action');
    };

    const handlePaste = (e: Event) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      addViolation('CLIPBOARD', 'Attempted Paste action');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
    };
  }, [isActive, config.blockClipboard, addViolation]);

  // 7. Drag & Drop Blocking
  useEffect(() => {
    if (typeof window === 'undefined' || !isActive) return;

    const preventDrag = (e: DragEvent) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      addViolation('DRAG_DROP', 'Attempted drag and drop operation');
    };

    window.addEventListener('dragstart', preventDrag);
    window.addEventListener('drop', preventDrag);

    return () => {
      window.removeEventListener('dragstart', preventDrag);
      window.removeEventListener('drop', preventDrag);
    };
  }, [isActive, addViolation]);

  // 8. Navigation & Refresh Warnings (beforeunload & popstate)
  useEffect(() => {
    if (typeof window === 'undefined' || !isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isActiveRef.current) return;
      onAutoSave();
      e.preventDefault();
      e.returnValue = 'Focus Mode is Active. Leaving or refreshing will log an integrity violation.';
      return e.returnValue;
    };

    const handlePopState = () => {
      if (!isActiveRef.current) return;
      addViolation('NAVIGATION_ATTEMPT', 'Attempted browser Back/Forward navigation');
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isActive, onAutoSave, addViolation]);

  // 9. Network Status (Online / Offline)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      if (isActiveRef.current) {
        addViolation('OFFLINE', 'Internet connection lost. Local draft queue active.');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addViolation]);

  // 10. DevTools Heuristics Detection
  useEffect(() => {
    if (typeof window === 'undefined' || !isActive || !config.devToolsDetection) return;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 170;
      const heightThreshold = window.outerHeight - window.innerHeight > 170;

      if ((widthThreshold || heightThreshold) && !devToolsSuspected && isActiveRef.current) {
        setDevToolsSuspected(true);
        addViolation('DEVTOOLS', 'Developer Tools inspect window detected via viewport dimension anomaly');
      } else if (!widthThreshold && !heightThreshold) {
        setDevToolsSuspected(false);
      }
    };

    const interval = setInterval(checkDevTools, 2000);
    return () => clearInterval(interval);
  }, [isActive, config.devToolsDetection, devToolsSuspected, addViolation]);

  const requestFullscreen = async () => {
    if (typeof document === 'undefined') return;
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Could not request fullscreen:', err);
    }
  };

  return {
    violations,
    violationCount: violations.length,
    isFullscreen,
    fullscreenCountdown,
    latestToast,
    isOnline,
    devToolsSuspected,
    requestFullscreen,
    dismissToast: () => setLatestToast(null),
  };
}

function getTitleForViolation(type: ViolationType): string {
  switch (type) {
    case 'TAB_SWITCH': return 'Tab Switch Detected';
    case 'BLUR': return 'Window Lost Focus';
    case 'FULLSCREEN_EXIT': return 'Exited Fullscreen';
    case 'REFRESH_ATTEMPT': return 'Page Refresh Attempted';
    case 'NAVIGATION_ATTEMPT': return 'Navigation Attempted';
    case 'RESTRICTED_KEYBOARD': return 'Restricted Shortcut Blocked';
    case 'CONTEXT_MENU': return 'Right Click Blocked';
    case 'CLIPBOARD': return 'Clipboard Disabled';
    case 'DRAG_DROP': return 'Drag & Drop Blocked';
    case 'DEVTOOLS': return 'DevTools Inspection Detected';
    case 'OFFLINE': return 'Connection Lost';
    default: return 'Integrity Violation';
  }
}
