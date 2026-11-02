import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // Doctor/Admin only routes
    if (pathname.startsWith('/ai-decision-support')) {
      if (role !== 'DOCTOR' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized_role', req.url));
      }
    }

    // Admin only routes
    if (pathname.startsWith('/dbms-insights')) {
      if (role !== 'ADMIN' && role !== 'DOCTOR') {
        return NextResponse.redirect(new URL('/dashboard?error=admin_only', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patients/:path*',
    '/doctors/:path*',
    '/appointments/:path*',
    '/prescriptions/:path*',
    '/lab-reports/:path*',
    '/ai-decision-support/:path*',
    '/dbms-insights/:path*',
  ],
};
