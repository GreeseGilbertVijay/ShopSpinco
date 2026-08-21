import crypto from 'crypto';
import { sendMail } from '@/lib/mail';

export const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

export async function sendOtpEmail(user: { email: string; name?: string }, otp: string) {
  await sendMail({
    to: user.email,
    subject: 'Verify your ShopSpinco account',
    text: `Hi ${user.name || 'there'},\n\nYour ShopSpinco verification code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`,
  });
}
