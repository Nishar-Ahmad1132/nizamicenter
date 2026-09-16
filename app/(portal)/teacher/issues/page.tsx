'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, Loader2, Plus, X, Send, MessageSquare
} from 'lucide-react';

interface Issue {
  _id: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  adminResponse?: string;
  createdAt: string;
}

const CATEGORIES = [
  { value: 'classroom_facility', label: '🏫 Classroom / Facility' },
  { value: 'student_behavior', label: '👤 Student Behavior' },
  { value: 'curriculum_books', label: '📚 Curriculum / Books' },
  { value: 'schedule_timing', label: '🕐 Schedule / Timing' },
  { value: 'leave_request', label: '🏖️ Leave Request' },
  { value: 'other', label: '📝 Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-gray-600 bg-gray-100' },
  { value: 'medium', label: 'Medium', color: 'text-amber-700 bg-amber-100' },
  { value: 'high', label: 'High', color: 'text-orange-700 bg-orange-100' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-700 bg-red-100' },
];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  in_review: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function TeacherIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    category: 'other',
    priority: 'medium',
    title: '',
    description: '',
  });

  async function fetchIssues() {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/issues');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setIssues(data.issues || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIssues();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Please fill in title and description.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/teacher/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess('Issue submitted successfully! Admin will review it shortly.');
      setForm({ category: 'other', priority: 'medium', title: '', description: '' });
      setShowForm(false);
      await fetchIssues();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues &amp; Requests</h1>
          <p className="text-xs text-gray-500 mt-1">
            Raise concerns, submit leave requests, or communicate directly with administration.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          className="px-4 py-2.5 bg-[#1B6B3A] text-white text-xs font-bold rounded-xl hover:bg-[#14522c] transition flex items-center gap-2 shadow-sm"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Issue / Request'}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">{error}</div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {success}
        </div>
      )}

      {/* New Issue Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-[#1B6B3A]" />
            <h2 className="font-bold text-gray-900">Submit New Issue / Request</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject / Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Brief summary of the issue"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Details / Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder="Describe the issue in detail. Include dates, students involved, or any other relevant information."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-[#1B6B3A] text-white text-sm font-bold rounded-xl hover:bg-[#14522c] transition disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit to Admin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 flex items-center justify-center bg-white rounded-2xl border">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B6B3A]" />
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
            <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No issues submitted yet.</p>
            <p className="text-xs text-gray-400 mt-1">Use the button above to raise a concern or request.</p>
          </div>
        ) : (
          issues.map((issue) => {
            const priorityCfg = PRIORITIES.find((p) => p.value === issue.priority);
            const catLabel = CATEGORIES.find((c) => c.value === issue.category)?.label || issue.category;
            return (
              <div
                key={issue._id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3 shadow-xs hover:shadow-sm transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${STATUS_STYLES[issue.status]}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {catLabel}
                      </span>
                      {priorityCfg && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${priorityCfg.color}`}>
                          {priorityCfg.label} Priority
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{issue.title}</h3>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>

                {/* Admin Response */}
                {issue.adminResponse && (
                  <div className="mt-2 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Admin Response
                    </p>
                    <p className="text-xs text-blue-900 leading-relaxed">{issue.adminResponse}</p>
                  </div>
                )}

                {issue.status === 'resolved' && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> This issue has been resolved.
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
