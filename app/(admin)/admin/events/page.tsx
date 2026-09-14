import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Event from '@/models/Event';
import Branch from '@/models/Branch';
import { Calendar, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminEventsPage() {
  await requireAdmin();
  await dbConnect();

  const events = await Event.find({ isActive: true })
    .populate('branchId', 'name')
    .sort({ date: -1 })
    .lean();

  const items = JSON.parse(JSON.stringify(events));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events & Annual Gatherings</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage Jalsa Seerat-un-Nabi, Dastar-bandi convocation, academic exhibitions, and examinations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No scheduled events found</p>
            <p className="text-xs text-gray-400 mt-1">Institutional and campus events will be published here</p>
          </div>
        ) : (
          items.map((ev: {
            _id: string;
            title: { en: string; ur?: string };
            description?: { en?: string };
            date: string;
            time?: string;
            location?: string;
            branchId?: { name: string };
            status: string;
          }) => (
            <div key={ev._id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{ev.title.en}</h3>
                  {ev.title.ur && <p className="text-xs text-gray-500 font-arabic">{ev.title.ur}</p>}
                </div>
                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 capitalize">
                  {ev.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 border-t border-b border-gray-100 py-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{formatDate(ev.date)}</span>
                </div>
                {ev.time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{ev.time}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{ev.branchId?.name || ev.location || 'Baneli / Titwala East'}</span>
                </div>
              </div>

              {ev.description?.en && (
                <p className="text-xs text-gray-500 line-clamp-2">{ev.description.en}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
