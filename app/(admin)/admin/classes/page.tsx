import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import ClassModel from '@/models/Class';
import { GraduationCap } from 'lucide-react';

export default async function ClassesPage() {
  await requireAdmin();
  await dbConnect();
  const classes = JSON.parse(JSON.stringify(
    await ClassModel.find({}).populate('divisionId', 'name code').sort({ displayOrder: 1, numericValue: 1 }).lean()
  ));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Classes</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {classes.map((c: any) => (
          <div key={c._id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-dark">{c.name?.en ?? c.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{c.divisionId?.name?.en ?? (typeof c.divisionId?.name === 'string' ? c.divisionId?.name : '')}</p>
            <span className={`mt-2 inline-flex px-2 py-0.5 text-xs rounded-full ${
              c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
