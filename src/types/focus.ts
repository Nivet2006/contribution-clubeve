export type ViolationType =
  | 'TAB_SWITCH'
  | 'BLUR'
  | 'FULLSCREEN_EXIT'
  | 'REFRESH_ATTEMPT'
  | 'NAVIGATION_ATTEMPT'
  | 'RESTRICTED_KEYBOARD'
  | 'CONTEXT_MENU'
  | 'CLIPBOARD'
  | 'DRAG_DROP'
  | 'DEVTOOLS'
  | 'OFFLINE';

export type ViolationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ViolationLog {
  id: string;
  timestamp: number;
  type: ViolationType;
  severity: ViolationSeverity;
  detail: string;
}

export interface FocusConfig {
  maxViolations: number;
  fullscreenCountdownSeconds: number;
  autoSaveIntervalSeconds: number;
  blockClipboard: boolean;
  blockContextMenu: boolean;
  blockSelection: boolean;
  devToolsDetection: boolean;
}

export interface DeviceInfo {
  browser: string;
  os: string;
  screenResolution: string;
  sessionID: string;
  ipAddress: string;
}

export interface Submission {
  id: string;
  contributorName: string;
  contributorEmail: string;
  roundId: string;
  roundTitle: string;
  startTime: number;
  endTime?: number;
  completionTimeFormatted?: string;
  answers: Record<string, string>;
  violations: ViolationLog[];
  violationCount: number;
  focusScore: number; // 0 - 100%
  status: 'MANUAL_SUBMITTED' | 'AUTO_SUBMITTED';
  autoSubmitReason?: string;
  device: DeviceInfo;
  lastSaveTime: number;
  finalSaveTime?: number;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  type: 'mcq' | 'text' | 'code';
  options?: string[];
  initialCode?: string;
  placeholder?: string;
}

export interface Round {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: Question[];
}
