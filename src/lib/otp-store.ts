interface OTPRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP storage for API route execution
const otpMemoryStore = new Map<string, OTPRecord>();

export function storeOTP(email: string, otp: string, durationMinutes: number = 10): void {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;
  otpMemoryStore.set(normalizedEmail, {
    otp,
    expiresAt,
    attempts: 0,
  });
}

export function verifyOTP(email: string, inputOTP: string): { success: boolean; message: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpMemoryStore.get(normalizedEmail);

  if (!record) {
    return { success: false, message: 'No OTP requested for this email address or OTP expired.' };
  }

  if (Date.now() > record.expiresAt) {
    otpMemoryStore.delete(normalizedEmail);
    return { success: false, message: 'OTP has expired. Please request a new code.' };
  }

  if (record.attempts >= 5) {
    otpMemoryStore.delete(normalizedEmail);
    return { success: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
  }

  record.attempts += 1;

  if (record.otp === inputOTP.trim()) {
    otpMemoryStore.delete(normalizedEmail);
    return { success: true, message: 'Email successfully authenticated.' };
  }

  return { success: false, message: `Invalid OTP code. ${5 - record.attempts} attempts remaining.` };
}
