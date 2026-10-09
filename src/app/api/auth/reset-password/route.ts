import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

// A 6-digit code is guessable by brute force, so the code is burned after this many wrong tries.
const MAX_RESET_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, code, password } = await req.json();

  if (!email || !code || !password) {
    return NextResponse.json({ message: 'email, code and password are required' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ message: 'password must be at least 6 characters' }, { status: 400 });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.resetCode || !user.resetExpiresAt || user.resetExpiresAt < new Date()) {
    return NextResponse.json(
      { message: 'Reset code is invalid or has expired. Please request a new one.' },
      { status: 400 }
    );
  }

  if (user.resetCode !== String(code).trim()) {
    user.resetAttempts = (user.resetAttempts || 0) + 1;
    if (user.resetAttempts >= MAX_RESET_ATTEMPTS) {
      user.resetCode = undefined;
      user.resetExpiresAt = undefined;
      user.resetAttempts = 0;
      await user.save();
      return NextResponse.json(
        { message: 'Too many incorrect attempts. Please request a new reset code.' },
        { status: 429 }
      );
    }
    await user.save();
    return NextResponse.json({ message: 'Incorrect reset code' }, { status: 400 });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetCode = undefined;
  user.resetExpiresAt = undefined;
  user.resetAttempts = 0;
  // Receiving the code proves ownership of the inbox, which is all signup verification checks.
  if (!user.isVerified) {
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
  }
  await user.save();

  return NextResponse.json({ message: 'Password updated. You can now log in.' });
}
