import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Firebase Admin SDK — Server-Side Only
 *
 * This module initializes the Firebase Admin SDK using a service account key
 * stored in the FIREBASE_SERVICE_ACCOUNT_KEY environment variable (JSON string).
 *
 * The Admin SDK bypasses all Firestore Security Rules, so it should ONLY be
 * used inside Next.js API routes (server-side), never imported by client code.
 */

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', err);
      // Fallback to application default credentials
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'contribute-theonepercentclub',
      });
    }
  } else {
    // Development fallback: use project ID only (works when running on Google Cloud or with ADC)
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'contribute-theonepercentclub',
    });
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
  } catch (err) {
    console.warn('Admin token verification failed:', err);
    return null;
  }
}

/** The admin email that is allowed to perform privileged operations */
export const ADMIN_EMAIL = 'help@clubeve.nivet2006.in';

/**
 * Check if a verified token belongs to the admin user.
 */
export function isAdminUser(decodedUser: { uid: string; email?: string } | null): boolean {
  if (!decodedUser || !decodedUser.email) return false;
  return decodedUser.email === ADMIN_EMAIL;
}
