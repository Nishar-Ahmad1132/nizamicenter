import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import FAQ from '@/models/FAQ';
import { HelpCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default async function AdminFAQsPage() {
  await requireAdmin();
  await dbConnect();

  const faqs = await FAQ.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean();
  const items = JSON.parse(JSON.stringify(faqs));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions (FAQs)</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage public FAQs regarding admission criteria, course fees, timings, and faculty
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No FAQs created</p>
          </div>
        ) : (
          items.map((f: {
            _id: string;
            question: { en: string; ur?: string };
            answer: { en: string; ur?: string };
            isPublished: boolean;
            displayOrder: number;
          }) => (
            <div key={f._id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                    Q
                  </span>
                  {f.question.en}
                </h3>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  f.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {f.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {f.isPublished ? 'Published' : 'Hidden'}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed pl-8">
                {f.answer.en}
              </p>

              <div className="pl-8 pt-2 text-[10px] text-gray-400">
                Display Order: #{f.displayOrder}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
