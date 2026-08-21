import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { COOKIE_NAME, SESSION_COOKIE_OPTIONS, signSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json({ message: 'email and otp are required' }, { status: 400 });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return NextResponse.json({ message: 'Account not found' }, { status: 404 });
  }
  if (user.isVerified) {
    return NextResponse.json({ message: 'Account is already verified' }, { status: 400 });
  }
  if (!user.otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return NextResponse.json(
      { message: 'Verification code has expired. Please request a new one.' },
      { status: 400 }
    );
  }
  if (user.otpCode !== String(otp).trim()) {
    return NextResponse.json({ message: 'Incorrect verification code' }, { status: 400 });
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const token = signSession({ id: user._id.toString(), email: user.email, role: user.role });

  const res = NextResponse.json({ email: user.email, role: user.role, name: user.name });
  res.cookies.set(COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return res;
}
