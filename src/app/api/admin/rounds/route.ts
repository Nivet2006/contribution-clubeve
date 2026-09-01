import { NextResponse } from 'next/server';
import { adminDb, verifyAdminToken, isAdminUser } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const ROUNDS_COLLECTION = 'rounds';

/**
 * GET /api/admin/rounds
 * Fetch all rounds for admin dashboard. Requires admin authentication.
 */
export async function GET(request: Request) {
  try {
    const user = await verifyAdminToken(request.headers.get('Authorization'));
    if (!isAdminUser(user)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const snapshot = await adminDb.collection(ROUNDS_COLLECTION).get();
    const rounds = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, data: rounds });
  } catch (error: any) {
    console.error('[API /api/admin/rounds GET Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch rounds due to an internal server error.',
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/rounds
 * Create or update a round. Requires admin authentication.
 */
export async function POST(request: Request) {
  try {
    const user = await verifyAdminToken(request.headers.get('Authorization'));
    if (!isAdminUser(user)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    let round: any;
    try {
      round = await request.json();
    } catch (parseErr) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    if (!round || typeof round !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Request body must be a valid Round object.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    if (!round.id || typeof round.id !== 'string' || !round.id.trim()) {
      return NextResponse.json(
        { success: false, error: 'Round ID is required.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    if (!round.title || typeof round.title !== 'string' || !round.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Round title is required.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    // Clean undefined values to prevent Firestore serialisation errors
    const cleanedRound = JSON.parse(JSON.stringify(round));

    const docRef = adminDb.collection(ROUNDS_COLLECTION).doc(cleanedRound.id);
    await docRef.set({ ...cleanedRound, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    return NextResponse.json(
      { success: true, message: 'Round saved successfully.', data: cleanedRound },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/admin/rounds POST Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save round due to an internal server error.',
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch (parseErr) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const { roundId } = body || {};

    if (!roundId || typeof roundId !== 'string' || !roundId.trim()) {
      return NextResponse.json(
        { success: false, error: 'Valid roundId is required for deletion.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    await adminDb.collection(ROUNDS_COLLECTION).doc(roundId).delete();

    return NextResponse.json(
      { success: true, message: 'Round deleted successfully.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/admin/rounds DELETE Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete round due to an internal server error.',
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

