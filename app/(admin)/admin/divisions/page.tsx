import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Division from '@/models/Division';
import Course from '@/models/Course';
import Class from '@/models/Class';
import { Layers, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';

export default async function AdminDivisionsPage() {
  await requireAdmin();
  await dbConnect();

  const [divisions, totalCourses, totalClasses] = await Promise.all([
    Division.find({}).sort({ displayOrder: 1 }).lean(),
    Course.countDocuments({ isActive: true }),
    Class.countDocuments({ isActive: true }),
  ]);

  const items = JSON.parse(JSON.stringify(divisions));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic & Deeni Divisions</h1>
          <p className="text-xs text-gray-500 mt-1">
            Dual equal operating divisions of Nizami Islamic Center & Nizami Education
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((div: {
          _id: string;
          name: { en: string; ur?: string; hi?: string };
          code: string;
          slug: string;
          description?: { en?: string };
          isActive: boolean;
        }) => {
          const isIslamic = div.code === 'NIC';

          return (
            <div
              key={div._id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4 relative overflow-hidden"
            >
              <div className={`h-2 w-full absolute top-0 left-0 ${isIslamic ? 'bg-emerald-600' : 'bg-blue-600'}`} />
              <div className="flex items-start justify-between pt-1">
                <div>
                  <span className={`inline-flex px-2.5 py-0.5 text-xs font-mono font-bold rounded ${
                    isIslamic ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    CODE: {div.code}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mt-2">{div.name.en}</h2>
                  {div.name.ur && (
                    <p className="text-sm text-gray-500 font-arabic mt-0.5" dir="rtl">{div.name.ur}</p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {div.description?.en || (isIslamic
                  ? 'Spiritual tarbiyah, Nazra Quran with Tajweed, Hifz, Deeni Masail, and Islamic theological sciences.'
                  : 'Syllabus coaching, Mathematics, Science, English, Computer fundamentals, and Class 1 to 8/10 schooling.')}
              </p>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  {isIslamic ? (
                    <>
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span><strong>{totalCourses}</strong> Islamic Courses</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span><strong>{totalClasses}</strong> Classes (1 to 8)</span>
                    </>
                  )}
                </div>
                <span className="font-mono text-gray-400">/{div.slug}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
