import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import FeeRecord from '@/models/FeeRecord';
import '@/models/Student';
import '@/models/FeePlan';
import Link from 'next/link';
import { CreditCard, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function FeesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  await dbConnect();
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const limit = 20;
  const statusFilter = params.status ?? '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { isActive: true };
  if (statusFilter) filter.status = statusFilter;

  const [records, total] = await Promise.all([
    FeeRecord.find(filter)
      .populate('studentId', 'firstName lastName studentId')
      .populate('feePlanId', 'name monthlyFee')
      .sort({ dueDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    FeeRecord.countDocuments(filter),
  ]);

  const data = JSON.parse(JSON.stringify(records));
  const totalPages = Math.ceil(total / limit);

  // Summary stats
  const stats = await FeeRecord.aggregate([
    { $match: { isActive: true } },
    { $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalDue: { $sum: '$dueAmount' },
      totalPaid: { $sum: '$paidAmount' },
    }},
  ]);

  const pending = stats.find(s => s._id === 'pending');
  const paid = stats.find(s => s._id === 'paid');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Fee Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(paid?.totalPaid ?? 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{paid?.count ?? 0} paid records</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">Pending Collection</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency((pending?.totalDue ?? 0) - (pending?.totalPaid ?? 0))}</p>
          <p className="text-xs text-gray-400 mt-1">{pending?.count ?? 0} pending records</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-dark">{total}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <form className="flex flex-wrap gap-3">
          <select name="status" defaultValue={statusFilter}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="waived">Waived</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition flex items-center gap-2">
            <Search className="w-4 h-4" /> Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {data.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No fee records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Month</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Due</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Paid</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Balance</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.map((f: any) => (
                  <tr key={f._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/students/${f.studentId?._id}`} className="text-primary hover:underline font-medium">
                        {f.studentId?.firstName} {f.studentId?.lastName}
                      </Link>
                      <p className="font-mono text-xs text-gray-400">{f.studentId?.studentId}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{f.month}</td>
                    <td className="px-4 py-3">{formatCurrency(f.dueAmount)}</td>
                    <td className="px-4 py-3">{formatCurrency(f.paidAmount)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(f.dueAmount - f.paidAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        f.status === 'paid' ? 'bg-green-50 text-green-700' :
                        f.status === 'partial' ? 'bg-yellow-50 text-yellow-700' :
                        f.status === 'waived' ? 'bg-blue-50 text-blue-700' :
                        'bg-red-50 text-red-700'
                      }`}>{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              {page > 1 && <Link href={`/admin/fees?page=${page - 1}&status=${statusFilter}`} className="px-3 py-1 text-xs border rounded hover:bg-gray-50">Prev</Link>}
              {page < totalPages && <Link href={`/admin/fees?page=${page + 1}&status=${statusFilter}`} className="px-3 py-1 text-xs border rounded hover:bg-gray-50">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
