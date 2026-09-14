import { Metadata } from 'next';
import dbConnect from '@/lib/db/mongoose';
import Notice from '@/models/Notice';
import { Bell, Calendar, Tag, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Official Notices & Circulars | Nizami Center',
  description: 'Stay updated with latest announcements, exam schedules, holidays, and admission circulars.',
};

async function getPublishedNotices() {
  try {
    await dbConnect();
    const notices = await Notice.find({ status: 'published' })
      .populate('branchIds', 'name')
      .sort({ publishDate: -1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(notices));
  } catch {
    return [];
  }
}

export default async function PublicNoticesPage() {
  const notices = await getPublishedNotices();

  const defaultNotices = [
    {
      _id: '1',
      title: { en: 'Annual Hifz Completion Sanad & Graduation Ceremony 2026' },
      content: {
        en: 'The annual Dastar-bandi and Sanad distribution ceremony will be held on Friday at the Main Campus Auditorium. All parents, community patrons, and well-wishers are cordially invited.',
      },
      category: 'event',
      priority: 'high',
      publishDate: new Date().toISOString(),
    },
    {
      _id: '2',
      title: { en: 'Class 10 and 12 Board Examination Intensive Mock Test Series' },
      content: {
        en: 'The second round of full-length mock board tests begins next Monday across all branches. Attendance is mandatory for all enrolled secondary candidates.',
      },
      category: 'batch',
      priority: 'high',
      publishDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      _id: '3',
      title: { en: 'Ramadan Timing Adjustments for Hifz & Tuition Classes' },
      content: {
        en: 'Revised daily schedules during the holy month of Ramadan have been published. Morning sessions will run from 07:00 AM to 11:30 AM.',
      },
      category: 'timing',
      priority: 'medium',
      publishDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  const displayNotices = notices.length > 0 ? notices : defaultNotices;

  const categoryColors: Record<string, string> = {
    admission: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    holiday: 'bg-amber-50 text-amber-700 border-amber-200',
    batch: 'bg-blue-50 text-blue-700 border-blue-200',
    timing: 'bg-purple-50 text-purple-700 border-purple-200',
    event: 'bg-rose-50 text-rose-700 border-rose-200',
    announcement: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    other: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-[#1A1A2E] py-14 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider mb-2">
            Announcements & Updates
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Notices & Circulars Board
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-base">
            Official announcements, examination schedules, event updates, and holiday circulars.
          </p>
        </div>
      </section>

      {/* Notices Feed */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="space-y-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {displayNotices.map((n: any) => (
            <div
              key={n._id}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full border ${
                      categoryColors[n.category] || categoryColors.other
                    }`}
                  >
                    {n.category}
                  </span>
                  {n.priority === 'high' && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(n.publishDate)}
                </span>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                {n.title?.en || 'Notice Title'}
              </h2>

              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {n.content?.en || ''}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
