import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';
import Link from 'next/link';
import { Users, Plus, Eye } from 'lucide-react';

export default async function TeachersPage() {
  await requireAdmin();
  await dbConnect();

  const teachers = await Teacher.find({ isActive: true })
    .populate('branchIds', 'name')
    .populate('subjectIds', 'name')
    .sort({ name: 1 })
    .lean();

  const data = JSON.parse(JSON.stringify(teachers));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Teachers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.length} teacher{data.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/teachers/add" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Teacher
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {data.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No teachers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Qualification</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Branches</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Subjects</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.map((t: any) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-dark">{t.name}</td>
                    <td className="px-4 py-3 text-gray-600">{t.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{t.qualification ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {t.branchIds?.map((b: { name: string }) => b.name).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {t.subjectIds?.map((s: { name: { en: string } }) => s.name?.en).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        t.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/teachers/${t._id}`} className="text-primary hover:underline flex items-center gap-1 text-xs">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
