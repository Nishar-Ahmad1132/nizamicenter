'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap, ArrowRight, CheckCircle2, AlertTriangle, Users,
  BookOpen, School, Loader2, Sparkles, Check
} from 'lucide-react';

interface AcademicYearOption {
  _id: string;
  name: string;
  isCurrent?: boolean;
}

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

interface ClassOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  divisionId?: string;
  numericValue?: number;
}

interface CourseOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  divisionId?: string;
}

interface CandidateStudent {
  enrollmentId?: string;
  studentId: string;
  studentCode: string;
  name: string;
  branchName: string;
  branchId: string;
  divisionId: string;
  divisionCode: string;
  isNic: boolean;
  currentProgram: string;
  projectedProgram?: string;
  currentClassId?: string;
  currentCourseId?: string;
  academicYearId: string;
  status: string;
}

function getLocalizedName(val: unknown): string {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'en' in (val as Record<string, unknown>)) {
    return String((val as Record<string, unknown>).en || '—');
  }
  return '—';
}

export default function AdminPromotionsClient({
  academicYears,
  branches,
  divisions,
  classes,
  courses,
}: {
  academicYears: AcademicYearOption[];
  branches: BranchOption[];
  divisions: DivisionOption[];
  classes: ClassOption[];
  courses: CourseOption[];
}) {
  const router = useRouter();

  // Determine current and next academic sessions
  const currentAcademicYear = useMemo(() => {
    return academicYears.find((y) => y.isCurrent) || academicYears[0];
  }, [academicYears]);

  const targetDefaultYear = useMemo(() => {
    const future = academicYears.find((y) => !y.isCurrent);
    return future ? future._id : currentAcademicYear?._id || '';
  }, [academicYears, currentAcademicYear]);

  // "From" Source Session State
  const [fromYearId, setFromYearId] = useState<string>(currentAcademicYear?._id || 'all');
  const [fromBranchId, setFromBranchId] = useState<string>('all');
  const [fromDivisionId, setFromDivisionId] = useState<string>('all');
  const [fromClassId, setFromClassId] = useState<string>('all');
  const [fromCourseId, setFromCourseId] = useState<string>('all');

  // "To" Target Session State
  const [toYearId, setToYearId] = useState<string>(targetDefaultYear);
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [targetCourseId, setTargetCourseId] = useState<string>('');
  const [action, setAction] = useState<'promote' | 'retain' | 'graduate'>('promote');
  const [notes, setNotes] = useState<string>('');

  // Candidates & Selection State
  const [candidates, setCandidates] = useState<CandidateStudent[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedDivision = useMemo(() => {
    return divisions.find((d) => d._id === fromDivisionId);
  }, [divisions, fromDivisionId]);

  const isIslamicCenterOnly = useMemo(() => {
    if (!selectedDivision) return false;
    return selectedDivision.code === 'NIC' || selectedDivision.slug?.includes('islamic');
  }, [selectedDivision]);

  const isEducationOnly = useMemo(() => {
    if (!selectedDivision) return false;
    return selectedDivision.code === 'NE' || selectedDivision.slug?.includes('education');
  }, [selectedDivision]);

  const isAllPrograms = fromDivisionId === 'all';

  const filteredCourses = useMemo(() => {
    if (fromDivisionId === 'all') return courses;
    return courses.filter((c) => !c.divisionId || c.divisionId === fromDivisionId);
  }, [courses, fromDivisionId]);

  const filteredClasses = useMemo(() => {
    if (fromDivisionId === 'all') return classes;
    return classes.filter((c) => !c.divisionId || c.divisionId === fromDivisionId);
  }, [classes, fromDivisionId]);

  // Load Candidates
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const params = new URLSearchParams();
      if (fromYearId) params.set('academicYearId', fromYearId);
      if (fromBranchId && fromBranchId !== 'all') params.set('branchId', fromBranchId);
      if (fromDivisionId && fromDivisionId !== 'all') params.set('divisionId', fromDivisionId);
      if (fromClassId && fromClassId !== 'all') params.set('classId', fromClassId);
      if (fromCourseId && fromCourseId !== 'all') params.set('courseId', fromCourseId);

      const res = await fetch(`/api/admin/promotions?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load eligible students');

      const loadedCandidates: CandidateStudent[] = data.candidates || [];
      setCandidates(loadedCandidates);
      // Select all by default
      const allIds = new Set<string>(loadedCandidates.map((c) => c.studentId));
      setSelectedIds(allIds);
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [fromYearId, fromBranchId, fromDivisionId, fromClassId, fromCourseId]);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      if (!ignore) {
        loadCandidates();
      }
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [loadCandidates]);

  function toggleStudent(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidates.map((c) => c.studentId)));
    }
  }

  async function handleExecutePromotion() {
    if (selectedIds.size === 0) return;
    setPromoting(true);
    setMessage(null);

    try {
      const selectedRecords = candidates
        .filter((c) => selectedIds.has(c.studentId))
        .map((c) => ({
          studentId: c.studentId,
          enrollmentId: c.enrollmentId,
          branchId: c.branchId,
          divisionId: c.divisionId,
          isNic: c.isNic,
        }));

      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentRecords: selectedRecords,
          toAcademicYearId: toYearId,
          targetClassId: targetClassId || undefined,
          targetCourseId: targetCourseId || undefined,
          action,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute promotions');

      setMessage({ type: 'success', text: data.message });
      setIsConfirmOpen(false);
      await loadCandidates();
      router.refresh();
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
      setIsConfirmOpen(false);
    } finally {
      setPromoting(false);
    }
  }

  const fromYearObj = academicYears.find((y) => y._id === fromYearId);
  const toYearObj = academicYears.find((y) => y._id === toYearId);
  const targetClassObj = classes.find((c) => c._id === targetClassId);
  const targetCourseObj = courses.find((c) => c._id === targetCourseId);

  // Division Breakdown Counters
  const countNE = useMemo(() => candidates.filter((c) => !c.isNic).length, [candidates]);
  const countNIC = useMemo(() => candidates.filter((c) => c.isNic).length, [candidates]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Academic Promotions</h1>
        <p className="text-xs text-gray-500 mt-1">
          Promote students to the next grade or course level across both Nizami Islamic Center (NIC) and Nizami Education (NE)
        </p>
      </div>

      {/* Promotion Configurator Panel */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-700" />
          Batch Promotion Workflow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-xl border border-gray-100 mb-6">
          {/* FROM: Source Session */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
              From (Current Session)
            </span>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={fromYearId}
                onChange={(e) => setFromYearId(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white focus:ring-1 focus:ring-emerald-700"
              >
                <option value="all">All Academic Sessions</option>
                {academicYears.map((y) => (
                  <option key={y._id} value={y._id}>
                    {y.name} {y.isCurrent ? '(Current Active Session)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Campus / Branch</label>
              <select
                value={fromBranchId}
                onChange={(e) => setFromBranchId(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Program / Division</label>
              <select
                value={fromDivisionId}
                onChange={(e) => {
                  setFromDivisionId(e.target.value);
                  setFromClassId('all');
                  setFromCourseId('all');
                }}
                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white font-medium text-gray-900"
              >
                <option value="all">All Programs (Both NIC & NE)</option>
                {divisions.map((d) => (
                  <option key={d._id} value={d._id}>
                    {getLocalizedName(d.name)} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Division specific sub-filters */}
            {isIslamicCenterOnly && (
              <div>
                <label className="block text-xs font-medium text-emerald-800 mb-1">Filter by Islamic Course</label>
                <select
                  value={fromCourseId}
                  onChange={(e) => setFromCourseId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white"
                >
                  <option value="all">All Islamic Courses</option>
                  {filteredCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {getLocalizedName(c.name)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isEducationOnly && (
              <div>
                <label className="block text-xs font-medium text-blue-800 mb-1">Filter by Standard / Grade</label>
                <select
                  value={fromClassId}
                  onChange={(e) => setFromClassId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white"
                >
                  <option value="all">All Standards / Grades</option>
                  {filteredClasses.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {getLocalizedName(cls.name)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isAllPrograms && (
              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100/80 text-[11px] text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Showing students of both Islamic Center (NIC) and Nizami Education (NE).</span>
              </div>
            )}
          </div>

          {/* TO: Target Session */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              Promote To (Target Session)
            </span>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Academic Year *</label>
              <select
                value={toYearId}
                onChange={(e) => setToYearId(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white focus:ring-1 focus:ring-emerald-700 font-semibold text-gray-900"
              >
                {academicYears.map((y) => (
                  <option key={y._id} value={y._id}>
                    {y.name} {y.isCurrent ? '(Current Session)' : '(Upcoming Session)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Action *</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'promote' | 'retain' | 'graduate')}
                className="w-full text-xs rounded-lg border border-gray-300 p-2.5 bg-white"
              >
                <option value="promote">Promote (Advance to Next Level / Grade)</option>
                <option value="retain">Retain (Keep in Same Grade / Repeat Year)</option>
                <option value="graduate">Graduate (Completed Program / Alumni)</option>
              </select>
            </div>

            {action === 'promote' && (
              <div className="space-y-3">
                {/* Target for Nizami Education */}
                {(isAllPrograms || isEducationOnly) && (
                  <div>
                    <label className="block text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">NE</span>
                      Next Standard for Nizami Education
                    </label>
                    <select
                      value={targetClassId}
                      onChange={(e) => setTargetClassId(e.target.value)}
                      className="w-full text-xs rounded-lg border border-blue-200 p-2.5 bg-white focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="">Auto-advance (Class 1 ➔ 2, Class 2 ➔ 3, etc.)</option>
                      {filteredClasses.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          Assign All to: {getLocalizedName(cls.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Target for Nizami Islamic Center */}
                {(isAllPrograms || isIslamicCenterOnly) && (
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">NIC</span>
                      Next Course for Islamic Center
                    </label>
                    <select
                      value={targetCourseId}
                      onChange={(e) => setTargetCourseId(e.target.value)}
                      className="w-full text-xs rounded-lg border border-emerald-200 p-2.5 bg-white focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="">Auto-advance to next sequential course level</option>
                      {filteredCourses.map((c) => (
                        <option key={c._id} value={c._id}>
                          Assign All to: {getLocalizedName(c.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Administrative Note</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Annual exam 2026-27 progression"
                className="w-full text-xs rounded-lg border border-gray-300 p-2.5"
              />
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              Batch promotion completes current session enrollments and generates target session records.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            disabled={selectedIds.size === 0 || promoting}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Execute Batch Promotion ({selectedIds.size} Selected)
          </button>
        </div>
      </div>

      {/* Feedback message */}
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
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Eligible Students Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Users className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-semibold text-gray-900">
              Active Students Ready for Review
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              ({selectedIds.size} of {candidates.length} selected)
            </span>
            {candidates.length > 0 && (
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {countNE} Education
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {countNIC} Islamic Center
                </span>
              </div>
            )}
          </div>

          {candidates.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-medium text-emerald-800 hover:underline"
            >
              {selectedIds.size === candidates.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading eligible student candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No active students found</p>
            <p className="text-xs text-gray-400 mt-1">
              Select different source filters (academic year, campus, or class/course).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 uppercase tracking-wider border-b border-gray-200/80 font-semibold text-[11px]">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === candidates.length && candidates.length > 0}
                      onChange={toggleAll}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                  </th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Division</th>
                  <th className="p-4">Current Program</th>
                  <th className="p-4">Projected Target</th>
                  <th className="p-4">Campus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map((s) => {
                  const isSelected = selectedIds.has(s.studentId);
                  const isNic = s.isNic;

                  // Determine display target for this student
                  let displayTarget = s.projectedProgram || 'Next Level';
                  if (action === 'graduate') {
                    displayTarget = 'Graduated (Alumni)';
                  } else if (action === 'retain') {
                    displayTarget = `Retain (${s.currentProgram})`;
                  } else if (!isNic && targetClassObj) {
                    displayTarget = `Standard: ${getLocalizedName(targetClassObj.name)}`;
                  } else if (isNic && targetCourseObj) {
                    displayTarget = `Course: ${getLocalizedName(targetCourseObj.name)}`;
                  }

                  return (
                    <tr
                      key={s.enrollmentId || s.studentId}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStudent(s.studentId)}
                          className="rounded text-emerald-700 focus:ring-emerald-600"
                        />
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-900">
                        {s.studentCode}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {s.name}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isNic
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isNic ? <BookOpen className="w-3 h-3" /> : <School className="w-3 h-3" />}
                          {isNic ? 'Islamic Center' : 'Education'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-800">
                          {s.currentProgram}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100">
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                          {displayTarget}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {s.branchName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">
                Confirm Batch {action === 'promote' ? 'Promotion' : action === 'retain' ? 'Retention' : 'Graduation'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                You are about to process <strong className="text-gray-900">{selectedIds.size} student(s)</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-gray-500">From Session:</span>
                <span className="font-semibold text-gray-900">{fromYearObj?.name || 'All Sessions'}</span>
              </div>
              {action !== 'graduate' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Session:</span>
                  <span className="font-semibold text-emerald-800">{toYearObj?.name || 'Target Session'}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Action:</span>
                <span className="font-semibold capitalize text-gray-900">{action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cohorts to Process:</span>
                <span className="font-semibold text-gray-900">
                  {candidates.filter(c => selectedIds.has(c.studentId) && !c.isNic).length} Education,{' '}
                  {candidates.filter(c => selectedIds.has(c.studentId) && c.isNic).length} Islamic Center
                </span>
              </div>
              {action === 'promote' && (
                <div className="pt-2 border-t border-gray-200/80 space-y-1 text-[11px] text-gray-600">
                  <div>
                    <strong>NE Progression:</strong>{' '}
                    {targetClassObj ? `All to ${getLocalizedName(targetClassObj.name)}` : 'Standard auto-advancement (Class 1➔2, 2➔3...)'}
                  </div>
                  <div>
                    <strong>NIC Progression:</strong>{' '}
                    {targetCourseObj ? `All to ${getLocalizedName(targetCourseObj.name)}` : 'Sequential Islamic course level progression'}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={promoting}
                onClick={handleExecutePromotion}
                className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm flex items-center justify-center gap-1.5"
              >
                {promoting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

