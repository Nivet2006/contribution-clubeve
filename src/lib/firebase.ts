import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Ensure the current user is signed in anonymously.
 * Firebase Anonymous Auth gives each browser a stable, unique UID
 * without requiring any personal information (no email, no name).
 *
 * This UID is used by Firestore Security Rules to enforce:
 * - `request.auth != null` — must be authenticated to write
 * - Single-vote enforcement via `!exists(...)` on poll_votes
 *
 * Returns the anonymous user's UID, or null if sign-in fails.
 */
export async function ensureAnonymousAuth(): Promise<string | null> {
  try {
    // If already signed in (admin or anonymous), return existing UID
    if (auth.currentUser) {
      return auth.currentUser.uid;
    }

    const credential = await signInAnonymously(auth);
    return credential.user.uid;
  } catch (err) {
    console.warn('Anonymous auth failed:', err);
    return null;
  }
}

/**
 * Get the current user's Firebase ID token for API route authorization.
 * Works for both admin (email/password) and anonymous users.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  } catch (err) {
    console.warn('Failed to get auth token:', err);
    return null;
  }
}

export default app;
