'use client';

import { useState } from 'react';
import {
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Search,
  Check,
  X,
  Loader2,
  Sparkles,
  Trash2,
  Send,
  HelpCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface EnquiryItem {
  _id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  interestedDivision?: string;
  interestedClass?: string;
  interestedCourse?: string;
  branchId?: { _id: string; name: string };
  message?: string;
  status: 'new' | 'contacted' | 'followup' | 'converted' | 'resolved' | 'not_interested';
  notes?: string;
  adminResponse?: string;
  lastContactedAt?: string;
  respondedAt?: string;
  createdAt: string;
}

interface Props {
  initialEnquiries: EnquiryItem[];
  counts: {
    total: number;
    new: number;
    followup: number;
    converted: number;
    resolved: number;
  };
}

export default function AdminEnquiriesClient({ initialEnquiries, counts }: Props) {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(initialEnquiries);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEnquiry, setActiveEnquiry] = useState<EnquiryItem | null>(null);

  // Form states for modal
  const [status, setStatus] = useState<EnquiryItem['status']>('new');
  const [notes, setNotes] = useState<string>('');
  const [adminResponse, setAdminResponse] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const statusColors: Record<string, string> = {
    new: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    contacted: 'bg-blue-100 text-blue-800 border-blue-200',
    followup: 'bg-amber-100 text-amber-800 border-amber-200',
    converted: 'bg-purple-100 text-purple-800 border-purple-200',
    resolved: 'bg-teal-100 text-teal-800 border-teal-200',
    not_interested: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const statusLabels: Record<string, string> = {
    new: 'New / Unread',
    contacted: 'Contacted',
    followup: 'Needs Follow-up',
    converted: 'Converted (Admitted)',
    resolved: 'Resolved / Answered',
    not_interested: 'Not Interested',
  };

  function openActionModal(enquiry: EnquiryItem) {
    setActiveEnquiry(enquiry);
    setStatus(enquiry.status);
    setNotes(enquiry.notes || '');
    setAdminResponse(enquiry.adminResponse || '');
    setFeedback(null);
  }

  function getWhatsAppUrl(enquiry: EnquiryItem) {
    const rawPhone = (enquiry.whatsapp || enquiry.phone || '').replace(/\D/g, '');
    const phoneWithCountry = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const interest = enquiry.interestedDivision || enquiry.interestedCourse || enquiry.interestedClass || 'Nizami Center';
    const text = `Assalamu Alaikum ${enquiry.name},\n\nGreetings from Nizami Islamic Center & Nizami Education (Baneli, Titwala).\n\nWe received your enquiry regarding ${interest}${enquiry.message ? ` ("${enquiry.message.slice(0, 50)}...")` : ''}.\n\nHow may our admissions & counseling team assist you today?`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
  }

  async function handleSaveAction() {
    if (!activeEnquiry) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/enquiries/${activeEnquiry._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes,
          adminResponse,
          markContacted: status === 'contacted',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update enquiry');
      }

      // Update in local state
      const updated = enquiries.map((e) =>
        e._id === activeEnquiry._id
          ? {
              ...e,
              status,
              notes,
              adminResponse,
              respondedAt: adminResponse ? new Date().toISOString() : e.respondedAt,
              lastContactedAt: status === 'contacted' ? new Date().toISOString() : e.lastContactedAt,
            }
          : e
      );
      setEnquiries(updated);
      setFeedback({ type: 'success', message: 'Action saved successfully! Updated in real time.' });
      setTimeout(() => {
        setActiveEnquiry(null);
      }, 1200);
    } catch (err) {
      setFeedback({ type: 'error', message: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEnquiry() {
    if (!activeEnquiry) return;
    if (!confirm(`Are you sure you want to delete the enquiry from ${activeEnquiry.name}?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${activeEnquiry._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setEnquiries(enquiries.filter((e) => e._id !== activeEnquiry._id));
      setActiveEnquiry(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  // Filter inquiries
  const filtered = enquiries.filter((e) => {
    const matchesStatus = selectedStatus === 'all' || e.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesSearch =
      e.name.toLowerCase().includes(q) ||
      e.phone.toLowerCase().includes(q) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.message && e.message.toLowerCase().includes(q)) ||
      (e.interestedDivision && e.interestedDivision.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admission & General Enquiries</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track inquiries submitted through the website, contact prospective students, and post official responses
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setSelectedStatus('all')}
          className={`cursor-pointer bg-white p-4 rounded-xl border transition-all ${
            selectedStatus === 'all' ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow' : 'border-gray-200/80 shadow-sm'
          }`}
        >
          <p className="text-xs text-gray-500 font-medium">Total Inquiries</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{enquiries.length}</p>
        </div>

        <div
          onClick={() => setSelectedStatus('new')}
          className={`cursor-pointer bg-emerald-50/60 p-4 rounded-xl border transition-all ${
            selectedStatus === 'new' ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow' : 'border-emerald-100 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 font-medium">New / Unread</p>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {enquiries.filter((e) => e.status === 'new').length}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatus('contacted')}
          className={`cursor-pointer bg-blue-50/60 p-4 rounded-xl border transition-all ${
            selectedStatus === 'contacted' ? 'border-blue-600 ring-2 ring-blue-500/20 shadow' : 'border-blue-100 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-800 font-medium">Contacted</p>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {enquiries.filter((e) => e.status === 'contacted').length}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatus('followup')}
          className={`cursor-pointer bg-amber-50/60 p-4 rounded-xl border transition-all ${
            selectedStatus === 'followup' ? 'border-amber-600 ring-2 ring-amber-500/20 shadow' : 'border-amber-100 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-800 font-medium">Follow-up</p>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {enquiries.filter((e) => e.status === 'followup').length}
          </p>
        </div>

        <div
          onClick={() => setSelectedStatus('converted')}
          className={`cursor-pointer bg-purple-50/60 p-4 rounded-xl border transition-all ${
            selectedStatus === 'converted' ? 'border-purple-600 ring-2 ring-purple-500/20 shadow' : 'border-purple-100 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-purple-800 font-medium">Converted</p>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-1">
            {enquiries.filter((e) => e.status === 'converted').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { label: 'All', value: 'all' },
            { label: 'New', value: 'new' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Follow-up', value: 'followup' },
            { label: 'Converted', value: 'converted' },
            { label: 'Resolved', value: 'resolved' },
          ].map((tab) => {
            const active = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prospect, phone, query..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No enquiries found</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery ? 'Try adjusting your search criteria' : 'Inquiries submitted via contact forms will show up here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200/80">
                  <th className="p-4 font-semibold">Prospect</th>
                  <th className="p-4 font-semibold">Interest</th>
                  <th className="p-4 font-semibold">Campus</th>
                  <th className="p-4 font-semibold">Message & Reply</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((e) => {
                  const waLink = getWhatsAppUrl(e);
                  return (
                    <tr key={e._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{e.name}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <a href={`tel:${e.phone}`} className="hover:text-emerald-700 font-mono">
                            {e.phone}
                          </a>
                        </div>
                        {e.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{e.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-700">
                        <span className="font-semibold text-emerald-900">{e.interestedDivision || 'General Enquiry'}</span>
                        {(e.interestedClass || e.interestedCourse) && (
                          <div className="text-gray-500 mt-0.5">
                            {e.interestedClass ? `Class ${e.interestedClass}` : e.interestedCourse}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-600">
                        {e.branchId?.name || 'Any Branch'}
                      </td>
                      <td className="p-4 text-xs max-w-xs">
                        <p className="text-gray-700 truncate" title={e.message}>
                          {e.message || '—'}
                        </p>
                        {e.adminResponse && (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-[10px] font-medium">
                            <Check className="w-2.5 h-2.5" /> Replied
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{formatDate(e.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full capitalize border ${
                            statusColors[e.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[e.status] || e.status}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click WhatsApp */}
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          {/* Quick Call */}
                          <a
                            href={`tel:${e.phone}`}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                            title="Call Prospect"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          {/* Take Action Button */}
                          <button
                            onClick={() => openActionModal(e)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition shadow-sm"
                          >
                            Take Action
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action & Response Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Manage & Respond to Enquiry</h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Inquiry #{activeEnquiry._id.slice(-6).toUpperCase()} • Submitted {formatDate(activeEnquiry.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setActiveEnquiry(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Prospect Quick Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{activeEnquiry.name}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-1">
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" /> {activeEnquiry.phone}
                    </span>
                    {activeEnquiry.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-600" /> {activeEnquiry.email}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-800 font-semibold mt-1">
                    Interested in: {activeEnquiry.interestedDivision || 'General'}
                    {activeEnquiry.interestedClass ? ` — Class ${activeEnquiry.interestedClass}` : ''}
                    {activeEnquiry.interestedCourse ? ` — ${activeEnquiry.interestedCourse}` : ''}
                  </p>
                </div>

                {/* Direct Outreach Shortcuts */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getWhatsAppUrl(activeEnquiry)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${activeEnquiry.phone}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>
              </div>

              {/* Original Message Box */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  User Inquiry Message
                </label>
                <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-3.5 text-sm text-gray-800">
                  {activeEnquiry.message ? (
                    <p className="italic">"{activeEnquiry.message}"</p>
                  ) : (
                    <p className="text-gray-400 italic">No specific message provided (callback requested).</p>
                  )}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Update Inquiry Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'new', label: 'New / Unread', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                    { id: 'contacted', label: 'Contacted', color: 'border-blue-500 bg-blue-50 text-blue-800' },
                    { id: 'followup', label: 'Needs Follow-up', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                    { id: 'converted', label: 'Converted (Admitted)', color: 'border-purple-500 bg-purple-50 text-purple-800' },
                    { id: 'resolved', label: 'Resolved / Answered', color: 'border-teal-500 bg-teal-50 text-teal-800' },
                    { id: 'not_interested', label: 'Not Interested', color: 'border-gray-500 bg-gray-50 text-gray-700' },
                  ].map((s) => {
                    const isSelected = status === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStatus(s.id as EnquiryItem['status'])}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition flex items-center justify-between ${
                          isSelected
                            ? `${s.color} ring-2 ring-emerald-500/20 shadow-sm`
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>{s.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Official Response / Reply (Reflects to User via Tracker) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Official Response to User
                  </label>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Visible to user when tracking status
                  </span>
                </div>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={3}
                  placeholder="e.g. Assalamu Alaikum! Counselor has contacted you via WhatsApp. Campus visit scheduled for Sunday at 10 AM."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none transition"
                />

                {/* Quick Templates */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-gray-400 font-medium self-center">Quick Reply:</span>
                  {[
                    'Contacted via WhatsApp & details shared.',
                    'Campus visit tour scheduled for this weekend.',
                    'Admission form sent. Verification pending.',
                    'Password reset completed. Details sent.',
                  ].map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => setAdminResponse(template)}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-[10px] text-gray-600 rounded-md border border-gray-200 transition"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Counselor Notes (Private) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Internal Administrative Notes (Private)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Mother is looking for afternoon batch. Budget discussed. Call back on Friday."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none transition"
                />
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{feedback.message}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDeleteEnquiry}
                disabled={deleting || saving}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Enquiry
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEnquiry(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200/70 rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAction}
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Action & Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
