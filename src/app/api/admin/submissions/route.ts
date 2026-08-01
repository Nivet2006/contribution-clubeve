import { NextResponse } from 'next/server';
import { adminDb, verifyAdminToken, isAdminUser } from '@/lib/firebase-admin';

const SUBMISSIONS_COLLECTION = 'submissions';

/**
 * DELETE /api/admin/submissions
 * Delete selected submissions or purge all. Requires admin authentication.
 * Body: { submissionIds: string[] } — if empty array, purge ALL submissions.
 */
export async function DELETE(request: Request) {
  try {
    const user = await verifyAdminToken(request.headers.get('Authorization'));
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { submissionIds } = await request.json();

    if (!submissionIds || !Array.isArray(submissionIds)) {
      return NextResponse.json({ success: false, message: 'submissionIds array is required' }, { status: 400 });
    }

    if (submissionIds.length === 0) {
      // Purge ALL submissions
      const snapshot = await adminDb.collection(SUBMISSIONS_COLLECTION).get();
      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return NextResponse.json({ success: true, message: `Purged all ${snapshot.size} submissions.` });
    }

    // Delete selected submissions
    const batch = adminDb.batch();
    for (const id of submissionIds) {
      batch.delete(adminDb.collection(SUBMISSIONS_COLLECTION).doc(id));
    }
    await batch.commit();

    return NextResponse.json({ success: true, message: `Deleted ${submissionIds.length} submissions.` });
  } catch (error: any) {
    console.error('Admin submissions DELETE error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
