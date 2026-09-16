'use client';

import { useState, useEffect } from 'react';
import {
  CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle, Save, Check, Loader2, Users, RefreshCw, Building2, BookOpen
} from 'lucide-react';

interface StudentRow {
  _id: string;
  studentId: string;
  name: string;
  phone?: string;
  gender: string;
  branch: string;
  course: string;
  attendanceStatus: 'present' | 'absent' | 'late' | 'leave';
  hasRecord: boolean;
}

interface TeacherInfo {
  _id: string;
  name: string;
  branchIds: { _id: string; name: string }[];
  courseIds: { _id: string; name: { en: string } | string }[];
}

type Status = 'present' | 'absent' | 'late' | 'leave';

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ReactNode; ring: string; bg: string; text: string }> = {
  present: {
    label: 'Present', icon: <CheckCircle2 className="w-4 h-4" />,
    ring: 'ring-2 ring-emerald-500', bg: 'bg-emerald-500 text-white', text: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
  },
  absent: {
    label: 'Absent', icon: <XCircle className="w-4 h-4" />,
    ring: 'ring-2 ring-red-500', bg: 'bg-red-500 text-white', text: 'text-red-700 bg-red-50 border border-red-200'
  },
  late: {
    label: 'Late', icon: <Clock className="w-4 h-4" />,
    ring: 'ring-2 ring-amber-500', bg: 'bg-amber-500 text-white', text: 'text-amber-700 bg-amber-50 border border-amber-200'
  },
  leave: {
    label: 'Leave', icon: <AlertCircle className="w-4 h-4" />,
    ring: 'ring-2 ring-blue-400', bg: 'bg-blue-400 text-white', text: 'text-blue-700 bg-blue-50 border border-blue-200'
  },
};

function getCourseName(c: { name: { en: string } | string } | string | undefined): string {
  if (!c) return '';
  if (typeof c === 'string') return c;
  if (typeof c.name === 'string') return c.name;
  if (typeof c.name === 'object') return c.name.en || '';
  return '';
}

export default function TeacherAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacher, setTeacher] = useState<TeacherInfo | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  async function fetchStudents(d = date, bId = selectedBranchId, cId = selectedCourseId) {
    setLoading(true);
    setSaved(false);
    setError('');
    try {
      const params = new URLSearchParams({ date: d });
      if (bId) params.set('branchId', bId);
      if (cId) params.set('courseId', cId);

      const res = await fetch(`/api/teacher/attendance?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setTeacher(data.teacher);
      setStudents(data.students || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateStatus(id: string, status: Status) {
    setStudents((prev) => prev.map((s) => (s._id === id ? { ...s, attendanceStatus: status } : s)));
    setSaved(false);
  }

  function markAll(status: Status) {
    setStudents((prev) => prev.map((s) => ({ ...s, attendanceStatus: status })));
    setSaved(false);
  }

  async function handleSave() {
    if (students.length === 0) return;
    setSaving(true);
    setError('');
    try {
      const entries = students.map((s) => ({
        studentId: s._id,
        status: s.attendanceStatus,
      }));
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, entries }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaved(true);
      // Refresh to reflect saved status
      await fetchStudents(date, selectedBranchId, selectedCourseId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const presentCount = students.filter((s) => s.attendanceStatus === 'present').length;
  const absentCount = students.filter((s) => s.attendanceStatus === 'absent').length;
  const lateCount = students.filter((s) => s.attendanceStatus === 'late').length;
  const leaveCount = students.filter((s) => s.attendanceStatus === 'leave').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Record daily student attendance for your assigned classes.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => markAll('present')}
            className="px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-800 bg-emerald-50 text-xs font-semibold hover:bg-emerald-100 transition"
          >
            ✓ All Present
          </button>
          <button
            onClick={() => markAll('absent')}
            className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 text-xs font-semibold hover:bg-red-100 transition"
          >
            ✗ All Absent
          </button>
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="px-5 py-2 rounded-xl bg-[#1B6B3A] text-white text-xs font-bold hover:bg-[#14522c] transition shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Attendance successfully recorded in the database for {date}.</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Filters: Date, Branch, Course */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">📅 Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Branch</span>
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30"
          >
            <option value="">All Branches</option>
            {teacher?.branchIds.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Course / Subject</span>
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30"
          >
            <option value="">All Courses</option>
            {teacher?.courseIds.map((c) => (
              <option key={c._id} value={c._id}>{getCourseName(c)}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3 flex items-center justify-end gap-3">
          <button
            onClick={() => fetchStudents(date, selectedBranchId, selectedCourseId)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {loading ? 'Loading...' : 'Load Students'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Present', count: presentCount, color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
            { label: 'Absent', count: absentCount, color: 'bg-red-50 border-red-200 text-red-900' },
            { label: 'Late', count: lateCount, color: 'bg-amber-50 border-amber-200 text-amber-900' },
            { label: 'Leave', count: leaveCount, color: 'bg-blue-50 border-blue-200 text-blue-900' },
          ].map((stat) => (
            <div key={stat.label} className={`p-3 rounded-xl border text-center ${stat.color}`}>
              <p className="text-2xl font-extrabold">{stat.count}</p>
              <p className="text-xs font-semibold mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1B6B3A]" />
            <h2 className="font-bold text-gray-900">
              Students{' '}
              <span className="font-normal text-gray-500 text-sm">({students.length} total)</span>
            </h2>
          </div>
          {saved && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Attendance Saved
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B6B3A]" />
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No students found for selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold text-left">
                <tr>
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Student ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Branch / Course</th>
                  <th className="px-5 py-3 text-center">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s, idx) => (
                  <tr
                    key={s._id}
                    className={`hover:bg-gray-50/60 transition ${
                      s.attendanceStatus === 'absent' ? 'bg-red-50/30' :
                      s.attendanceStatus === 'late' ? 'bg-amber-50/30' :
                      s.attendanceStatus === 'leave' ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <td className="px-5 py-3 text-gray-400 text-xs font-medium">{idx + 1}</td>
                    <td className="px-5 py-3 font-mono font-bold text-xs text-[#1B6B3A]">{s.studentId}</td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        {s.phone && <p className="text-xs text-gray-400">{s.phone}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600">
                      {s.branch && <p className="font-medium">{s.branch}</p>}
                      {s.course && <p className="text-gray-400">{s.course}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {(['present', 'absent', 'late', 'leave'] as Status[]).map((status) => {
                          const cfg = STATUS_CONFIG[status];
                          const isActive = s.attendanceStatus === status;
                          return (
                            <button
                              key={status}
                              onClick={() => updateStatus(s._id, status)}
                              title={cfg.label}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                isActive ? cfg.text : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {cfg.icon}
                              <span className="hidden sm:inline">{cfg.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {students.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#1B6B3A] text-white text-sm font-bold hover:bg-[#14522c] transition shadow flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
