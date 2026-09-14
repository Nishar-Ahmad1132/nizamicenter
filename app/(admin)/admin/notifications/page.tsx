import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Notification from '@/models/Notification';
import '@/models/User';
import '@/models/Branch';
import { Bell, Send, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminNotificationsPage() {
  await requireAdmin();
  await dbConnect();

  const notifications = await Notification.find({})
    .populate('createdBy', 'username')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const items = JSON.parse(JSON.stringify(notifications));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Broadcast Notifications</h1>
          <p className="text-xs text-gray-500 mt-1">
            Send targeted broadcast alerts to students, parents, and faculty portals
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No broadcast notifications sent yet</p>
            <p className="text-xs text-gray-400 mt-1">Push notifications sent to portals will be archived here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200/80">
                  <th className="p-4">Title</th>
                  <th className="p-4">Target Audience</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((n: {
                  _id: string;
                  title: { en: string };
                  message: { en: string };
                  type: string;
                  priority: string;
                  status: string;
                  createdAt: string;
                }) => (
                  <tr key={n._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-xs text-gray-900">{n.title.en}</div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{n.message.en}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 capitalize">
                        {n.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                        n.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {n.priority}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(n.createdAt)}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 capitalize">
                        {n.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
