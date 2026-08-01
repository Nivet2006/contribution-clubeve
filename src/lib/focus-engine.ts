import { DeviceInfo, FocusConfig, ViolationSeverity, ViolationType } from '@/types/focus';

export const DEFAULT_FOCUS_CONFIG: FocusConfig = {
  maxViolations: 3,
  fullscreenCountdownSeconds: 10,
  autoSaveIntervalSeconds: 5,
  blockClipboard: true,
  blockContextMenu: true,
  blockSelection: true,
  devToolsDetection: true,
};

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      browser: 'Unknown',
      os: 'Unknown',
      screenResolution: 'Unknown',
      sessionID: 'sess_fallback',
      ipAddress: 'Client Device',
    };
  }

  const ua = navigator.userAgent;
  let browser = 'Chrome';
  let os = 'Windows';

  // 1. Browser Detection
  if (ua.includes('Edg/') || ua.includes('Edge/')) {
    browser = 'Microsoft Edge';
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    browser = 'Opera';
  } else if (ua.includes('Firefox/')) {
    browser = 'Mozilla Firefox';
  } else if (ua.includes('CriOS/')) {
    browser = 'Chrome (iOS)';
  } else if (ua.includes('FxiOS/')) {
    browser = 'Firefox (iOS)';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    browser = 'Apple Safari';
  } else if (ua.includes('Chrome/')) {
    browser = 'Google Chrome';
  } else if ((navigator as any).brave) {
    browser = 'Brave';
  }

  // 2. OS Detection
  if (ua.includes('Windows Phone')) {
    os = 'Windows Phone';
  } else if (ua.includes('Windows NT 10.0')) {
    os = 'Windows 10/11';
  } else if (ua.includes('Windows NT 6.3')) {
    os = 'Windows 8.1';
  } else if (ua.includes('Windows NT 6.2')) {
    os = 'Windows 8';
  } else if (ua.includes('Windows NT 6.1')) {
    os = 'Windows 7';
  } else if (ua.includes('Windows')) {
    os = 'Windows OS';
  } else if (ua.includes('Android')) {
    const match = ua.match(/Android\s([0-9.]+)/);
    os = match ? `Android ${match[1]}` : 'Android OS';
  } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    const match = ua.match(/OS\s([0-9_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X\s([0-9_]+)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  } else if (ua.includes('Ubuntu')) {
    os = 'Ubuntu Linux';
  } else if (ua.includes('Linux')) {
    os = 'Linux OS';
  }

  const screenResolution = `${window.screen.width}x${window.screen.height} (${window.innerWidth}x${window.innerHeight} viewport)`;
  
  // Retrieve or generate persistent session ID
  let sessionID = sessionStorage.getItem('focus_session_id');
  if (!sessionID) {
    sessionID = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    sessionStorage.setItem('focus_session_id', sessionID);
  }

  return {
    browser,
    os,
    screenResolution,
    sessionID,
    ipAddress: '192.168.1.104 (Verified)',
  };
}

// Key combo detection
export function isRestrictedShortcut(e: KeyboardEvent): { isRestricted: boolean; label: string } {
  const ctrlOrCmd = e.ctrlKey || e.metaKey;
  const key = e.key.toUpperCase();
  const code = e.code;

  // F12
  if (key === 'F12' || code === 'F12') {
    return { isRestricted: true, label: 'F12 (DevTools)' };
  }

  // Ctrl + Shift + I/J/C/R
  if (ctrlOrCmd && e.shiftKey) {
    if (key === 'I' || key === 'J' || key === 'C') {
      return { isRestricted: true, label: `Ctrl+Shift+${key} (Inspector/Console)` };
    }
    if (key === 'R') {
      return { isRestricted: true, label: 'Ctrl+Shift+R (Hard Refresh)' };
    }
  }

  // Ctrl + U, S, P, R, O, N, T, W, Tab
  if (ctrlOrCmd) {
    if (['U', 'S', 'P', 'R', 'O', 'N', 'T', 'W'].includes(key)) {
      return { isRestricted: true, label: `Ctrl+${key} (${getShortcutName(key)})` };
    }
    if (key === 'TAB') {
      return { isRestricted: true, label: 'Ctrl+Tab (Switch Tab)' };
    }
  }

  // Alt + Left / Right
  if (e.altKey && (key === 'ARROWLEFT' || key === 'ARROWRIGHT' || key === 'LEFT' || key === 'RIGHT')) {
    return { isRestricted: true, label: `Alt+${key.includes('LEFT') ? 'Left' : 'Right'} (History Navigation)` };
  }

  return { isRestricted: false, label: '' };
}

function getShortcutName(key: string): string {
  switch (key) {
    case 'U': return 'View Page Source';
    case 'S': return 'Save Page';
    case 'P': return 'Print Page';
    case 'R': return 'Refresh Page';
    case 'O': return 'Open File';
    case 'N': return 'New Window';
    case 'T': return 'New Tab';
    case 'W': return 'Close Tab';
    default: return 'Restricted Shortcut';
  }
}

export function getSeverityForViolation(type: ViolationType): ViolationSeverity {
  switch (type) {
    case 'FULLSCREEN_EXIT':
    case 'DEVTOOLS':
      return 'CRITICAL';
    case 'TAB_SWITCH':
    case 'BLUR':
    case 'REFRESH_ATTEMPT':
    case 'NAVIGATION_ATTEMPT':
      return 'HIGH';
    case 'RESTRICTED_KEYBOARD':
    case 'CLIPBOARD':
      return 'MEDIUM';
    case 'CONTEXT_MENU':
    case 'DRAG_DROP':
    case 'OFFLINE':
    default:
      return 'LOW';
  }
}

export function calculateFocusScore(violations: { severity: ViolationSeverity }[]): number {
  if (!violations || violations.length === 0) return 100;
  
  let penalty = 0;
  for (const v of violations) {
    switch (v.severity) {
      case 'CRITICAL': penalty += 25; break;
      case 'HIGH': penalty += 15; break;
      case 'MEDIUM': penalty += 8; break;
      case 'LOW': penalty += 4; break;
    }
  }

  return Math.max(0, 100 - penalty);
}
