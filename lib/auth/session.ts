import { auth } from '@/lib/auth';
import type { UserRole } from '@/models/User';

export interface SessionUser {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error('Unauthorized: not authenticated');
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: requires role ${allowedRoles.join(' or ')}`);
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(['super_admin', 'branch_admin', 'accountant', 'content_manager']);
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  return requireRole(['super_admin']);
}

export async function requireTeacher(): Promise<SessionUser> {
  return requireRole(['super_admin', 'branch_admin', 'teacher']);
}
