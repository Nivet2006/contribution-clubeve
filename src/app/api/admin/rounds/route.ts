import { NextResponse } from 'next/server';
import { adminDb, verifyAdminToken, isAdminUser } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const ROUNDS_COLLECTION = 'rounds';

/**
 * POST /api/admin/rounds
 * Create or update a round. Requires admin authentication.
 */
export async function POST(request: Request) {
  try {
    const user = await verifyAdminToken(request.headers.get('Authorization'));
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const round = await request.json();

    if (!round.id) {
      return NextResponse.json({ success: false, message: 'Round ID is required' }, { status: 400 });
    }

    const docRef = adminDb.collection(ROUNDS_COLLECTION).doc(round.id);
    await docRef.set({ ...round, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    return NextResponse.json({ success: true, message: 'Round saved successfully.' });
  } catch (error: any) {
    console.error('Admin rounds POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/rounds
 * Delete a round by ID. Requires admin authentication.
 * Body: { roundId: string }
 */
export async function DELETE(request: Request) {
  try {
    const user = await verifyAdminToken(request.headers.get('Authorization'));
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { roundId } = await request.json();

    if (!roundId) {
      return NextResponse.json({ success: false, message: 'Round ID is required' }, { status: 400 });
    }

    await adminDb.collection(ROUNDS_COLLECTION).doc(roundId).delete();

    return NextResponse.json({ success: true, message: 'Round deleted successfully.' });
  } catch (error: any) {
    console.error('Admin rounds DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
