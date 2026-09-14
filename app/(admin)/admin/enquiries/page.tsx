import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Enquiry from '@/models/Enquiry';
import '@/models/Branch';
import { Mail, Phone, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  await dbConnect();

  const { status } = await searchParams;
  const filter: Record<string, unknown> = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  const [enquiries, totalCount, newCount, followupCount, convertedCount] = await Promise.all([
    Enquiry.find(filter)
      .populate('branchId', 'name')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    Enquiry.countDocuments({}),
    Enquiry.countDocuments({ status: 'new' }),
    Enquiry.countDocuments({ status: 'followup' }),
    Enquiry.countDocuments({ status: 'converted' }),
  ]);

  const items = JSON.parse(JSON.stringify(enquiries));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admission & General Enquiries</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track inquiries submitted through the website and follow up with prospective students
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Inquiries</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 font-medium">New / Unread</p>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{newCount}</p>
        </div>
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-800 font-medium">Needs Follow-up</p>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{followupCount}</p>
        </div>
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-800 font-medium">Converted</p>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{convertedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { label: 'All', value: 'all' },
          { label: 'New', value: 'new' },
          { label: 'Contacted', value: 'contacted' },
          { label: 'Follow-up', value: 'followup' },
          { label: 'Converted', value: 'converted' },
        ].map((tab) => {
          const active = (!status && tab.value === 'all') || status === tab.value;
          return (
            <a
              key={tab.value}
              href={`/admin/enquiries${tab.value === 'all' ? '' : `?status=${tab.value}`}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                active
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No enquiries found</p>
            <p className="text-xs text-gray-400 mt-1">Inquiries submitted via contact forms will show up here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200/80">
                  <th className="p-4 font-semibold">Prospect</th>
                  <th className="p-4 font-semibold">Interest</th>
                  <th className="p-4 font-semibold">Campus</th>
                  <th className="p-4 font-semibold">Message</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((e: {
                  _id: string;
                  name: string;
                  phone: string;
                  email?: string;
                  interestedDivision?: string;
                  interestedClass?: string;
                  interestedCourse?: string;
                  branchId?: { name: string };
                  message?: string;
                  createdAt: string;
                  status: string;
                }) => {
                  const statusColors: Record<string, string> = {
                    new: 'bg-emerald-100 text-emerald-800',
                    contacted: 'bg-blue-100 text-blue-800',
                    followup: 'bg-amber-100 text-amber-800',
                    converted: 'bg-purple-100 text-purple-800',
                    not_interested: 'bg-gray-100 text-gray-600',
                  };

                  return (
                    <tr key={e._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{e.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <a href={`tel:${e.phone}`} className="hover:text-emerald-700">{e.phone}</a>
                        </div>
                        {e.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{e.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-700">
                        <span className="font-medium">{e.interestedDivision || 'General Inquiry'}</span>
                        {(e.interestedClass || e.interestedCourse) && (
                          <div className="text-gray-500 mt-0.5">
                            {e.interestedClass ? `Class ${e.interestedClass}` : e.interestedCourse}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-600">
                        {e.branchId?.name || 'Any Branch'}
                      </td>
                      <td className="p-4 text-xs text-gray-600 max-w-xs truncate" title={e.message}>
                        {e.message || '—'}
                      </td>
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{formatDate(e.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusColors[e.status] || 'bg-gray-100 text-gray-800'}`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
