import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Notice from '@/models/Notice';
import Link from 'next/link';
import { Bell, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function NoticesPage() {
  await requireAdmin();
  await dbConnect();
  const notices = JSON.parse(JSON.stringify(
    await Notice.find({}).sort({ createdAt: -1 }).limit(50).lean()
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark">Notices</h1>
        <Link href="/admin/notices/add" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Notice
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {notices.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notices yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {notices.map((n: any) => (
              <div key={n._id} className="px-5 py-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-dark">{n.title?.en ?? ''}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(n.publishDate)} • {n.category ?? 'general'} • Priority: {n.priority ?? 'medium'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    n.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>{n.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
