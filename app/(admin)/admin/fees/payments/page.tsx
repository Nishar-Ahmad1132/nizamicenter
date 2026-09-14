import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Payment from '@/models/Payment';
import '@/models/Student';
import '@/models/User';
import { DollarSign, Receipt, Calendar, User } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function AdminPaymentsPage() {
  await requireAdmin();
  await dbConnect();

  const payments = await Payment.find({})
    .populate('studentId', 'firstName lastName studentId')
    .populate('receivedBy', 'username')
    .sort({ date: -1 })
    .limit(50)
    .lean();

  const items = JSON.parse(JSON.stringify(payments));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Fee Payments</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time transaction log of fee collections, cash receipts, and digital payments
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No payment transactions recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Payments collected via cash, UPI, or bank transfer will show up here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200/80">
                  <th className="p-4 font-semibold">Receipt #</th>
                  <th className="p-4 font-semibold">Student</th>
                  <th className="p-4 font-semibold">Billing Month</th>
                  <th className="p-4 font-semibold">Amount Paid</th>
                  <th className="p-4 font-semibold">Method</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Collected By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((p: {
                  _id: string;
                  receiptNumber: string;
                  studentId?: { firstName: string; lastName: string; studentId: string };
                  month: string;
                  amount: number;
                  paymentMethod: string;
                  date: string;
                  receivedBy?: { username: string };
                }) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono text-xs font-semibold text-emerald-800">
                      {p.receiptNumber}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-xs text-gray-900">
                        {p.studentId ? `${p.studentId.firstName} ${p.studentId.lastName}` : 'Direct Payment'}
                      </div>
                      {p.studentId && (
                        <div className="text-[10px] text-gray-400 font-mono">{p.studentId.studentId}</div>
                      )}
                    </td>
                    <td className="p-4 text-xs font-medium text-gray-700">
                      {p.month}
                    </td>
                    <td className="p-4 text-xs font-bold text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 uppercase">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{formatDate(p.date)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      {p.receivedBy?.username || 'Cashier'}
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
