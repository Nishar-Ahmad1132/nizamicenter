import { requireSuperAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import User from '@/models/User';
import { Users, Shield, UserCheck, KeyRound, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminUsersPage() {
  await requireSuperAdmin();
  await dbConnect();

  const [users, total, activeCount, adminCount, teacherCount] = await Promise.all([
    User.find({ deletedAt: { $exists: false } })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    User.countDocuments({ deletedAt: { $exists: false } }),
    User.countDocuments({ isActive: true, deletedAt: { $exists: false } }),
    User.countDocuments({ role: { $in: ['super_admin', 'branch_admin'] } }),
    User.countDocuments({ role: 'teacher' }),
  ]);

  const userList = JSON.parse(JSON.stringify(users));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Accounts & Roles</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage system logins, access levels, and security credentials
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Accounts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 font-medium">Active Users</p>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-purple-800 font-medium">Administrators</p>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-1">{adminCount}</p>
        </div>
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-800 font-medium">Teachers</p>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{teacherCount}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            Registered System Users
          </h3>
          <span className="text-xs text-gray-500">{userList.length} users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200/80">
                <th className="p-4">Username / ID</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userList.map((u: {
                _id: string;
                username: string;
                email?: string;
                role: string;
                isActive: boolean;
                lastLogin?: string;
                createdAt: string;
                mustChangePassword?: boolean;
              }) => {
                const roleBadges: Record<string, { bg: string; text: string }> = {
                  super_admin: { bg: 'bg-purple-100 text-purple-800', text: 'Super Admin' },
                  branch_admin: { bg: 'bg-indigo-100 text-indigo-800', text: 'Branch Admin' },
                  teacher: { bg: 'bg-blue-100 text-blue-800', text: 'Teacher' },
                  student: { bg: 'bg-emerald-100 text-emerald-800', text: 'Student' },
                  parent: { bg: 'bg-amber-100 text-amber-800', text: 'Parent' },
                  accountant: { bg: 'bg-teal-100 text-teal-800', text: 'Accountant' },
                };

                const badge = roleBadges[u.role] || { bg: 'bg-gray-100 text-gray-800', text: u.role };

                return (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-xs font-semibold text-gray-900">{u.username}</div>
                      {u.mustChangePassword && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 mt-0.5">
                          <KeyRound className="w-2.5 h-2.5" /> Must change password
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      {u.email || '—'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${
                        u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {u.lastLogin ? formatDate(u.lastLogin) : 'Never'}
                    </td>
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{formatDate(u.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
