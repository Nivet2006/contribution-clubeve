import { NextResponse } from 'next/server';
import { adminDb, verifyAdminToken, isAdminUser } from '@/lib/firebase-admin';

const POLLS_COLLECTION = 'polls';
const POLL_VOTES_COLLECTION = 'poll_votes';

/**
 * GET /api/admin/poll-results?pollId=xxx
 * Fetch detailed poll results including individual vote records.
 * Requires admin authentication.
 */
export async function GET(request: Request) {
  try {
    const user = await verifyAdminToken(request.headers.get('Authorization'));
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pollId = searchParams.get('pollId');

    if (!pollId) {
      return NextResponse.json({ success: false, message: 'pollId query parameter is required' }, { status: 400 });
    }

    // Fetch poll document
    const pollDoc = await adminDb.collection(POLLS_COLLECTION).doc(pollId).get();
    if (!pollDoc.exists) {
      return NextResponse.json({ success: false, message: 'Poll not found' }, { status: 404 });
    }

    // Fetch all vote records for this poll
    const votesSnapshot = await adminDb
      .collection(POLL_VOTES_COLLECTION)
      .where('pollId', '==', pollId)
      .get();

    const votes = votesSnapshot.docs.map((doc) => doc.data());

    return NextResponse.json({
      success: true,
      poll: pollDoc.data(),
      votes,
      totalVotes: votes.length,
    });
  } catch (error: any) {
    console.error('Admin poll-results GET error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
