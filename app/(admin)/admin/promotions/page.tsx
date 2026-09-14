import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import AcademicYear from '@/models/AcademicYear';
import Class from '@/models/Class';
import Branch from '@/models/Branch';
import { GraduationCap, ArrowRight, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export default async function AdminPromotionsPage() {
  await requireAdmin();
  await dbConnect();

  const [academicYears, classes, branches, sampleStudents] = await Promise.all([
    AcademicYear.find({}).sort({ startDate: -1 }).lean(),
    Class.find({ isActive: true }).sort({ numericValue: 1 }).lean(),
    Branch.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
    Student.find({ isActive: true, status: 'active' })
      .populate('primaryBranchId', 'name')
      .populate('academicYearId', 'name')
      .limit(10)
      .lean(),
  ]);

  const years = JSON.parse(JSON.stringify(academicYears));
  const classList = JSON.parse(JSON.stringify(classes));
  const branchList = JSON.parse(JSON.stringify(branches));
  const students = JSON.parse(JSON.stringify(sampleStudents));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Academic Promotions</h1>
        <p className="text-xs text-gray-500 mt-1">
          Promote students to the next grade / academic year at the conclusion of annual exams
        </p>
      </div>

      {/* Promotion Config Panel */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-700" />
          Batch Promotion Workflow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-xl border border-gray-100 mb-6">
          {/* From */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">From (Current Session)</span>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Academic Year</label>
              <select className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white">
                {years.map((y: { _id: string; name: string }) => (
                  <option key={y._id} value={y._id}>{y.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Current Class</label>
              <select className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white">
                <option value="">Select current grade...</option>
                {classList.map((c: { _id: string; name: string }) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Campus</label>
              <select className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white">
                <option value="">All Branches</option>
                {branchList.map((b: { _id: string; name: string }) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* To */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              Promote To (Target Session)
            </span>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Academic Year</label>
              <select className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white">
                {years.map((y: { _id: string; name: string }) => (
                  <option key={y._id} value={y._id}>{y.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Class</label>
              <select className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white">
                <option value="">Select next grade...</option>
                {classList.map((c: { _id: string; name: string }) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Passing Status</label>
              <select className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white">
                <option value="passed">Passed (Promote to next grade)</option>
                <option value="retained">Retained (Keep in same grade)</option>
                <option value="graduated">Graduated / Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Promotion creates new academic records while archiving previous year performance history.</span>
          </div>
          <button
            type="button"
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Execute Batch Promotion
          </button>
        </div>
      </div>

      {/* Eligible Students Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            Active Students Ready for Review
          </h3>
          <span className="text-xs text-gray-500">{students.length} students loaded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200/80">
                <th className="p-4 w-10">
                  <input type="checkbox" className="rounded text-emerald-700 focus:ring-emerald-600" defaultChecked />
                </th>
                <th className="p-4">Student ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Current Branch</th>
                <th className="p-4">Current Session</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s: {
                _id: string;
                studentId: string;
                firstName: string;
                lastName: string;
                primaryBranchId?: { name: string };
                academicYearId?: { name: string };
                status: string;
              }) => (
                <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <input type="checkbox" className="rounded text-emerald-700 focus:ring-emerald-600" defaultChecked />
                  </td>
                  <td className="p-4 font-mono text-xs font-medium text-emerald-800">
                    {s.studentId}
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="p-4 text-xs text-gray-600">
                    {s.primaryBranchId?.name || '—'}
                  </td>
                  <td className="p-4 text-xs text-gray-600">
                    {s.academicYearId?.name || '2026-27'}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 capitalize">
                      {s.status}
                    </span>
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
