import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateOtp, sendPasswordResetEmail, OTP_TTL_MS } from '@/lib/otp';
import { describeMailError } from '@/lib/mail';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'email is required' }, { status: 400 });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return NextResponse.json({ message: 'No account found with this email' }, { status: 404 });
  }

  const code = generateOtp();
  user.resetCode = code;
  user.resetExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  user.resetAttempts = 0;
  await user.save();

  try {
    await sendPasswordResetEmail(user, code);
  } catch (err) {
    console.error('Password reset email delivery failed:', describeMailError(err));
    return NextResponse.json(
      { message: 'Failed to send reset email. Please try again.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ message: 'Reset code sent to your email' });
}
