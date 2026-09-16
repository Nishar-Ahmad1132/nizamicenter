import Link from 'next/link';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  AlertTriangle,
  User,
  LogOut,
  GraduationCap,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export default async function TeacherPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  await dbConnect();

  let teacher = null;
  if (session?.user?.id) {
    teacher = await Teacher.findOne({ userId: session.user.id, isActive: true })
      .populate('branchIds', 'name')
      .lean();
  }

  // Fallback if accessed by super_admin testing the portal
  if (!teacher && (session?.user as any)?.role === 'super_admin') {
    teacher = await Teacher.findOne({ isActive: true })
      .populate('branchIds', 'name')
      .lean();
  }

  const teacherName = teacher?.name || session?.user?.name || 'Faculty Member';
  const qualification = teacher?.qualification || 'Instructor';

  const navLinks = [
    { label: 'Overview Dashboard', href: '/teacher', icon: LayoutDashboard },
    { label: 'My Allocated Classes', href: '/teacher/classes', icon: BookOpen },
    { label: 'Mark Attendance', href: '/teacher/attendance', icon: CalendarCheck },
    { label: 'Raise Issue / Requests', href: '/teacher/issues', icon: AlertTriangle },
    { label: 'My Profile & Account', href: '/teacher/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Portal Badge */}
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B6B3A] text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Faculty Portal</p>
              <p className="text-xs text-[#1B6B3A] font-medium">Nizami Center &amp; Education</p>
            </div>
          </div>

          {/* Teacher preview banner in sidebar */}
          <div className="px-4 py-3 bg-emerald-50/70 border-b border-emerald-100/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {teacherName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{teacherName}</p>
              <p className="text-[11px] text-emerald-800 font-medium truncate">{qualification}</p>
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
                <item.icon className="w-4 h-4 text-gray-400 group-hover:text-[#1B6B3A]" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-gray-900 truncate">{teacherName}</p>
              <p className="text-[11px] text-gray-500 font-medium">Instructor Account</p>
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
            <GraduationCap className="w-6 h-6 text-[#1B6B3A]" />
            <span className="font-bold text-gray-900 text-sm">Faculty Portal</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
            <span>Welcome back,</span>
            <strong className="text-[#1B6B3A]">{teacherName}</strong>
            {teacher?.branchIds && teacher.branchIds.length > 0 && (
              <span className="ml-3 text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-600" />
                {teacher.branchIds.map((b: any) => b.name).join(', ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/teacher/profile"
              className="text-xs font-semibold text-gray-600 hover:text-[#1B6B3A] transition flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile &amp; Security</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
