'use client';

import { signOut } from 'next-auth/react';
import { Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';

interface AdminHeaderProps {
  user?: {
    name?: string;
    role?: string;
    username?: string;
  };
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  branch_admin: 'Branch Admin',
  teacher: 'Teacher',
  accountant: 'Accountant',
  content_manager: 'Content Manager',
};

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const displayName = user?.name ?? user?.username ?? 'Admin';
  const roleLabel = roleLabels[user?.role ?? ''] ?? user?.role ?? '';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-gray-800">Admin Panel</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {getInitials(displayName)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-none">{displayName}</p>
              <p className="text-xs text-gray-500 leading-none mt-0.5">{roleLabel}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setDropdownOpen(false)}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
