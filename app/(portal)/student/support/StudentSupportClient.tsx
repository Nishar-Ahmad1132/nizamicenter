'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Send,
  Sparkles,
  HelpCircle,
  Calendar,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface EnquiryRecord {
  _id: string;
  name: string;
  phone: string;
  message?: string;
  interestedDivision?: string;
  status: 'new' | 'contacted' | 'followup' | 'converted' | 'resolved' | 'not_interested';
  adminResponse?: string;
  respondedAt?: string;
  createdAt: string;
}

interface Props {
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  initialEnquiries: EnquiryRecord[];
}

export default function StudentSupportClient({
  studentName,
  studentPhone,
  studentEmail,
  initialEnquiries,
}: Props) {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>(initialEnquiries);
  const [showNewForm, setShowNewForm] = useState(false);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Academic Query');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusMeta: Record<
    string,
    { label: string; badge: string; icon: any }
  > = {
    new: {
      label: 'Submitted / Under Review',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Clock,
    },
    contacted: {
      label: 'Counselor Reached Out',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: MessageSquare,
    },
    followup: {
      label: 'Follow-up In Progress',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertCircle,
    },
    converted: {
      label: 'Approved / Enrolled',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: CheckCircle2,
    },
    resolved: {
      label: 'Resolved & Answered',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: CheckCircle2,
    },
    not_interested: {
      label: 'Closed',
      badge: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: AlertCircle,
    },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName,
          phone: studentPhone || '8779282185',
          email: studentEmail || undefined,
          interestedDivision: 'Student Portal Helpdesk',
          message: `[${category}] ${message}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setSuccess(true);
      setMessage('');
      // Add optimistic item
      setEnquiries([
        {
          _id: data.enquiryId || Date.now().toString(),
          name: studentName,
          phone: studentPhone,
          message: `[${category}] ${message}`,
          interestedDivision: 'Student Portal Helpdesk',
          status: 'new',
          createdAt: new Date().toISOString(),
        },
        ...enquiries,
      ]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Helpdesk & Support Inquiries</h1>
          <p className="text-xs text-gray-500 mt-1">
            View administrative responses to your submitted inquiries or raise a new support request
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/918779282185?text=Assalamu%20Alaikum%2C%20I%20am%20a%20student%20at%20Nizami%20Center%20and%20need%20assistance."
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1EBE5D] transition flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Direct WhatsApp Helpdesk
          </a>

          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition flex items-center gap-1.5 shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showNewForm ? 'Close Form' : 'Raise New Request'}
          </button>
        </div>
      </div>

      {/* New Request Collapsible Form */}
      {showNewForm && (
        <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm animate-in fade-in duration-200">
          <h2 className="text-base font-bold text-gray-900 mb-1">Submit a Query to Administration</h2>
          <p className="text-xs text-gray-500 mb-4">
            Our campus counselors and administrative office will review your message and reply back here.
          </p>

          {success && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your query has been submitted successfully to the administration!</span>
            </div>
          )}

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="Academic Query">Academic / Syllabus / Timetable Question</option>
                <option value="Fee & Payment">Fee Receipts & Payment Inquiry</option>
                <option value="ID Card & Documents">ID Card / Bonafide / Documents Request</option>
                <option value="Account & Login">Portal Login / Password Support</option>
                <option value="General Query">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Your Message *</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain what you need assistance with..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inquiries List */}
      <div className="space-y-4">
        {enquiries.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-sm">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 text-base">No Inquiries Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              You haven't submitted any inquiries or support queries yet. If you have any questions, click "Raise New Request" above.
            </p>
          </div>
        ) : (
          enquiries.map((item) => {
            const meta = statusMeta[item.status] || statusMeta.new;
            const Icon = meta.icon;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4 hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">
                        {item.interestedDivision || 'General Support Inquiry'}
                      </span>
                      <span className="text-xs text-gray-400">#{item._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>Submitted: {formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border self-start sm:self-auto ${meta.badge}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </span>
                </div>

                {/* User Message */}
                <div className="text-xs">
                  <span className="font-semibold text-gray-500 block mb-1">Your Query:</span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-gray-200/60 text-gray-800">
                    "{item.message || 'No description'}"
                  </p>
                </div>

                {/* Admin Official Response */}
                {item.adminResponse ? (
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        Official Administration Response
                      </span>
                      {item.respondedAt && (
                        <span className="text-[10px] text-emerald-700">
                          {formatDate(item.respondedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-950 whitespace-pre-wrap font-medium leading-relaxed">
                      {item.adminResponse}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-800 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>Your request is under review. Our administrative team will post an update here shortly.</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
