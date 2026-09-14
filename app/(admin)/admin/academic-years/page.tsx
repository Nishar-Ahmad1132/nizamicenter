import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import AcademicYear from '@/models/AcademicYear';
import Student from '@/models/Student';
import { CalendarDays, CheckCircle2, Plus, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminAcademicYearsPage() {
  await requireAdmin();
  await dbConnect();

  const [years, studentsCount] = await Promise.all([
    AcademicYear.find({}).sort({ startDate: -1 }).lean(),
    Student.countDocuments({ isActive: true }),
  ]);

  const items = JSON.parse(JSON.stringify(years));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Years & Sessions</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage institutional annual terms, term start/end schedules, and active admission sessions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((y: {
          _id: string;
          name: string;
          startDate: string;
          endDate: string;
          isActive: boolean;
          isCurrent: boolean;
        }) => (
          <div
            key={y._id}
            className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 relative overflow-hidden ${
              y.isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200/80'
            }`}
          >
            {y.isCurrent && (
              <div className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 absolute top-0 right-0 rounded-bl-xl uppercase tracking-wider">
                Current Active Session
              </div>
            )}

            <div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                Session Code
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{y.name}</h3>
            </div>

            <div className="space-y-2 border-t border-b border-gray-100 py-3 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Term Start:</span>
                <span className="font-medium">{formatDate(y.startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Term End:</span>
                <span className="font-medium">{formatDate(y.endDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Enrolled Students:</span>
                <span className="font-bold text-emerald-800">{y.isCurrent ? studentsCount : 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className={`inline-flex items-center gap-1 font-medium ${
                y.isActive ? 'text-emerald-700' : 'text-gray-400'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {y.isActive ? 'Active Term' : 'Archived'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
