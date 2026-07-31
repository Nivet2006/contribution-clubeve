import { NextResponse } from 'next/server';
import { storeOTP } from '@/lib/otp-store';
import { generateOTPEmailHTML } from '@/lib/email-template';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const recipientEmail = email.trim();
    const recipientName = name ? String(name).trim() : 'Contributor';

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in memory cache
    storeOTP(recipientEmail, otp);

    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey) {
      console.warn('BREVO_API_KEY is not configured in process.env. OTP code generated for dev mode:', otp);
      return NextResponse.json({
        success: true,
        message: `OTP generated (Dev Mode: ${otp}). Please configure BREVO_API_KEY in .env.local to send live Brevo emails.`,
        devOTP: otp,
      });
    }

    const htmlContent = generateOTPEmailHTML(recipientName, otp);

    const brevoPayload = {
      sender: {
        name: 'Club-Eve Integrity Platform',
        email: 'help@clubeve.nivet2006.in',
      },
      to: [
        {
          email: recipientEmail,
          name: recipientName,
        },
      ],
      subject: `Club-Eve Evaluation Round Verification OTP: ${otp}`,
      htmlContent: htmlContent,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error('Brevo API Error:', resData);
      return NextResponse.json(
        {
          success: false,
          message: resData.message || 'Failed to send OTP email via Brevo. Check sender domain verification.',
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: `OTP email sent to ${recipientEmail} from help@clubeve.nivet2006.in.`,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error while sending OTP.' },
      { status: 500 }
    );
  }
}
