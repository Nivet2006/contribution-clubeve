import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp-store';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Both Email and OTP code are required.' },
        { status: 400 }
      );
    }

    const result = verifyOTP(email, String(otp));

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error while verifying OTP.' },
      { status: 500 }
    );
  }
}
