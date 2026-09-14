import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import FeePlan from '@/models/FeePlan';
import Branch from '@/models/Branch';
import '@/models/AcademicYear';
import { DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function AdminFeePlansPage() {
  await requireAdmin();
  await dbConnect();

  const [plans, branches] = await Promise.all([
    FeePlan.find({ isActive: true })
      .populate('branchId', 'name')
      .populate('academicYearId', 'name')
      .sort({ createdAt: -1 })
      .lean(),
    Branch.find({ isActive: true }).select('name').lean(),
  ]);

  const planList = JSON.parse(JSON.stringify(plans));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Plans & Structures</h1>
          <p className="text-xs text-gray-500 mt-1">
            Standard tuition and course fee schedules for Islamic Studies and Academic Classes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planList.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No custom fee plans defined</p>
            <p className="text-xs text-gray-400 mt-1">Standard course tuition is billed monthly per branch enrollment</p>
          </div>
        ) : (
          planList.map((plan: {
            _id: string;
            name: string;
            monthlyFee: number;
            admissionFee?: number;
            branchId?: { name: string };
            academicYearId?: { name: string };
            description?: string;
          }) => (
            <div key={plan._id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-500">{plan.branchId?.name || 'All Branches'}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>

              <div className="border-t border-b border-gray-100 py-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Monthly Tuition:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(plan.monthlyFee)}/mo</span>
                </div>
                {plan.admissionFee !== undefined && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">One-time Admission:</span>
                    <span className="font-medium text-gray-700">{formatCurrency(plan.admissionFee)}</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-gray-400 flex items-center justify-between">
                <span>Session: {plan.academicYearId?.name || '2026-27'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
