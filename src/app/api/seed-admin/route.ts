import { NextResponse } from 'next/server';

async function seedAdmin() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'help@clubeve.nivet2006.in';
  const adminPassword = process.env.ADMIN_SECURITY_PASSWORD || 'ClubEve@9X#Kz2!Secure2024';

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (data.error?.message === 'EMAIL_EXISTS') {
    return { success: true, message: `Admin already exists: ${adminEmail}. You can log in now.`, alreadyExists: true };
  }
  if (data.error) {
    return { success: false, message: data.error.message };
  }
  return { success: true, message: `Admin created successfully! Email: ${adminEmail}`, uid: data.localId };
}

export async function GET() {
  const result = await seedAdmin();
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function POST() {
  const result = await seedAdmin();
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
