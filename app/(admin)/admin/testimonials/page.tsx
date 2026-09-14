import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Testimonial from '@/models/Testimonial';
import { Star, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default async function AdminTestimonialsPage() {
  await requireAdmin();
  await dbConnect();

  const testimonials = await Testimonial.find({})
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean();

  const items = JSON.parse(JSON.stringify(testimonials));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parent & Student Testimonials</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review parent feedback, student appreciation, and showcase stories on the homepage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No testimonials submitted yet</p>
          </div>
        ) : (
          items.map((t: {
            _id: string;
            name: string;
            role?: string;
            message: { en: string };
            rating: number;
            status: string;
            isPublished: boolean;
          }) => (
            <div key={t._id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-400">{t.role || 'Parent'}</p>
                </div>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < t.rating ? 'fill-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed italic border-t border-b border-gray-100 py-3">
                &ldquo;{t.message.en}&rdquo;
              </p>

              <div className="flex items-center justify-between text-xs">
                <span className={`inline-flex px-2 py-0.5 rounded-full capitalize font-medium ${
                  t.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {t.status}
                </span>
                <span className="text-gray-400 text-[11px]">
                  {t.isPublished ? 'Displayed on Web' : 'Hidden'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
