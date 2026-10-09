import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { AuthError, COOKIE_NAME, SESSION_COOKIE_OPTIONS, requireAuth, signSession } from '@/lib/auth';

// No session is a routine result here (polled on every page to check login
// state), not a failure - respond 200/null instead of 401 so it doesn't
// show up as a network error in the browser console.
export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    await connectDB();
    const user = await User.findById(session.id).select('-passwordHash -otpCode -otpExpiresAt');
    const res = NextResponse.json(user ?? null);
    // The role is baked into the session token at login, so a role changed in the DB since
    // then (e.g. a customer promoted to quiz admin) would otherwise keep being enforced by
    // proxy.ts with the old role until they log out. Re-issue the token with the current role.
    if (user && user.role !== session.role) {
      res.cookies.set(
        COOKIE_NAME,
        signSession({ id: user._id.toString(), email: user.email, role: user.role }),
        SESSION_COOKIE_OPTIONS
      );
    }
    return res;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(null);
    }
    throw err;
  }
}
