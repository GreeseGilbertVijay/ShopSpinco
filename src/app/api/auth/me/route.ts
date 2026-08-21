import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { AuthError, requireAuth } from '@/lib/auth';

// No session is a routine result here (polled on every page to check login
// state), not a failure - respond 200/null instead of 401 so it doesn't
// show up as a network error in the browser console.
export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    await connectDB();
    const user = await User.findById(session.id).select('-passwordHash -otpCode -otpExpiresAt');
    return NextResponse.json(user ?? null);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(null);
    }
    throw err;
  }
}
