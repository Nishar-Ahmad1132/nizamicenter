'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Building2,
  CalendarDays, DollarSign, Bell, Newspaper, Calendar,
  Images, Star, Trophy, HelpCircle, BarChart3, Settings,
  ClipboardList, UserCheck, ChevronDown, ChevronRight,
  Menu, X, FileText, Layers, BookMarked, Clock, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
  roles?: string[];
}

const navigation: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    label: 'Students', icon: Users,
    children: [
      { label: 'All Students', href: '/admin/students', icon: Users },
      { label: 'Add Student', href: '/admin/students/add', icon: UserCheck },
      { label: 'Enrollments', href: '/admin/enrollments', icon: BookMarked },
      { label: 'Promotions', href: '/admin/promotions', icon: GraduationCap },
    ],
  },
  {
    label: 'Admissions', icon: ClipboardList,
    children: [
      { label: 'Applications', href: '/admin/admissions', icon: ClipboardList },
      { label: 'Enquiries', href: '/admin/enquiries', icon: FileText },
    ],
  },
  {
    label: 'Academics', icon: BookOpen,
    children: [
      { label: 'Divisions', href: '/admin/divisions', icon: Layers },
      { label: 'Courses', href: '/admin/courses', icon: BookOpen },
      { label: 'Classes', href: '/admin/classes', icon: GraduationCap },
      { label: 'Subjects', href: '/admin/subjects', icon: BookMarked },
      { label: 'Teachers', href: '/admin/teachers', icon: UserCheck },
      { label: 'Teacher Issues', href: '/admin/teacher-issues', icon: AlertTriangle },
      { label: 'Timetable', href: '/admin/timetable', icon: Clock },
    ],
  },
  { label: 'Attendance', href: '/admin/attendance', icon: CalendarDays },
  {
    label: 'Fees', icon: DollarSign,
    children: [
      { label: 'Fee Plans', href: '/admin/fees/plans', icon: FileText },
      { label: 'Fee Records', href: '/admin/fees/records', icon: ClipboardList },
      { label: 'Payments', href: '/admin/fees/payments', icon: DollarSign },
      { label: 'Receipts', href: '/admin/fees/receipts', icon: FileText },
    ],
  },
  {
    label: 'Communication', icon: Bell,
    children: [
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
      { label: 'Notice Board', href: '/admin/notices', icon: Newspaper },
      { label: 'Events', href: '/admin/events', icon: Calendar },
    ],
  },
  {
    label: 'Website & Content', icon: Images,
    children: [
      { label: 'Homepage CMS', href: '/admin/website', icon: LayoutDashboard },
      { label: 'Gallery', href: '/admin/gallery', icon: Images },
      { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
      { label: 'Achievements', href: '/admin/achievements', icon: Trophy },
      { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
      { label: 'Study Material', href: '/admin/study-material', icon: BookOpen },
    ],
  },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Branches', href: '/admin/branches', icon: Building2 },
  { label: 'Academic Years', href: '/admin/academic-years', icon: CalendarDays },
  {
    label: 'System', icon: Settings, roles: ['super_admin'],
    children: [
      { label: 'Users & Roles', href: '/admin/users', icon: Users },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

function NavItemComponent({
  item,
  userRole,
  depth = 0,
}: {
  item: NavItem;
  userRole: string;
  depth?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => c.href && pathname.startsWith(c.href));
  });

  // Role check
  if (item.roles && !item.roles.includes(userRole)) return null;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            depth > 0 && 'pl-10'
          )}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {open && (
          <div className="mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <NavItemComponent key={child.label} item={child} userRole={userRole} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = item.href === '/admin'
    ? pathname === '/admin'
    : item.href ? pathname.startsWith(item.href) : false;

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        depth > 0 ? 'pl-10' : '',
        isActive
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export default function AdminSidebar({ userRole }: { userRole: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:opacity-90" title="Go to Homepage">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-dark truncate group-hover:text-primary transition-colors">Nizami Islamic</p>
            <p className="text-xs text-gray-500 truncate">Center & Education</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navigation.map((item) => (
          <NavItemComponent key={item.label} item={item} userRole={userRole} />
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-white z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-30 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
