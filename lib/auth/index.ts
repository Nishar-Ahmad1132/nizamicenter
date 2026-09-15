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

        const cleanInput = username.trim();

        // 1. Find by username or email
        let user = await User.findOne({
          $or: [
            { username: cleanInput.toLowerCase() },
            { email: cleanInput.toLowerCase() },
          ],
          isActive: true,
          deletedAt: { $exists: false },
        }).lean();

        // 2. If not found, check if it matches a Student ID (e.g. NIC-2026-0002)
        if (!user) {
          const Student = (await import('@/models/Student')).default;
          const student = await Student.findOne({
            studentId: new RegExp(`^${cleanInput}$`, 'i'),
            isActive: true,
          }).lean();

          if (student?.userId) {
            user = await User.findOne({
              _id: student.userId,
              isActive: true,
              deletedAt: { $exists: false },
            }).lean();
          }
        }

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
