import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';
import { verifySessionEdge } from '@/lib/auth-edge';

const GUEST_ONLY_PATHS = ['/login', '/register'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionEdge(token) : null;

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
  matcher: ['/dashboard/:path*', '/profile', '/login', '/register'],
};
