import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const routeRoles: Record<string, string[]> = {
  '/admin': ['super_admin', 'branch_admin', 'teacher', 'accountant', 'content_manager'],
  '/student': ['student'],
  '/teacher': ['teacher', 'super_admin', 'branch_admin'],
  '/parent': ['parent'],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const matchingRoute = Object.keys(routeRoles).find((route) => pathname.startsWith(route));
  const isChangePassword = pathname === '/change-password';

  if (!matchingRoute && !isChangePassword) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const isSecure = req.nextUrl.protocol === 'https:';
  const cookieName = req.cookies.has('__Secure-authjs.session-token')
    ? '__Secure-authjs.session-token'
    : req.cookies.has('authjs.session-token')
    ? 'authjs.session-token'
    : isSecure
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

  const token = await getToken({
    req,
    secret,
    salt: cookieName,
    cookieName,
  });

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const mustChangePassword = token.mustChangePassword as boolean | undefined;
  if (mustChangePassword && pathname !== '/change-password') {
    return NextResponse.redirect(new URL('/change-password', req.url));
  }

  if (matchingRoute) {
    const allowedRoles = routeRoles[matchingRoute];
    const userRole = token.role as string | undefined;

    if (userRole && !allowedRoles.includes(userRole)) {
      const roleRedirects: Record<string, string> = {
        super_admin: '/admin',
        branch_admin: '/admin',
        teacher: '/teacher',
        accountant: '/admin',
        content_manager: '/admin',
        student: '/student',
        parent: '/parent',
      };

      const redirect = roleRedirects[userRole] || '/login';
      return NextResponse.redirect(new URL(redirect, req.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/teacher/:path*',
    '/parent/:path*',
    '/change-password',
  ],
};
