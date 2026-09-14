import Link from 'next/link';
import { auth } from '@/lib/auth';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Clock,
  User,
  Bell,
  LogOut,
  GraduationCap,
} from 'lucide-react';

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || 'Student';

  const navLinks = [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'My Attendance', href: '/student/attendance', icon: CalendarCheck },
    { label: 'Fee Payments', href: '/student/fees', icon: CreditCard },
    { label: 'Timetable', href: '/student/timetable', icon: Clock },
    { label: 'My Profile', href: '/student/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Portal Badge */}
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B6B3A] text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Student Portal</p>
              <p className="text-xs text-gray-500">Nizami Institute</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-[#1B6B3A] transition"
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
              <p className="text-[11px] text-emerald-700 font-medium">Active Enrollee</p>
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
        {/* Top Mobile/Header Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <GraduationCap className="w-6 h-6 text-[#1B6B3A]" />
            <span className="font-bold text-gray-900 text-sm">Student Portal</span>
          </div>

          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-gray-700">
              Welcome back, <span className="text-[#1B6B3A] font-bold">{userName}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notices"
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 relative"
              title="View Circulars"
            >
              <Bell className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
