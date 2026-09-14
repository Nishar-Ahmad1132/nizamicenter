import { auth } from '@/lib/auth';
import { CreditCard, CheckCircle2, Download, Receipt, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function StudentFeesPage() {
  const feeHistory = [
    {
      receiptNo: 'REC-2026-089',
      period: 'September 2026',
      amount: 2500,
      status: 'paid',
      paidDate: '2026-09-02',
      paymentMode: 'UPI / Online',
    },
    {
      receiptNo: 'REC-2026-064',
      period: 'August 2026',
      amount: 2500,
      status: 'paid',
      paidDate: '2026-08-03',
      paymentMode: 'Cash at Counter',
    },
    {
      receiptNo: 'REC-2026-031',
      period: 'July 2026',
      amount: 2500,
      status: 'paid',
      paidDate: '2026-07-04',
      paymentMode: 'Net Banking',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tuition & Fee Records</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review your tuition payment history, current balances, and download official payment receipts.
        </p>
      </div>

      {/* Fee Balance Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            Account Status: Up to Date
          </span>
          <p className="text-xs text-gray-500 font-medium mt-3">Outstanding Fee Balance</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{formatCurrency(0)}</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Next monthly billing cycle: 01 October 2026
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            disabled
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed"
          >
            No Dues Pending
          </button>
          <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure payment gateway
          </p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm">Receipts & Payment History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200/80">
                <th className="p-4">Receipt No</th>
                <th className="p-4">Billing Month</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Date</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {feeHistory.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 font-mono text-xs font-semibold text-gray-900">{rec.receiptNo}</td>
                  <td className="p-4 font-medium">{rec.period}</td>
                  <td className="p-4 font-bold text-[#1B6B3A]">{formatCurrency(rec.amount)}</td>
                  <td className="p-4 text-xs text-gray-500">{rec.paidDate}</td>
                  <td className="p-4 text-xs text-gray-600">{rec.paymentMode}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Paid
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B6B3A] hover:underline"
                      title="Download receipt PDF"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
