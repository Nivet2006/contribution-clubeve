import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const firebaseProjectId =
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'contribute-theonepercentclub';
    const apiKey =
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCQZNYjgqYka5FImJ7uQY7TxsyAU8iP99E';

    const adminEmail = 'help@clubeve.nivet2006.in';
    const adminPassword = 'ClubEve@9X#Kz2!Secure2024';

    // Use Firebase REST API to create the user
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          returnSecureToken: true,
        }),
      }
    );

    const data = await res.json();

    if (data.error) {
      // If user already exists, treat it as success
      if (data.error.message === 'EMAIL_EXISTS') {
        return NextResponse.json({
          success: true,
          message: `Admin user already exists: ${adminEmail}`,
          alreadyExists: true,
        });
      }
      return NextResponse.json(
        { success: false, message: data.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Admin user seeded successfully!`,
      email: adminEmail,
      uid: data.localId,
      projectId: firebaseProjectId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to seed admin user.' },
      { status: 500 }
    );
  }
}
