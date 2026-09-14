import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import StudyMaterial from '@/models/StudyMaterial';
import '@/models/Division';
import '@/models/Class';
import '@/models/Course';
import '@/models/Subject';
import '@/models/User';
import { BookOpen, FileText, Download, ExternalLink, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminStudyMaterialPage() {
  await requireAdmin();
  await dbConnect();

  const materials = await StudyMaterial.find({ isActive: true })
    .populate('classId', 'name')
    .populate('courseId', 'name')
    .populate('subjectId', 'name')
    .populate('divisionId', 'name code')
    .sort({ createdAt: -1 })
    .lean();

  const items = JSON.parse(JSON.stringify(materials));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Materials & Notes</h1>
          <p className="text-xs text-gray-500 mt-1">
            Curriculum syllabi, Tajweed exercise sheets, Hadith references, and school worksheets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No study materials uploaded</p>
            <p className="text-xs text-gray-400 mt-1">Uploaded notes and PDF resources will be accessible to enrolled students</p>
          </div>
        ) : (
          items.map((m: {
            _id: string;
            title: string;
            description?: string;
            type: string;
            url: string;
            classId?: { name: string };
            courseId?: { name: { en: string } };
            subjectId?: { name: { en: string } };
            divisionId?: { code: string };
            createdAt: string;
          }) => (
            <div key={m._id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{m.title}</h3>
                    <span className="text-[10px] text-gray-400 uppercase font-mono">{m.type}</span>
                  </div>
                </div>
                <span className="inline-flex px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-100 text-slate-700 uppercase">
                  {m.divisionId?.code || 'ACAD'}
                </span>
              </div>

              {m.description && (
                <p className="text-xs text-gray-500 line-clamp-2">{m.description}</p>
              )}

              <div className="text-xs text-gray-600 space-y-1 border-t border-b border-gray-100 py-2">
                {m.classId && <div>Grade: {m.classId.name}</div>}
                {m.subjectId && <div>Subject: {m.subjectId.name.en}</div>}
                {m.courseId && <div>Course: {m.courseId.name.en}</div>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400">{formatDate(m.createdAt)}</span>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View / Download
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
