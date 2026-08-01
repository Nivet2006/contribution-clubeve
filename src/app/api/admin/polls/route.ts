import { NextResponse } from 'next/server';
import { adminDb, verifyAdminToken, isAdminUser } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const POLLS_COLLECTION = 'polls';

/**
 * POST /api/admin/polls
 * Create or update a poll. Requires admin authentication.
 */
export async function POST(request: Request) {
  try {
    const user = await verifyAdminToken(request.headers.get('Authorization'));
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const poll = await request.json();

    if (!poll.id) {
      return NextResponse.json({ success: false, message: 'Poll ID is required' }, { status: 400 });
    }

    const docRef = adminDb.collection(POLLS_COLLECTION).doc(poll.id);
    await docRef.set({ ...poll, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    return NextResponse.json({ success: true, message: 'Poll saved successfully.' });
  } catch (error: any) {
    console.error('Admin polls POST error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/polls
 * Update specific fields of a poll. Requires admin authentication.
 * Body: { pollId: string, ...fieldsToUpdate }
 */
export async function PATCH(request: Request) {
  try {
    const user = await verifyAdminToken(request.headers.get('Authorization'));
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { pollId, ...partial } = await request.json();

    if (!pollId) {
      return NextResponse.json({ success: false, message: 'Poll ID is required' }, { status: 400 });
    }

    const docRef = adminDb.collection(POLLS_COLLECTION).doc(pollId);
    await docRef.set({ ...partial, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    return NextResponse.json({ success: true, message: 'Poll updated successfully.' });
  } catch (error: any) {
    console.error('Admin polls PATCH error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/polls
 * Delete a poll by ID. Requires admin authentication.
 * Body: { pollId: string }
 */
export async function DELETE(request: Request) {
  try {
    const user = await verifyAdminToken(request.headers.get('Authorization'));
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { pollId } = await request.json();

    if (!pollId) {
      return NextResponse.json({ success: false, message: 'Poll ID is required' }, { status: 400 });
    }

    await adminDb.collection(POLLS_COLLECTION).doc(pollId).delete();

    return NextResponse.json({ success: true, message: 'Poll deleted successfully.' });
  } catch (error: any) {
    console.error('Admin polls DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
