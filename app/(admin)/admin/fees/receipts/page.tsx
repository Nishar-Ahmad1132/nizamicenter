import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Payment from '@/models/Payment';
import '@/models/Student';
import '@/models/User';
import { Receipt, Printer, Download, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function AdminFeeReceiptsPage() {
  await requireAdmin();
  await dbConnect();

  const receipts = await Payment.find({})
    .populate('studentId', 'firstName lastName studentId phone address primaryBranchId')
    .populate('receivedBy', 'username')
    .sort({ date: -1 })
    .limit(20)
    .lean();

  const items = JSON.parse(JSON.stringify(receipts));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Payment Receipts</h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate, print, and download official fee receipts for parents and students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No payment receipts generated</p>
            <p className="text-xs text-gray-400 mt-1">Receipts are automatically generated when recording payments</p>
          </div>
        ) : (
          items.map((r: {
            _id: string;
            receiptNumber: string;
            studentId?: { firstName: string; lastName: string; studentId: string; phone?: string };
            month: string;
            amount: number;
            paymentMethod: string;
            date: string;
            receivedBy?: { username: string };
          }) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Official Fee Receipt
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">
                    Receipt #{r.receiptNumber}
                  </h3>
                  <p className="text-xs text-gray-400">Date: {formatDate(r.date)}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-emerald-800">
                    {formatCurrency(r.amount)}
                  </span>
                  <span className="block text-[10px] text-gray-400 uppercase">{r.paymentMethod}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Student Name</span>
                  <span className="font-semibold text-gray-900">
                    {r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : 'Direct Student'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Student ID</span>
                  <span className="font-mono text-emerald-800">{r.studentId?.studentId || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Billing Month</span>
                  <span className="font-medium text-gray-700">{r.month}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Cashier / Received By</span>
                  <span className="font-medium text-gray-700">{r.receivedBy?.username || 'Administration'}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400">Nizami Islamic Center & Nizami Education</span>
                <button
                  type="button"
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
