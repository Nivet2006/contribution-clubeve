import { NextResponse } from 'next/server';
import { adminDb, verifyAdminToken, isAdminUser } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const CONFIG_COLLECTION = 'admin_config';

/**
 * POST /api/admin/config
 * Save admin security configuration. Requires admin authentication.
 */
export async function POST(request: Request) {
  try {
    const user = await verifyAdminToken(request.headers.get('Authorization'));
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const config = await request.json();

    const docRef = adminDb.collection(CONFIG_COLLECTION).doc('global_rules');
    await docRef.set({ ...config, updatedAt: FieldValue.serverTimestamp() }, { merge: false });

    return NextResponse.json({ success: true, message: 'Config saved successfully.' });
  } catch (error: any) {
    console.error('Admin config POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
