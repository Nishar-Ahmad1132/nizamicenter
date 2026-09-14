import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Course from '@/models/Course';
import Link from 'next/link';
import { BookOpen, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function CoursesPage() {
  await requireAdmin();
  await dbConnect();
  const courses = JSON.parse(JSON.stringify(
    await Course.find({ isActive: true }).populate('divisionId', 'name code').sort({ displayOrder: 1 }).lean()
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/courses/add" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Course
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Course</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Division</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Fee</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Featured</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {courses.map((c: any) => (
              <tr key={c._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="font-medium text-dark">{c.name?.en ?? c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.divisionId?.name?.en ?? (typeof c.divisionId?.name === 'string' ? c.divisionId?.name : '—')}</td>
                <td className="px-4 py-3 text-gray-600">{c.fee ? formatCurrency(c.fee) + '/mo' : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>{c.status}</span>
                </td>
                <td className="px-4 py-3">{c.featured ? '⭐' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
