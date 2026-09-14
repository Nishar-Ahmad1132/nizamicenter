import Link from 'next/link';
import { auth } from '@/lib/auth';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  BookOpen,
  LogOut,
  GraduationCap,
} from 'lucide-react';

export default async function TeacherPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || 'Teacher';

  const navLinks = [
    { label: 'Overview Dashboard', href: '/teacher', icon: LayoutDashboard },
    { label: 'Mark Attendance', href: '/teacher/attendance', icon: CalendarCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Portal Badge */}
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Faculty Portal</p>
              <p className="text-xs text-gray-500">Nizami Institute</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                <item.icon className="w-4 h-4 text-gray-500" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
              <p className="text-[11px] text-blue-700 font-medium">Faculty Member</p>
            </div>
            <Link
              href="/api/auth/signout"
              className="text-gray-400 hover:text-red-600 transition p-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <GraduationCap className="w-6 h-6 text-blue-700" />
            <span className="font-bold text-gray-900 text-sm">Faculty Portal</span>
          </div>

          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-gray-700">
              Instructor Console • <span className="text-blue-700 font-bold">{userName}</span>
            </h1>
          </div>

          <div>
            <Link
              href="/change-password"
              className="text-xs font-semibold text-gray-600 hover:text-blue-700 transition"
            >
              Security
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
