import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Branch from '@/models/Branch';
import '@/models/AcademicYear';
import Link from 'next/link';
import { Users, Plus, Search, Eye, Pencil } from 'lucide-react';
import { formatDate } from '@/lib/utils';

async function getData(searchParams: Promise<Record<string, string | undefined>>) {
  await requireAdmin();
  await dbConnect();
  const params = await searchParams;

  const page = Number(params.page ?? 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { isActive: true };
  if (params.status) filter.status = params.status;
  if (params.branchId) filter.primaryBranchId = params.branchId;
  if (params.search) {
    const re = new RegExp(params.search, 'i');
    filter.$or = [
      { firstName: re }, { lastName: re }, { studentId: re },
      { phone: re }, { guardianPhone: re },
    ];
  }

  const [students, total, branches] = await Promise.all([
    Student.find(filter)
      .populate('primaryBranchId', 'name')
      .populate('academicYearId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean(),
    Student.countDocuments(filter),
    Branch.find({ isActive: true }).select('name').sort({ displayOrder: 1 }).lean(),
  ]);

  return {
    students: JSON.parse(JSON.stringify(students)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    branches: JSON.parse(JSON.stringify(branches)),
    search: params.search ?? '',
    branchId: params.branchId ?? '',
    status: params.status ?? '',
  };
}

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { students, total, page, totalPages, branches, search, branchId, status } = await getData(searchParams);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} student{total !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          href="/admin/students/add"
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Student
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <form className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" name="search" defaultValue={search}
              placeholder="Search by name, ID, phone..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select name="branchId" defaultValue={branchId}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-w-[150px]">
            <option value="">All Branches</option>
            {branches.map((b: { _id: string; name: string }) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
          <select name="status" defaultValue={status}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="transferred">Transferred</option>
            <option value="graduated">Graduated</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition">
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No students found</p>
            <Link href="/admin/students/add" className="text-sm text-primary hover:underline mt-2 inline-block">
              + Add your first student
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Branch</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Guardian</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Admitted</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {students.map((s: any) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{s.studentId}</td>
                    <td className="px-4 py-3 font-medium text-dark">
                      {s.firstName} {s.lastName && s.lastName !== '-' ? s.lastName : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.primaryBranchId?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.guardianName ?? s.fatherName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.guardianPhone ?? s.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        s.status === 'active' ? 'bg-green-50 text-green-700' :
                        s.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(s.admissionDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Link href={`/admin/students/${s._id}`}
                          className="text-primary hover:underline flex items-center gap-1 text-xs">
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        <Link href={`/admin/students/${s._id}?edit=true`}
                          className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 text-xs font-medium">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              {page > 1 && (
                <Link href={`/admin/students?page=${page - 1}&search=${search}&branchId=${branchId}&status=${status}`}
                  className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50">Prev</Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/students?page=${page + 1}&search=${search}&branchId=${branchId}&status=${status}`}
                  className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50">Next</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
