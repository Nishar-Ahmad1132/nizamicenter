'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar, Check, X, Clock, Minus, Save, Users,
  Building2, CheckCircle2, AlertCircle, Loader2, Sparkles
} from 'lucide-react';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

interface BranchOption {
  _id: string;
  name: string;
}

interface DivisionOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  code: string;
  slug: string;
}

interface CourseOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  divisionId?: string;
}

interface ClassOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  divisionId?: string;
}

interface StudentRow {
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    photo?: string;
    phone?: string;
    guardianPhone?: string;
  };
  enrollmentId?: string;
  program: string;
  attendance: {
    status: AttendanceStatus;
    notes?: string;
  } | null;
}

function getLocalizedName(val: unknown): string {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'en' in (val as Record<string, unknown>)) {
    return String((val as Record<string, unknown>).en || '—');
  }
  return '—';
}

export default function AdminAttendanceClient({
  branches,
  divisions,
  courses,
  classes,
}: {
  branches: BranchOption[];
  divisions: DivisionOption[];
  courses: CourseOption[];
  classes: ClassOption[];
}) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [branchId, setBranchId] = useState<string>(branches[0]?._id || '');
  const [divisionId, setDivisionId] = useState<string>('all');
  const [courseId, setCourseId] = useState<string>('all');
  const [classId, setClassId] = useState<string>('all');

  const [sheet, setSheet] = useState<StudentRow[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedDivision = useMemo(() => {
    return divisions.find((d) => d._id === divisionId);
  }, [divisions, divisionId]);

  const isIslamicCenter = useMemo(() => {
    if (!selectedDivision) return false;
    const name = getLocalizedName(selectedDivision.name).toLowerCase();
    return name.includes('islamic') || selectedDivision.code === 'NIC';
  }, [selectedDivision]);

  const filteredCourses = useMemo(() => {
    if (divisionId === 'all') return courses;
    return courses.filter((c) => !c.divisionId || c.divisionId === divisionId);
  }, [courses, divisionId]);

  const filteredClasses = useMemo(() => {
    if (divisionId === 'all') return classes;
    return classes.filter((c) => !c.divisionId || c.divisionId === divisionId);
  }, [classes, divisionId]);

  const loadSheet = useCallback(async () => {
    if (!branchId || !date) return;
    setLoading(true);
    setMessage(null);

    try {
      const params = new URLSearchParams({ branchId, date });
      if (divisionId !== 'all') params.set('divisionId', divisionId);
      if (courseId !== 'all') params.set('courseId', courseId);
      if (classId !== 'all') params.set('classId', classId);

      const res = await fetch(`/api/admin/attendance?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load attendance sheet');

      setSheet(data.sheet || []);

      const initialStatuses: Record<string, AttendanceStatus> = {};
      const initialNotes: Record<string, string> = {};

      for (const row of data.sheet || []) {
        const studentKey = row.student._id;
        initialStatuses[studentKey] = row.attendance?.status ?? 'present';
        initialNotes[studentKey] = row.attendance?.notes ?? '';
      }

      setStatuses(initialStatuses);
      setNotes(initialNotes);
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [branchId, date, divisionId, courseId, classId]);

  // Auto load when branch or date changes
  useEffect(() => {
    loadSheet();
  }, [loadSheet]);

  // Live Summary Stats
  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    for (const row of sheet) {
      const st = statuses[row.student._id] ?? 'present';
      if (st === 'present') present++;
      else if (st === 'absent') absent++;
      else if (st === 'late') late++;
      else if (st === 'leave') leave++;
    }

    const total = sheet.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, absent, late, leave, rate };
  }, [sheet, statuses]);

  function markAll(status: AttendanceStatus) {
    const updated: Record<string, AttendanceStatus> = {};
    for (const row of sheet) {
      updated[row.student._id] = status;
    }
    setStatuses(updated);
  }

  function setStudentStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  }

  function setStudentNote(studentId: string, noteText: string) {
    setNotes((prev) => ({ ...prev, [studentId]: noteText }));
  }

  async function saveAttendance() {
    if (sheet.length === 0) return;
    setSaving(true);
    setMessage(null);

    try {
      const records = sheet.map((row) => ({
        enrollmentId: row.enrollmentId,
        studentId: row.student._id,
        status: statuses[row.student._id] ?? 'present',
        notes: notes[row.student._id] || undefined,
      }));

      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records, branchId, date }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance');

      setMessage({
        type: 'success',
        text: `Attendance successfully saved for ${data.count} students on ${date}.`,
      });
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  const statusPills: {
    status: AttendanceStatus;
    label: string;
    title: string;
    activeClasses: string;
    inactiveClasses: string;
  }[] = [
    {
      status: 'present',
      label: 'P',
      title: 'Present',
      activeClasses: 'bg-emerald-600 text-white font-bold shadow-sm',
      inactiveClasses: 'bg-slate-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700',
    },
    {
      status: 'absent',
      label: 'A',
      title: 'Absent',
      activeClasses: 'bg-rose-600 text-white font-bold shadow-sm',
      inactiveClasses: 'bg-slate-100 text-gray-500 hover:bg-rose-50 hover:text-rose-700',
    },
    {
      status: 'late',
      label: 'L',
      title: 'Late',
      activeClasses: 'bg-amber-500 text-white font-bold shadow-sm',
      inactiveClasses: 'bg-slate-100 text-gray-500 hover:bg-amber-50 hover:text-amber-700',
    },
    {
      status: 'leave',
      label: 'Lv',
      title: 'Approved Leave',
      activeClasses: 'bg-blue-600 text-white font-bold shadow-sm',
      inactiveClasses: 'bg-slate-100 text-gray-500 hover:bg-blue-50 hover:text-blue-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance & Register</h1>
          <p className="text-xs text-gray-500 mt-1">
            Record daily presence, absences, and leaves across all campuses and batches
          </p>
        </div>

        {sheet.length > 0 && (
          <button
            type="button"
            onClick={saveAttendance}
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition self-start sm:self-auto"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Attendance
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Attendance Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Campus / Branch Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Campus / Branch *
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-700"
            >
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Education Division */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Program / Division
            </label>
            <select
              value={divisionId}
              onChange={(e) => {
                setDivisionId(e.target.value);
                setCourseId('all');
                setClassId('all');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-700"
            >
              <option value="all">All Programs (All Students)</option>
              {divisions.map((d) => (
                <option key={d._id} value={d._id}>
                  {getLocalizedName(d.name)} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Course / Class sub-selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {divisionId === 'all'
                ? 'Batch / Specific Standard'
                : isIslamicCenter
                ? 'Islamic Course Track'
                : 'School Standard / Class'}
            </label>
            {isIslamicCenter ? (
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-700"
              >
                <option value="all">All Islamic Courses</option>
                {filteredCourses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {getLocalizedName(c.name)}
                  </option>
                ))}
              </select>
            ) : divisionId !== 'all' ? (
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-700"
              >
                <option value="all">All Standards</option>
                {filteredClasses.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {getLocalizedName(cls.name)}
                  </option>
                ))}
              </select>
            ) : (
              <button
                type="button"
                onClick={loadSheet}
                disabled={loading}
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
                Reload Sheet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      {sheet.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Enrolled</span>
            <p className="text-xl font-extrabold text-gray-900 mt-0.5">{summary.total}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Present</span>
            <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{summary.present}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Absent</span>
            <p className="text-xl font-extrabold text-rose-700 mt-0.5">{summary.absent}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Late</span>
            <p className="text-xl font-extrabold text-amber-700 mt-0.5">{summary.late}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-sm">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Leave</span>
            <p className="text-xl font-extrabold text-blue-700 mt-0.5">{summary.leave}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attendance Rate</span>
            <p className="text-xl font-extrabold text-emerald-800 mt-0.5">{summary.rate}%</p>
          </div>
        </div>
      )}

      {/* Attendance Register Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* Register Top Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900">
              Student Register ({sheet.length} loaded)
            </h2>
            <span className="text-[11px] text-gray-500 font-mono">
              Date: {date}
            </span>
          </div>

          {sheet.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium mr-1">Batch Actions:</span>
              <button
                type="button"
                onClick={() => markAll('present')}
                className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition"
              >
                ✓ Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('absent')}
                className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-semibold transition"
              >
                ✕ Mark All Absent
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading student attendance register...</p>
          </div>
        ) : sheet.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No students found in this campus/program</p>
            <p className="text-xs text-gray-400 mt-1">
              Select another campus branch or verify students are enrolled in this program.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 uppercase tracking-wider border-b border-gray-200 font-semibold text-[11px]">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">Student Name & ID</th>
                  <th className="p-4">Enrolled Track / Class</th>
                  <th className="p-4 text-center">Mark Status</th>
                  <th className="p-4">Remarks / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sheet.map((row, idx) => {
                  const student = row.student;
                  const currentStatus = statuses[student._id] ?? 'present';
                  const currentNote = notes[student._id] ?? '';

                  const displayName = `${student.firstName} ${
                    student.lastName && student.lastName !== '-' ? student.lastName : ''
                  }`.trim();

                  const initials = `${student.firstName?.[0] || 'S'}${
                    student.lastName && student.lastName !== '-' ? student.lastName[0] : ''
                  }`.toUpperCase();

                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 text-center text-gray-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase shadow-inner shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-xs">
                              {displayName}
                            </span>
                            <span className="font-mono text-[10px] text-emerald-800 font-semibold block">
                              {student.studentId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-gray-800 block text-xs">
                          {row.program}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          📞 {student.guardianPhone || student.phone || '—'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          {statusPills.map(({ status, label, title, activeClasses, inactiveClasses }) => {
                            const isSelected = currentStatus === status;
                            return (
                              <button
                                key={status}
                                type="button"
                                title={title}
                                onClick={() => setStudentStatus(student._id, status)}
                                className={`w-8 h-8 rounded-lg text-xs transition flex items-center justify-center ${
                                  isSelected ? activeClasses : inactiveClasses
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-4">
                        <input
                          type="text"
                          value={currentNote}
                          onChange={(e) => setStudentNote(student._id, e.target.value)}
                          placeholder="Optional note..."
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] text-gray-700 bg-white focus:ring-1 focus:ring-emerald-700"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Save Bar */}
        {sheet.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {summary.present} Present, {summary.absent} Absent, {summary.late} Late, {summary.leave} Leave
            </p>
            <button
              type="button"
              onClick={saveAttendance}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Attendance Register
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
