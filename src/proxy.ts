import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';
import { verifySessionEdge } from '@/lib/auth-edge';

const GUEST_ONLY_PATHS = ['/login', '/register', '/forgot-password'];

// The quiz-only "admin" role can reach nothing but the quiz host dashboards (and their
// profile page, which is where Log Out lives). Every other page sends them back to /dashboard.
const ADMIN_ALLOWED_PATHS = ['/dashboard', '/dashboard/cytiva-day', '/dashboard/lab-essentials-quiz', '/profile'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionEdge(token) : null;

  if (session?.role === 'admin') {
    if (!ADMIN_ALLOWED_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (GUEST_ONLY_PATHS.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/profile') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard')) {
    if (!session || session.role !== 'superAdmin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Every page (so admins can be kept inside the quiz dashboards), but not API routes,
  // Next internals, or files with an extension (public assets like /logo.png).
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
