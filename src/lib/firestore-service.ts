import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { FocusConfig, Round, RoundStatus, Submission, ViolationLog, Poll, PollVote } from '@/types/focus';

const SUBMISSIONS_COLLECTION = 'submissions';
const CONFIG_COLLECTION = 'admin_config';
const DRAFTS_COLLECTION = 'drafts';
const ROUNDS_COLLECTION = 'rounds';
const POLLS_COLLECTION = 'polls';

// 1. Save Submission to Firestore
export async function saveSubmissionToFirestore(submission: Submission): Promise<boolean> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submission.id);
    await setDoc(docRef, {
      ...submission,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore submission write fallback to LocalStorage:', err);
    return false;
  }
}

// 2. Delete selected submissions or purge all submissions
export async function deleteSubmissionsFromFirestore(submissionIds: string[]): Promise<boolean> {
  try {
    for (const id of submissionIds) {
      await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, id));
    }
    return true;
  } catch (err) {
    console.warn('Firestore submission deletion error:', err);
    return false;
  }
}

export async function purgeAllSubmissionsFromFirestore(): Promise<boolean> {
  try {
    const snapshot = await getDocs(collection(db, SUBMISSIONS_COLLECTION));
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
    return true;
  } catch (err) {
    console.warn('Firestore purge error:', err);
    return false;
  }
}

// 3. Subscribe to Real-Time Submissions (for Admin Dashboard live feed)
export function subscribeToSubmissions(
  onUpdate: (submissions: Submission[]) => void
): () => void {
  try {
    const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy('lastSaveTime', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Submission[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Submission);
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('Firestore live subscription fallback:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach Firestore subscriber:', err);
    return () => {};
  }
}

// 3. Save Draft to Firestore
export async function saveDraftToFirestore(roundId: string, draftState: any): Promise<boolean> {
  try {
    const docRef = doc(db, DRAFTS_COLLECTION, roundId);
    await setDoc(docRef, {
      ...draftState,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore draft save fallback:', err);
    return false;
  }
}

// 4. Save Admin Security Configuration to Firestore
export async function saveConfigToFirestore(config: FocusConfig): Promise<boolean> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, 'global_rules');
    await setDoc(docRef, {
      ...config,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (err) {
    console.warn('Firestore config save fallback:', err);
    return false;
  }
}

// 5. Subscribe to Real-Time Admin Security Configuration
export function subscribeToConfig(
  onUpdate: (config: FocusConfig) => void
): () => void {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, 'global_rules');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as FocusConfig);
        }
      },
      (error) => {
        console.warn('Firestore config subscription error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach config listener:', err);
    return () => {};
  }
}

// ── ROUND MANAGEMENT ──────────────────────────────────────────────────────────

// 6. Create or Update a Round in Firestore
export async function saveRoundToFirestore(round: Round): Promise<boolean> {
  try {
    const docRef = doc(db, ROUNDS_COLLECTION, round.id);
    await setDoc(docRef, { ...round, updatedAt: Timestamp.now() });
    return true;
  } catch (err) {
    console.warn('Firestore round save error:', err);
    return false;
  }
}

// 7. Update only specific fields on a Round (e.g. status)
export async function updateRoundInFirestore(
  roundId: string,
  partial: Partial<Round>
): Promise<boolean> {
  try {
    const docRef = doc(db, ROUNDS_COLLECTION, roundId);
    await setDoc(docRef, { ...partial, updatedAt: Timestamp.now() }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore round update error:', err);
    return false;
  }
}

// 8. Delete a Round from Firestore
export async function deleteRoundFromFirestore(roundId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, ROUNDS_COLLECTION, roundId));
    return true;
  } catch (err) {
    console.warn('Firestore round delete error:', err);
    return false;
  }
}

// 9. Real-time subscription to ALL rounds (admin only)
export function subscribeToRounds(
  onUpdate: (rounds: Round[]) => void
): () => void {
  try {
    const q = query(collection(db, ROUNDS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Round[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data() as Round));
        onUpdate(list);
      },
      (err) => console.warn('Firestore rounds subscription error:', err)
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach rounds listener:', err);
    return () => {};
  }
}

