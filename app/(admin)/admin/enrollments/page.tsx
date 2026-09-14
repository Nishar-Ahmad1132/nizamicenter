import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Enrollment from '@/models/Enrollment';
import '@/models/Student';
import '@/models/Branch';
import '@/models/Division';
import '@/models/Class';
import '@/models/Course';
import { BookMarked, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminEnrollmentsPage() {
  await requireAdmin();
  await dbConnect();

  const enrollments = JSON.parse(
    JSON.stringify(
      await Enrollment.find({})
        .populate('studentId', 'firstName lastName studentId')
        .populate('branchId', 'name')
        .populate('divisionId', 'name code')
        .populate('classId', 'name numericValue')
        .populate('courseId', 'name')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Enrollments</h1>
          <p className="text-xs text-gray-500 mt-1">Manage student course, class, and branch enrollments</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200/80">
                <th className="p-4">Student</th>
                <th className="p-4">Track / Program</th>
                <th className="p-4">Campus</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {enrollments.map((enr: any) => (
                <tr key={enr._id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">
                      {enr.studentId?.firstName} {enr.studentId?.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{enr.studentId?.studentId}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">
                      {enr.courseId?.name?.en || enr.classId?.name?.en || enr.divisionId?.name?.en || 'Enrolled Program'}
                    </p>
                    <p className="text-xs text-gray-500">{enr.divisionId?.name?.en || ''}</p>
                  </td>
                  <td className="p-4 text-xs font-medium text-gray-700">{enr.branchId?.name}</td>
                  <td className="p-4 text-xs text-gray-500">{formatDate(enr.startDate)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      {enr.status}
                    </span>
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                    No student enrollments found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
