'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare, AlertTriangle, Clock, Check, Loader2, Send,
  ChevronDown, ChevronUp, Filter
} from 'lucide-react';

interface TeacherIssue {
  _id: string;
  teacherId: { _id: string; name: string; teacherId?: string; phone?: string };
  branchId?: { _id: string; name: string };
  category: string;
  priority: string;
  title: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  adminResponse?: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'in_review', 'resolved', 'rejected'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  in_review: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const CATEGORY_LABELS: Record<string, string> = {
  classroom_facility: '🏫 Classroom / Facility',
  student_behavior: '👤 Student Behavior',
  curriculum_books: '📚 Curriculum / Books',
  schedule_timing: '🕐 Schedule / Timing',
  leave_request: '🏖️ Leave Request',
  other: '📝 Other',
};

export default function AdminTeacherIssuesPage() {
  const [issues, setIssues] = useState<TeacherIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseStatus, setResponseStatus] = useState('resolved');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function fetchIssues() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterPriority) params.set('priority', filterPriority);
      const res = await fetch(`/api/admin/teacher-issues?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setIssues(data.issues || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchIssues(); }, [filterStatus, filterPriority]);

  async function handleRespond(issueId: string) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/teacher-issues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, status: responseStatus, adminResponse: responseText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSuccess(`Issue marked as "${responseStatus}" successfully.`);
      setResponding(null);
      setResponseText('');
      await fetchIssues();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const pending = issues.filter((i) => i.status === 'pending').length;
  const urgent = issues.filter((i) => i.priority === 'urgent' && i.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Issues &amp; Requests</h1>
          <p className="text-xs text-gray-500 mt-1">Review and respond to issues submitted by faculty.</p>
        </div>
        <div className="flex gap-3">
          {pending > 0 && (
            <div className="px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {pending} Pending
              {urgent > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">{urgent} Urgent</span>}
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">{error}</div>}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20"
        >
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          onClick={() => { setFilterStatus(''); setFilterPriority(''); }}
          className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          Clear
        </button>
        <span className="ml-auto text-xs text-gray-400 font-medium">{issues.length} results</span>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-16 flex items-center justify-center bg-white rounded-2xl border">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B6B3A]" />
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border text-gray-400 text-sm">
            No issues found.
          </div>
        ) : (
          issues.map((issue) => {
            const isExpanded = expandedId === issue._id;
            const isResponding = responding === issue._id;
            return (
              <div key={issue._id} className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                {/* Header row */}
                <div
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer hover:bg-gray-50/60 transition"
                  onClick={() => setExpandedId(isExpanded ? null : issue._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${STATUS_STYLES[issue.status]}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${PRIORITY_STYLES[issue.priority]}`}>
                        {issue.priority}
                      </span>
                      <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                        {CATEGORY_LABELS[issue.category] || issue.category}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm truncate">{issue.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-semibold text-gray-700">{issue.teacherId?.name}</span>
                      {issue.branchId && ` · ${issue.branchId.name}`}
                      {' · '}
                      <Clock className="w-3 h-3 inline mb-0.5" />{' '}
                      {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {issue.status === 'pending' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setResponding(issue._id); setExpandedId(issue._id); setResponseStatus('in_review'); }}
                        className="px-3.5 py-1.5 bg-[#1B6B3A] text-white text-xs font-bold rounded-xl hover:bg-[#14522c] transition"
                      >
                        Respond
                      </button>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{issue.description}</p>

                    {/* Existing admin response */}
                    {issue.adminResponse && (
                      <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" /> Admin Response
                        </p>
                        <p className="text-xs text-blue-900 leading-relaxed">{issue.adminResponse}</p>
                      </div>
                    )}

                    {/* Response form */}
                    {isResponding && (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-800">Update Issue</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">New Status</label>
                            <select
                              value={responseStatus}
                              onChange={(e) => setResponseStatus(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20"
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Response to Teacher (optional)</label>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={3}
                            placeholder="Provide feedback or resolution notes..."
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 resize-none"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setResponding(null); setResponseText(''); }}
                            className="px-3.5 py-2 text-xs text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRespond(issue._id)}
                            disabled={saving}
                            className="px-4 py-2 bg-[#1B6B3A] text-white text-xs font-bold rounded-xl hover:bg-[#14522c] transition flex items-center gap-2 disabled:opacity-50"
                          >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Save Response
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick action buttons if not already responding */}
                    {!isResponding && issue.status !== 'resolved' && issue.status !== 'rejected' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setResponding(issue._id); setResponseStatus('in_review'); }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
                        >
                          Mark In Review
                        </button>
                        <button
                          onClick={() => { setResponding(issue._id); setResponseStatus('resolved'); }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => { setResponding(issue._id); setResponseStatus('rejected'); }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
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
