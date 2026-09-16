import dbConnect from '@/lib/db/mongoose';
import Teacher, { ITeacher } from '@/models/Teacher';

export interface SessionLikeUser {
  id?: string;
  userId?: string;
  email?: string;
  username?: string;
  role?: string;
}

/**
 * Resolves the teacher document associated with the current session.
 * 1. Checks Teacher.userId === session.user.id
 * 2. Checks Teacher.email === session.user.email
 * 3. Checks Teacher.phone ending with digits from username (e.g. teacher_543210)
 * 4. Auto-links userId if missing
 * 5. Fallback for super_admin / branch_admin testing or managing the teacher portal
 */
export async function getEffectiveTeacher(
  sessionUser: SessionLikeUser | null
): Promise<ITeacher | null> {
  if (!sessionUser) return null;
  await dbConnect();

  const userId = sessionUser.id || sessionUser.userId;
  let teacher: any = null;

  // 1. Match by linked userId
  if (userId) {
    teacher = await Teacher.findOne({ userId, isActive: true });
  }

  // 2. Match by email
  if (!teacher && sessionUser.email) {
    teacher = await Teacher.findOne({
      email: new RegExp(`^${sessionUser.email.trim()}$`, 'i'),
      isActive: true,
    });
  }

  // 3. Match by username (e.g. teacher_123456) -> phone digits
  if (!teacher && sessionUser.username) {
    const cleanUsername = sessionUser.username.trim().toLowerCase();
    const digits = cleanUsername.replace(/\D/g, '');
    if (digits.length >= 6) {
      teacher = await Teacher.findOne({
        phone: new RegExp(`${digits.slice(-6)}$`),
        isActive: true,
      });
    }
  }

  // 4. If teacher found and userId wasn't linked yet, link it
  if (teacher && userId && (!teacher.userId || teacher.userId.toString() !== userId.toString())) {
    try {
      teacher.userId = userId as any;
      await teacher.save();
    } catch {
      // Ignore if duplicate constraint exists
    }
  }

  // 5. Fallback for admin users (super_admin / branch_admin) testing or managing the faculty portal
  if (!teacher && (sessionUser.role === 'super_admin' || sessionUser.role === 'branch_admin')) {
    teacher = await Teacher.findOne({ isActive: true });
  }

  return teacher;
}
