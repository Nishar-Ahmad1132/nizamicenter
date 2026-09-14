import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import AdmissionApplication from '@/models/AdmissionApplication';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdmissionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  await dbConnect();
  const params = await searchParams;
  const statusFilter = params.status ?? '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (statusFilter === 'approved') {
    filter.status = { $in: ['approved', 'converted'] };
  } else if (statusFilter) {
    filter.status = statusFilter;
  }

  const [applications, counts] = await Promise.all([
    AdmissionApplication.find(filter)
      .populate('preferredBranchId', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    AdmissionApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const data = JSON.parse(JSON.stringify(applications));
  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c._id] = c.count;

  const approvedTotal = (countMap.approved ?? 0) + (countMap.converted ?? 0);
  const pendingTotal = countMap.pending ?? 0;
  const rejectedTotal = countMap.rejected ?? 0;
  const allTotal = Object.values(countMap).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Admission Applications</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/admissions?status=pending"
          className={`bg-white rounded-xl border p-4 hover:shadow-sm transition ${
            statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Pending Review</span>
          </div>
          <p className="text-2xl font-bold">{pendingTotal}</p>
        </Link>
        <Link
          href="/admin/admissions?status=approved"
          className={`bg-white rounded-xl border p-4 hover:shadow-sm transition ${
            statusFilter === 'approved' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Approved / Admitted</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{approvedTotal}</p>
        </Link>
        <Link
          href="/admin/admissions?status=rejected"
          className={`bg-white rounded-xl border p-4 hover:shadow-sm transition ${
            statusFilter === 'rejected' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Rejected</span>
          </div>
          <p className="text-2xl font-bold">{rejectedTotal}</p>
        </Link>
        <Link
          href="/admin/admissions"
          className={`bg-white rounded-xl border p-4 hover:shadow-sm transition ${
            !statusFilter ? 'border-gray-400 ring-2 ring-gray-400/20' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Total Applications</span>
          </div>
          <p className="text-2xl font-bold">{allTotal}</p>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {data.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Applicant</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Guardian Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Branch</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Applied</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.map((a: any) => (
                  <tr key={a._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-dark">{a.applicantName}</td>
                    <td className="px-4 py-3 text-gray-600">{a.guardianPhone}</td>
                    <td className="px-4 py-3 text-gray-600">{a.preferredBranchId?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(a.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        a.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                        a.status === 'approved' || a.status === 'converted' ? 'bg-green-50 text-green-700' :
                        a.status === 'rejected' ? 'bg-red-50 text-red-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>{a.status === 'converted' ? 'admitted' : a.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/admissions/${a._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition"
                      >
                        {a.status === 'converted' ? 'View Details' : 'Review & Admit'}
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
