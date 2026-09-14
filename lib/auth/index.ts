import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from '@/lib/auth/config';
import { loginSchema } from '@/validators/auth';
import dbConnect from '@/lib/db/mongoose';
import User from '@/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        await dbConnect();

        // Find by username or email
        const user = await User.findOne({
          $or: [
            { username: username.toLowerCase() },
            { email: username.toLowerCase() },
          ],
          isActive: true,
          deletedAt: { $exists: false },
        }).lean();

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});
