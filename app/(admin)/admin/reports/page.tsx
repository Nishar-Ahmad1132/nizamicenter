import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import Branch from '@/models/Branch';
import FeeRecord from '@/models/FeeRecord';
import Attendance from '@/models/Attendance';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function AdminReportsPage() {
  await requireAdmin();
  await dbConnect();

  const [totalStudents, activeStudents, teachers, branches, feeStats, attendanceCount] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Student.countDocuments({ isActive: true, status: 'active' }),
    Teacher.countDocuments({ isActive: true, status: 'active' }),
    Branch.find({ isActive: true }).select('name').lean(),
    FeeRecord.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$paidAmount' },
      }},
    ]),
    Attendance.countDocuments({}),
  ]);

  const branchList = JSON.parse(JSON.stringify(branches));
  const paid = feeStats.find(s => s._id === 'paid');
  const pending = feeStats.find(s => s._id === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutional Analytics & Reports</h1>
          <p className="text-xs text-gray-500 mt-1">
            Comprehensive audit reports for academic enrollment, financial collections, and attendance trends
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalStudents}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
            {activeStudents} Active in session 2026-27
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Active Faculty</span>
            <Users className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{teachers}</p>
          <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">
            Across 3 Titwala campuses
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Fee Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {formatCurrency(paid?.totalAmount ?? 0)}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 inline-block">
            {paid?.count ?? 0} paid transactions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Attendance Records</span>
            <Calendar className="w-4 h-4 text-purple-700" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{attendanceCount}</p>
          <span className="text-[11px] text-purple-600 font-medium mt-1 inline-block">
            Daily logs captured
          </span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              Campus Distribution
            </h3>
          </div>
          <div className="space-y-3">
            {branchList.map((b: { _id: string; name: string }) => (
              <div key={b._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-gray-100">
                <span className="text-xs font-medium text-gray-800">{b.name}</span>
                <span className="text-xs font-bold text-emerald-800">Operational</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              Fee Collection Status
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-xs font-medium text-emerald-900">Cleared & Verified Collections</span>
              <span className="text-xs font-bold text-emerald-700">{formatCurrency(paid?.totalAmount ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="text-xs font-medium text-amber-900">Pending Ledger Records</span>
              <span className="text-xs font-bold text-amber-700">{pending?.count ?? 0} students</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
