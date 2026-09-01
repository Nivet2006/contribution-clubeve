import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Firebase Admin SDK — Server-Side Only
 *
 * This module initializes the Firebase Admin SDK using a service account key
 * stored in the FIREBASE_SERVICE_ACCOUNT_KEY environment variable.
 */

let adminApp: App;

function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!rawKey) {
    console.warn('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY is missing. Falling back to default project credentials.');
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'contribute-theonepercentclub',
    });
  }

  try {
    let serviceAccount: any;

    const trimmed = rawKey.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('"')) {
      try {
        const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      } catch (b64Err) {
        serviceAccount = JSON.parse(trimmed);
      }
    } else {
      serviceAccount = JSON.parse(trimmed);
    }

    // If double-encoded stringified JSON
    if (typeof serviceAccount === 'string') {
      serviceAccount = JSON.parse(serviceAccount);
    }

    // Fix escaped newlines in private key if string formatted
    if (typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    // Validate essential service account fields
    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error('Service account key is missing required fields (project_id, client_email, or private_key).');
    }

    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } catch (err: any) {
    console.error('[Firebase Admin] Failed to parse service account key:', err.message);
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'contribute-theonepercentclub',
    });
  }
}

function getAdminApp(): App {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  return adminApp;
}

/** Admin Firestore instance — bypasses all security rules */
export const adminDb: Firestore = getFirestore(getAdminApp());

/** Admin Auth instance — for verifying ID tokens */
export const adminAuth: Auth = getAuth(getAdminApp());

/**
 * Verify a Firebase ID token from the Authorization header.
 * Returns the decoded token (contains uid, email, etc.) or null if invalid.
 */
export async function verifyAdminToken(authHeader: string | null): Promise<{ uid: string; email?: string } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const idToken = authHeader.replace('Bearer ', '');

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return { uid: decoded.uid, email: decoded.email };
  } catch (err: any) {
    console.warn('[Firebase Admin] Token verification failed:', err.message);
    return null;
  }
}

/** The admin email that is allowed to perform privileged operations */
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'help@clubeve.nivet2006.in';

/**
 * Check if a verified token belongs to the admin user.
 */
export function isAdminUser(decodedUser: { uid: string; email?: string } | null): boolean {
  if (!decodedUser || !decodedUser.email) return false;
  return decodedUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

