import { FocusConfig, Round, Submission, ViolationLog } from '@/types/focus';
import { DEFAULT_FOCUS_CONFIG } from './focus-engine';
import {
  saveSubmissionToFirestore,
  saveDraftToFirestore,
} from './firestore-service';
import { apiSaveConfig } from './admin-api';

const DRAFT_PREFIX = 'focus_draft_';
const SUBMISSIONS_KEY = 'focus_admin_submissions';
const CONFIG_KEY = 'focus_admin_config';

export const SAMPLE_ROUNDS: Round[] = [
  {
    id: 'round-101',
    title: 'Core Algorithm & System Integrity Round',
    category: 'System Architecture',
    durationMinutes: 30,
    totalQuestions: 3,
    status: 'ACTIVE',
    createdAt: 1720000000000,
    createdBy: 'system',
    questions: [
      {
        id: 'q1',
        title: 'Question 1: Secure Focus Enforcement Strategy',
        description: 'Explain how modern web applications can enforce user focus during high-stakes evaluations despite browser security sandbox constraints.',
        type: 'text',
        placeholder: 'Enter your detailed explanation here...',
      },
      {
        id: 'q2',
        title: 'Question 2: Fullscreen API Event Loop Handling',
        description: 'Implement a function in TypeScript that intercepts fullscreen exit events and initiates an auto-save procedure before triggering a countdown.',
        type: 'code',
        initialCode: `// Implement handleFullscreenExit
export function handleFullscreenExit(
  onAutoSave: () => void,
  onStartCountdown: (seconds: number) => void
) {
  // Your code here
}`,
      },
      {
        id: 'q3',
        title: 'Question 3: Primary Risk of Uncontrolled Tab Switching',
        description: 'Which browser API is specifically designed to detect whether a tab is active or minimized?',
        type: 'mcq',
        options: [
          'A) Document.visibilityState & visibilitychange event',
          'B) Navigator.connection API',
          'C) Window.localStorage sync API',
          'D) IntersectionObserver API',
        ],
      },
    ],
  },
  {
    id: 'round-102',
    title: 'Frontend State Hydration & Offline Storage',
    category: 'Web Engineering',
    durationMinutes: 20,
    totalQuestions: 2,
    status: 'ACTIVE',
    createdAt: 1720000001000,
    createdBy: 'system',
    questions: [
      {
        id: 'q1',
        title: 'Question 1: Session Recovery Mechanism',
        description: 'Describe how local drafts and state snapshots can be recovered automatically after unexpected browser crashes.',
        type: 'text',
        placeholder: 'Describe indexedDB/localStorage fallbacks...',
      },
      {
        id: 'q2',
        title: 'Question 2: Anti-Tamper Keyboard Interceptor',
        description: 'Select the keyboard event property that provides the physical key location on the keyboard regardless of layout.',
        type: 'mcq',
        options: [
          'A) event.code',
          'B) event.key',
          'C) event.keyCode',
          'D) event.charCode',
        ],
      },
    ],
  },
];


// Initial mock submissions for Admin Dashboard testing
export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_981',
    contributorName: 'Alex Rivera',
    contributorEmail: 'alex.rivera@example.com',
    roundId: 'round-101',
    roundTitle: 'Core Algorithm & System Integrity Round',
    startTime: Date.now() - 3600000,
    endTime: Date.now() - 1800000,
    completionTimeFormatted: '14m 22s',
    answers: {
      q1: 'Focus mode combines the Fullscreen API with visibilitychange listeners to monitor user presence. When a blur or tab switch occurs, the system logs the event timestamp.',
      q2: 'export function handleFullscreenExit() { onAutoSave(); onStartCountdown(10); }',
      q3: 'A) Document.visibilityState & visibilitychange event',
    },
    violations: [
      { id: 'v1', timestamp: Date.now() - 3200000, type: 'TAB_SWITCH', severity: 'HIGH', detail: 'Contributor switched active browser tab' },
      { id: 'v2', timestamp: Date.now() - 2500000, type: 'FULLSCREEN_EXIT', severity: 'CRITICAL', detail: 'Exited fullscreen mode' },
    ],
    violationCount: 2,
    focusScore: 60,
    status: 'MANUAL_SUBMITTED',
    device: {
      browser: 'Chrome 126.0',
      os: 'Windows 11',
      screenResolution: '1920x1080 (1920x953 viewport)',
      sessionID: 'sess_alex_981',
      ipAddress: '192.168.1.45',
    },
    lastSaveTime: Date.now() - 1800000,
    finalSaveTime: Date.now() - 1800000,
  },
  {
    id: 'sub_982',
    contributorName: 'Sophia Lin',
    contributorEmail: 'sophia.lin@example.com',
    roundId: 'round-101',
    roundTitle: 'Core Algorithm & System Integrity Round',
    startTime: Date.now() - 7200000,
    endTime: Date.now() - 5400000,
    completionTimeFormatted: '18m 05s',
    answers: {
      q1: 'By disabling right-click context menu, clipboard operations, and setting up beforeunload handlers.',
      q2: '// Code implementation here',
      q3: 'A) Document.visibilityState & visibilitychange event',
    },
    violations: [
      { id: 'v1', timestamp: Date.now() - 6500000, type: 'TAB_SWITCH', severity: 'HIGH', detail: 'Tab switched' },
      { id: 'v2', timestamp: Date.now() - 6200000, type: 'TAB_SWITCH', severity: 'HIGH', detail: 'Tab switched' },
      { id: 'v3', timestamp: Date.now() - 5800000, type: 'TAB_SWITCH', severity: 'HIGH', detail: 'Tab switched' },
      { id: 'v4', timestamp: Date.now() - 5400000, type: 'DEVTOOLS', severity: 'CRITICAL', detail: 'Developer Tools suspected open' },
    ],
    violationCount: 4,
    focusScore: 30,
    status: 'AUTO_SUBMITTED',
    autoSubmitReason: 'Exceeded Maximum Focus Mode Violations (4 / 3)',
    device: {
      browser: 'Firefox 127.0',
      os: 'macOS Sonoma',
      screenResolution: '2560x1440',
      sessionID: 'sess_sophia_982',
      ipAddress: '10.0.0.12',
    },
    lastSaveTime: Date.now() - 5400000,
    finalSaveTime: Date.now() - 5400000,
  },
];

export interface DraftState {
  answers: Record<string, string>;
  violations: ViolationLog[];
  violationCount: number;
  remainingSeconds: number;
  lastSavedAt: number;
  contributorName: string;
  contributorEmail: string;
  isRulesAccepted: boolean;
}

export function saveDraft(roundId: string, state: DraftState) {
  saveDraftToFirestore(roundId, state);
}

export function loadDraft(roundId: string): DraftState | null {
  return null;
}

export function clearDraft(roundId: string) {
  // Cleared directly in Firestore when needed
}

export function getSubmissions(): Submission[] {
  return [];
}

export function saveSubmission(submission: Submission) {
  // Store directly to Firebase Firestore cloud database
  saveSubmissionToFirestore(submission);
}

export function deleteSelectedSubmissions(ids: string[]) {
  // Managed via API / Firestore
}

export function clearAllSubmissions() {
  // Managed via API / Firestore
}

export function getAdminConfig(): FocusConfig {
  return DEFAULT_FOCUS_CONFIG;
}

export function saveAdminConfig(config: FocusConfig) {
  apiSaveConfig(config);
}
