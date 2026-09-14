import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const adminPaths = pathname.startsWith('/admin');
      const studentPaths = pathname.startsWith('/student');
      const teacherPaths = pathname.startsWith('/teacher');
      const parentPaths = pathname.startsWith('/parent');

      if (adminPaths || studentPaths || teacherPaths || parentPaths) {
        if (!isLoggedIn) {
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.username = (user as { username?: string }).username;
        token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { username?: string }).username = token.username as string;
        (session.user as { mustChangePassword?: boolean }).mustChangePassword =
          token.mustChangePassword as boolean;
      }
      return session;
    },
  },
  providers: [], // Empty array for Edge compatibility; credentials provider added in lib/auth/index.ts
  session: { strategy: 'jwt' },
  trustHost: true,
};
