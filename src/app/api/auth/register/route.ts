import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateOtp, sendOtpEmail, OTP_TTL_MS } from '@/lib/otp';
import { describeMailError } from '@/lib/mail';

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'email and password are required' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ message: 'password must be at least 6 characters' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing && existing.isVerified) {
    return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

  let user;
  if (existing) {
    // Unverified account re-registering: refresh their details and issue a new OTP.
    existing.name = name ? name.trim() : '';
    existing.passwordHash = passwordHash;
    existing.otpCode = otp;
    existing.otpExpiresAt = otpExpiresAt;
    user = await existing.save();
  } else {
    user = await User.create({
      name: name ? name.trim() : '',
      email: normalizedEmail,
      passwordHash,
      role: 'customer',
      isVerified: false,
      otpCode: otp,
      otpExpiresAt,
    });
  }

  try {
    await sendOtpEmail(user, otp);
  } catch (err) {
    console.error('OTP email delivery failed:', describeMailError(err));
    return NextResponse.json(
      { message: 'Failed to send verification email. Please try again.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ email: user.email, message: 'Verification code sent to your email' }, { status: 201 });
}
