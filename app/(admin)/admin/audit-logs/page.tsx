import { requireSuperAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import AuditLog from '@/models/AuditLog';
import '@/models/User';
import { ShieldAlert, FileText, Calendar, User, Activity } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminAuditLogsPage() {
  await requireSuperAdmin();
  await dbConnect();

  const logs = await AuditLog.find({})
    .populate('userId', 'username email role')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const items = JSON.parse(JSON.stringify(logs));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Audit Trail</h1>
          <p className="text-xs text-gray-500 mt-1">
            Immutable security log recording administrative actions, fee modifications, and user updates
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            Recent Security & Administrative Events
          </h3>
          <span className="text-xs text-gray-500">{items.length} records</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No audit events recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Critical system actions such as user creation, grade promotion, and fee adjustments will be logged here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200/80">
                  <th className="p-4 font-semibold">Timestamp</th>
                  <th className="p-4 font-semibold">User / Operator</th>
                  <th className="p-4 font-semibold">Action</th>
                  <th className="p-4 font-semibold">Target Entity</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((log: {
                  _id: string;
                  createdAt: string;
                  userId?: { username: string; email?: string };
                  userRole: string;
                  action: string;
                  entity: string;
                  description?: string;
                  ip?: string;
                }) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <div>
                          <span className="font-medium text-xs text-gray-900">{log.userId?.username || 'System'}</span>
                          <span className="block text-[10px] text-gray-400 capitalize">{log.userRole}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-gray-700">
                      {log.entity}
                    </td>
                    <td className="p-4 text-xs text-gray-600 max-w-xs truncate" title={log.description}>
                      {log.description || '—'}
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-500">
                      {log.ip || '127.0.0.1'}
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
