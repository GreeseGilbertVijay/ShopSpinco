import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { COOKIE_NAME, SESSION_COOKIE_OPTIONS, signSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ message: 'Incorrect email or password' }, { status: 401 });
    }
    if (user.role === 'customer' && !user.isVerified) {
      return NextResponse.json(
        { message: 'Please verify your email before logging in', unverified: true },
        { status: 403 }
      );
    }

    const token = signSession({ id: user._id.toString(), email: user.email, role: user.role });

    const res = NextResponse.json({ email: user.email, role: user.role, name: user.name });
    res.cookies.set(COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    console.error('POST /api/auth/login failed:', err);
    return NextResponse.json(
      { message: 'Database connection failed', detail: (err as Error).message },
      { status: 503 }
    );
  }
}
