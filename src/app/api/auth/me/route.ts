import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { AuthError, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    await connectDB();
    const user = await User.findById(session.id).select('-passwordHash -otpCode -otpExpiresAt');
    if (!user) return NextResponse.json({ message: 'Account not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
