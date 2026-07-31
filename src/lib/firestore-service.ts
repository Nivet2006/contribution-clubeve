import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { FocusConfig, Submission, ViolationLog } from '@/types/focus';

const SUBMISSIONS_COLLECTION = 'submissions';
const CONFIG_COLLECTION = 'admin_config';
const DRAFTS_COLLECTION = 'drafts';

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

// 2. Subscribe to Real-Time Submissions (for Admin Dashboard live feed)
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
