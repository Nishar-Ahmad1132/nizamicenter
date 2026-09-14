import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = (session.user as { role?: string }).role;
  const adminRoles = ['super_admin', 'branch_admin', 'teacher', 'accountant', 'content_manager'];
  if (!adminRoles.includes(role ?? '')) redirect('/login');

  return <>{children}</>;
}
