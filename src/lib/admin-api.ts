import { getAuthToken } from '@/lib/firebase';
import { FocusConfig, Round, Poll } from '@/types/focus';

/**
 * Client-side helpers that call server-side Admin API routes.
 * All requests include the admin's Firebase Auth ID token in the Authorization header.
 * The server-side routes use the Firebase Admin SDK (bypasses Firestore rules).
 */

async function adminFetch(url: string, options: RequestInit = {}): Promise<any> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: 'Not authenticated. Please sign in again.' };
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  return res.json();
}

// ── ROUNDS ───────────────────────────────────────────────────────────────────

export async function apiSaveRound(round: Round): Promise<{ success: boolean; message?: string }> {
  return adminFetch('/api/admin/rounds', {
    method: 'POST',
    body: JSON.stringify(round),
  });
}

export async function apiDeleteRound(roundId: string): Promise<{ success: boolean; message?: string }> {
  return adminFetch('/api/admin/rounds', {
    method: 'DELETE',
    body: JSON.stringify({ roundId }),
  });
}

// ── POLLS ────────────────────────────────────────────────────────────────────

export async function apiSavePoll(poll: Poll): Promise<{ success: boolean; message?: string }> {
  return adminFetch('/api/admin/polls', {
    method: 'POST',
    body: JSON.stringify(poll),
  });
}

export async function apiUpdatePoll(
  pollId: string,
  partial: Partial<Poll>
): Promise<{ success: boolean; message?: string }> {
  return adminFetch('/api/admin/polls', {
    method: 'PATCH',
    body: JSON.stringify({ pollId, ...partial }),
  });
}

export async function apiDeletePoll(pollId: string): Promise<{ success: boolean; message?: string }> {
  return adminFetch('/api/admin/polls', {
    method: 'DELETE',
    body: JSON.stringify({ pollId }),
  });
}

// ── CONFIG ───────────────────────────────────────────────────────────────────

export async function apiSaveConfig(config: FocusConfig): Promise<{ success: boolean; message?: string }> {
  return adminFetch('/api/admin/config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

// ── SUBMISSIONS ──────────────────────────────────────────────────────────────

export async function apiDeleteSubmissions(
  submissionIds: string[]
): Promise<{ success: boolean; message?: string }> {
  return adminFetch('/api/admin/submissions', {
    method: 'DELETE',
    body: JSON.stringify({ submissionIds }),
  });
}

export async function apiPurgeAllSubmissions(): Promise<{ success: boolean; message?: string }> {
  return adminFetch('/api/admin/submissions', {
    method: 'DELETE',
    body: JSON.stringify({ submissionIds: [] }),
  });
}

// ── POLL RESULTS ─────────────────────────────────────────────────────────────

export async function apiGetPollResults(
  pollId: string
): Promise<{ success: boolean; poll?: any; votes?: any[]; totalVotes?: number; message?: string }> {
  return adminFetch(`/api/admin/poll-results?pollId=${encodeURIComponent(pollId)}`);
}
