import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Subject from '@/models/Subject';
import { BookMarked } from 'lucide-react';

export default async function AdminSubjectsPage() {
  await requireAdmin();
  await dbConnect();

  const subjects = JSON.parse(
    JSON.stringify(
      await Subject.find({})
        .populate('divisionId', 'name code')
        .populate('classIds', 'name numericValue')
        .sort({ name: 1 })
        .lean()
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Subjects</h1>
          <p className="text-xs text-gray-500 mt-1">Manage all subjects taught across classes and divisions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {subjects.map((sub: any) => (
          <div key={sub._id} className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                {sub.code || 'SUB'}
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {sub.status}
              </span>
            </div>

            <h3 className="font-bold text-gray-900">{sub.name?.en ?? sub.name}</h3>
            <p className="text-xs text-gray-500 mt-1">Division: {sub.divisionId?.name?.en ?? sub.divisionId?.name ?? 'General'}</p>

            {sub.classIds && sub.classIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {sub.classIds.map((c: any) => (
                  <span key={c._id} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {c.name?.en ?? c.name ?? `Class ${c.numericValue}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
