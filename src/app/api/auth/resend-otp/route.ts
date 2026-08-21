import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateOtp, sendOtpEmail, OTP_TTL_MS } from '@/lib/otp';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'email is required' }, { status: 400 });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return NextResponse.json({ message: 'Account not found' }, { status: 404 });
  }
  if (user.isVerified) {
    return NextResponse.json({ message: 'Account is already verified' }, { status: 400 });
  }

  const otp = generateOtp();
  user.otpCode = otp;
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  await user.save();

  try {
    await sendOtpEmail(user, otp);
  } catch (err) {
    console.error('OTP email delivery failed:', (err as Error).message);
    return NextResponse.json(
      { message: 'Failed to send verification email. Please try again.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ message: 'Verification code resent to your email' });
}
