import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Achievement from '@/models/Achievement';
import Branch from '@/models/Branch';
import { Trophy, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminAchievementsPage() {
  await requireAdmin();
  await dbConnect();

  const achievements = await Achievement.find({})
    .populate('branchId', 'name')
    .sort({ date: -1 })
    .lean();

  const items = JSON.parse(JSON.stringify(achievements));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student & Institutional Achievements</h1>
          <p className="text-xs text-gray-500 mt-1">
            Showcase Huffaz graduates, board exam toppers, science exhibition awards, and competitive honors
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No achievements recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Student awards and honors will be displayed here</p>
          </div>
        ) : (
          items.map((a: {
            _id: string;
            title: { en: string };
            description?: { en?: string };
            studentName?: string;
            category: string;
            date: string;
            isPublished: boolean;
            branchId?: { name: string };
          }) => (
            <div key={a._id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{a.title.en}</h3>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{a.category}</span>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                  a.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {a.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>

              {a.studentName && (
                <p className="text-xs text-emerald-800 font-semibold bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                  Honoree: {a.studentName}
                </p>
              )}

              {a.description?.en && (
                <p className="text-xs text-gray-600 leading-relaxed">{a.description.en}</p>
              )}

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[11px] text-gray-400">
                <span>{a.branchId?.name || 'All Campuses'}</span>
                <span>{formatDate(a.date)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
