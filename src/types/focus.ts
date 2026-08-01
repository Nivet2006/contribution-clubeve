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

export type RoundStatus = 'ACTIVE' | 'CLOSED' | 'HIDDEN';

export interface MCQOption {
  type: 'text' | 'image';
  value: string; // text string or compressed base64 data URL
}

export interface Question {
  id: string;
  title: string;
  description: string;
  type: 'mcq' | 'text' | 'code';
  options?: (string | MCQOption)[];
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
  status: RoundStatus;
  requireOtp?: boolean; // Default true, toggleable by admin per round
  createdAt: number;
  createdBy: string;
}

export interface PollOption {
  id: string;
  type: 'text' | 'image';
  value: string; // text string or compressed image data URL
  voteCount: number;
}

export interface PollQuestion {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'CLOSED';
  questions: PollQuestion[];
  totalVotes: number;
  createdAt: number;
  createdBy: string;
}

export interface PollVote {
  id: string;
  pollId: string;
  voterSessionId: string;
  answers: Record<string, string>; // questionId -> optionId
  timestamp: number;
}