// 10. Fetch public rounds for contributor homepage (ACTIVE only)
export async function fetchPublicRounds(): Promise<Round[]> {
  try {
    const q = query(collection(db, ROUNDS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: Round[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Round;
      if (data.status === 'ACTIVE') {
        list.push(data);
      }
    });
    return list;
  } catch (err) {
    console.warn('fetchPublicRounds error:', err);
    return [];
  }
}

// 10b. Real-time subscription to public ACTIVE rounds for contributors
export function subscribeToPublicRounds(
  onUpdate: (rounds: Round[]) => void
): () => void {
  try {
    const q = query(collection(db, ROUNDS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Round[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Round;
          if (data.status === 'ACTIVE') {
            list.push(data);
          }
        });
        onUpdate(list);
      },
      (err) => console.warn('Firestore public rounds subscription error:', err)
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach public rounds listener:', err);
    return () => {};
  }
}

// 11. Fetch single round by ID
export async function getRoundById(roundId: string): Promise<Round | null> {
  try {
    const docRef = doc(db, ROUNDS_COLLECTION, roundId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Round;
    }
    return null;
  } catch (err) {
    console.warn('getRoundById error:', err);
    return null;
  }
}

// ── POLL MANAGEMENT & VOTING ───────────────────────────────────────────────────

// 12. Save or Update a Poll
export async function savePollToFirestore(poll: Poll): Promise<boolean> {
  try {
    const docRef = doc(db, POLLS_COLLECTION, poll.id);
    await setDoc(docRef, { ...poll, updatedAt: Timestamp.now() });
    return true;
  } catch (err) {
    console.warn('Firestore poll save error:', err);
    return false;
  }
}

// 13. Update partial fields of a Poll (e.g. status)
export async function updatePollInFirestore(
  pollId: string,
  partial: Partial<Poll>
): Promise<boolean> {
  try {
    const docRef = doc(db, POLLS_COLLECTION, pollId);
    await setDoc(docRef, { ...partial, updatedAt: Timestamp.now() }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore poll update error:', err);
    return false;
  }
}

// 14. Delete a Poll
export async function deletePollFromFirestore(pollId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, POLLS_COLLECTION, pollId));
    return true;
  } catch (err) {
    console.warn('Firestore poll delete error:', err);
    return false;
  }
}

// 15. Subscribe to all Polls (Real-Time)
export function subscribeToPolls(
  onUpdate: (polls: Poll[]) => void
): () => void {
  try {
    const q = query(collection(db, POLLS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Poll[] = [];
        snapshot.forEach((docSnap) => list.push(docSnap.data() as Poll));
        onUpdate(list);
      },
      (err) => console.warn('Firestore polls subscription error:', err)
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach polls listener:', err);
    return () => {};
  }
}

// 16. Fetch single Poll by ID
export async function getPollById(pollId: string): Promise<Poll | null> {
  try {
    const docRef = doc(db, POLLS_COLLECTION, pollId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Poll;
    }
    return null;
  } catch (err) {
    console.warn('getPollById error:', err);
    return null;
  }
}

const POLL_VOTES_COLLECTION = 'poll_votes';

// 17. Record a User Vote for a Poll with Single-Vote Enforcement
export async function recordVoteInFirestore(
  pollId: string,
  voterToken: string, // Unique hardware fingerprint + IP token
  answers: Record<string, string> // questionId -> optionId
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Check if voter token has already voted for this poll in Cloud Firestore
    const voteDocId = `${pollId}_${voterToken}`;
    const voteRef = doc(db, POLL_VOTES_COLLECTION, voteDocId);
    const existingVote = await getDoc(voteRef);

    if (existingVote.exists()) {
      return { success: false, error: 'You have already submitted a vote for this poll.' };
    }

    // 2. Fetch Poll document
    const pollRef = doc(db, POLLS_COLLECTION, pollId);
    const pollSnap = await getDoc(pollRef);
    if (!pollSnap.exists()) return { success: false, error: 'Poll not found.' };

    const poll = pollSnap.data() as Poll;
    if (poll.status !== 'ACTIVE') return { success: false, error: 'This poll is closed for voting.' };

    // 3. Update vote counts for options
    const updatedQuestions = poll.questions.map((q) => {
      const selectedOptionId = answers[q.id];
      if (!selectedOptionId) return q;

      const updatedOptions = q.options.map((opt) => {
        if (opt.id === selectedOptionId) {
          return { ...opt, voteCount: (opt.voteCount || 0) + 1 };
        }
        return opt;
      });

      return { ...q, options: updatedOptions };
    });

    const newTotalVotes = (poll.totalVotes || 0) + 1;

    // 4. Save vote log to prevent duplicate votes
    await setDoc(voteRef, {
      pollId,
      voterToken,
      answers,
      timestamp: Date.now(),
    });

    // 5. Update Poll counts
    await setDoc(
      pollRef,
      {
        questions: updatedQuestions,
        totalVotes: newTotalVotes,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (err) {
    console.warn('recordVoteInFirestore error:', err);
    return { success: false, error: 'Network error submitting vote.' };
  }
}
