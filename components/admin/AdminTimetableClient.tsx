'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock, Plus, Pencil, Trash2, X, Check, AlertTriangle,
  Building2, User, BookOpen, GraduationCap, Calendar, Loader2
} from 'lucide-react';

interface DivisionOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  code: string;
  slug: string;
}

interface BranchOption {
  _id: string;
  name: string;
}

interface ClassOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  divisionId?: string;
}

interface CourseOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  divisionId?: string;
}

interface SubjectOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  divisionId?: string;
}

interface TeacherOption {
  _id: string;
  name: string;
  title?: string;
  phone?: string;
}

export interface TimetableSlot {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  status: string;
  branchId?: { _id: string; name: string };
  divisionId?: { _id: string; name: { en: string }; code: string; slug: string };
  classId?: { _id: string; name: { en: string } | string };
  courseId?: { _id: string; name: { en: string } | string };
  subjectId?: { _id: string; name: { en: string } | string };
  teacherId?: { _id: string; name: string; title?: string };
}

function getLocalizedName(val: unknown): string {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'en' in (val as Record<string, unknown>)) {
    return String((val as Record<string, unknown>).en || '—');
  }
  return '—';
}

export default function AdminTimetableClient({
  initialSlots,
  divisions,
  branches,
  classes,
  courses,
  subjects,
  teachers,
  currentAcademicYearId,
}: {
  initialSlots: TimetableSlot[];
  divisions: DivisionOption[];
  branches: BranchOption[];
  classes: ClassOption[];
  courses: CourseOption[];
  subjects: SubjectOption[];
  teachers: TeacherOption[];
  currentAcademicYearId: string;
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<TimetableSlot[]>(initialSlots);

  // Filters
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<TimetableSlot | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [formDivisionId, setFormDivisionId] = useState<string>(divisions[0]?._id || '');
  const [formBranchId, setFormBranchId] = useState<string>(branches[0]?._id || '');
  const [formDay, setFormDay] = useState<string>('monday');
  const [formStartTime, setFormStartTime] = useState<string>('07:30 AM');
  const [formEndTime, setFormEndTime] = useState<string>('09:30 AM');
  const [formCourseId, setFormCourseId] = useState<string>('');
  const [formClassId, setFormClassId] = useState<string>('');
  const [formSubjectId, setFormSubjectId] = useState<string>('');
  const [formTeacherId, setFormTeacherId] = useState<string>(teachers[0]?._id || '');
  const [formRoom, setFormRoom] = useState<string>('Hall 1');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Check if current division is Islamic Center vs Academic
  const selectedDivision = useMemo(() => {
    return divisions.find((d) => d._id === formDivisionId);
  }, [divisions, formDivisionId]);

  const isIslamicCenter = useMemo(() => {
    if (!selectedDivision) return true;
    const name = getLocalizedName(selectedDivision.name).toLowerCase();
    return name.includes('islamic') || selectedDivision.code === 'NIC';
  }, [selectedDivision]);

  // Filtered slots according to header filters
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      if (selectedDivisionId !== 'all' && slot.divisionId?._id !== selectedDivisionId) return false;
      if (selectedBranchId !== 'all' && slot.branchId?._id !== selectedBranchId) return false;
      if (selectedDay !== 'all' && slot.day.toLowerCase() !== selectedDay.toLowerCase()) return false;
      return true;
    });
  }, [slots, selectedDivisionId, selectedBranchId, selectedDay]);

  function openAddModal() {
    setEditingSlotId(null);
    setFormDivisionId(divisions[0]?._id || '');
    setFormBranchId(branches[0]?._id || '');
    setFormDay('monday');
    setFormStartTime('07:30 AM');
    setFormEndTime('09:30 AM');
    setFormCourseId(courses[0]?._id || '');
    setFormClassId(classes[0]?._id || '');
    setFormSubjectId(subjects[0]?._id || '');
    setFormTeacherId(teachers[0]?._id || '');
    setFormRoom('Hall 1');
    setFormStatus('active');
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  }

  function openEditModal(slot: TimetableSlot) {
    setEditingSlotId(slot._id);
    setFormDivisionId(slot.divisionId?._id || divisions[0]?._id || '');
    setFormBranchId(slot.branchId?._id || branches[0]?._id || '');
    setFormDay(slot.day);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormCourseId(slot.courseId?._id || '');
    setFormClassId(slot.classId?._id || '');
    setFormSubjectId(slot.subjectId?._id || '');
    setFormTeacherId(slot.teacherId?._id || teachers[0]?._id || '');
    setFormRoom(slot.room || '');
    setFormStatus((slot.status as 'active' | 'inactive') || 'active');
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  }

  function openDeleteConfirm(slot: TimetableSlot) {
    setSlotToDelete(slot);
    setError('');
    setIsDeleteModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        divisionId: formDivisionId,
        branchId: formBranchId,
        day: formDay.toLowerCase(),
        startTime: formStartTime,
        endTime: formEndTime,
        courseId: isIslamicCenter ? formCourseId || undefined : undefined,
        classId: !isIslamicCenter ? formClassId || undefined : undefined,
        subjectId: !isIslamicCenter ? formSubjectId || undefined : undefined,
        teacherId: formTeacherId,
        room: formRoom || undefined,
        status: formStatus,
        academicYearId: currentAcademicYearId,
      };

      if (editingSlotId) {
        // Update
        const res = await fetch(`/api/admin/timetable/${editingSlotId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update timetable slot');

        setSlots((prev) => prev.map((s) => (s._id === editingSlotId ? data.slot : s)));
        setSuccess('Timetable slot updated successfully!');
      } else {
        // Create
        const res = await fetch('/api/admin/timetable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create timetable slot');

        setSlots((prev) => [data.slot, ...prev]);
        setSuccess('Timetable slot added successfully!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess('');
        router.refresh();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving timetable slot');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!slotToDelete) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/timetable/${slotToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete timetable slot');

      setSlots((prev) => prev.filter((s) => s._id !== slotToDelete._id));
      setIsDeleteModalOpen(false);
      setSlotToDelete(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting timetable slot');
    } finally {
      setLoading(false);
    }
  }

  // Quick preset helper
  function applyPreset(start: string, end: string) {
    setFormStartTime(start);
    setFormEndTime(end);
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Add Slot Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class & Course Timetable</h1>
          <p className="text-xs text-gray-500 mt-1">
            Dynamic scheduling for Nizami Islamic Center & Nizami Education across all campuses
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Timetable Slot
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        {/* Education Division Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 mr-2 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-700" /> Education:
          </span>
          <button
            type="button"
            onClick={() => setSelectedDivisionId('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${
              selectedDivisionId === 'all'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Divisions
          </button>
          {divisions.map((div) => (
            <button
              key={div._id}
              type="button"
              onClick={() => setSelectedDivisionId(div._id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${
                selectedDivisionId === div._id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getLocalizedName(div.name)} ({div.code})
            </button>
          ))}
        </div>

        {/* Branch Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 mr-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-gray-400" /> Campus / Branch:
          </span>
          <button
            type="button"
            onClick={() => setSelectedBranchId('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${
              selectedBranchId === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Branches
          </button>
          {branches.map((b) => (
            <button
              key={b._id}
              type="button"
              onClick={() => setSelectedBranchId(b._id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${
                selectedBranchId === b._id
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* Day Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-gray-100 pb-1">
          <span className="text-xs font-semibold text-gray-500 mr-2 shrink-0 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" /> Day:
          </span>
          <button
            type="button"
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition ${
              selectedDay === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Days
          </button>
          {days.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition ${
                selectedDay === d
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Slots Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {filteredSlots.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No timetable sessions found</p>
            <p className="text-xs text-gray-400 mt-1">
              Click &quot;+ Add Timetable Slot&quot; above to create sessions for this division, campus, or day.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-xl hover:bg-emerald-900 transition"
            >
              + Create First Schedule Slot
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 uppercase tracking-wider border-b border-gray-200/80 font-medium">
                  <th className="p-4">Day & Timing</th>
                  <th className="p-4">Track / Subject</th>
                  <th className="p-4">Division</th>
                  <th className="p-4">Faculty Instructor</th>
                  <th className="p-4">Campus & Room</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSlots.map((s) => {
                  const subjectOrCourse =
                    getLocalizedName(s.courseId?.name) !== '—'
                      ? getLocalizedName(s.courseId?.name)
                      : getLocalizedName(s.subjectId?.name) !== '—'
                      ? `${getLocalizedName(s.subjectId?.name)} (${getLocalizedName(s.classId?.name)})`
                      : getLocalizedName(s.classId?.name);

                  const isNic = s.divisionId?.code === 'NIC';

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-xs capitalize text-gray-900">{s.day}</div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{s.startTime} – {s.endTime}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-gray-900 text-xs">{subjectOrCourse}</div>
                        {s.classId && isNic === false && (
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Standard: {getLocalizedName(s.classId?.name)}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${
                            isNic
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isNic ? 'Islamic Center' : 'Nizami Education'}
                        </span>
                      </td>

                      <td className="p-4 text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium">{s.teacherId?.name || 'Assigned Faculty'}</span>
                        </div>
                      </td>

                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{s.branchId?.name || 'All Campuses'}</span>
                        </div>
                        {s.room && (
                          <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">
                            Room: {s.room}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${
                            s.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit Slot"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteConfirm(s)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Timetable Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-xl my-8 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingSlotId ? 'Edit Timetable Slot' : 'Add New Timetable Slot'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Assign days, timings, faculty, and rooms for Islamic Center or Education Center
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{success}</span>
                </div>
              )}

              {/* Division & Campus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Education Division *
                  </label>
                  <select
                    value={formDivisionId}
                    onChange={(e) => setFormDivisionId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                    required
                  >
                    {divisions.map((d) => (
                      <option key={d._id} value={d._id}>
                        {getLocalizedName(d.name)} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Campus / Branch *
                  </label>
                  <select
                    value={formBranchId}
                    onChange={(e) => setFormBranchId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                    required
                  >
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Course / Subject Selection based on Division */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                  {isIslamicCenter ? '🕌 Islamic Center Track' : '📚 Education Center Class & Subject'}
                </span>

                {isIslamicCenter ? (
                  <div>
                    <label className="block text-gray-600 mb-1">Select Islamic Course / Program *</label>
                    <select
                      value={formCourseId}
                      onChange={(e) => setFormCourseId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                      required={isIslamicCenter}
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {getLocalizedName(c.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 mb-1">Standard / Class *</label>
                      <select
                        value={formClassId}
                        onChange={(e) => setFormClassId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                        required={!isIslamicCenter}
                      >
                        <option value="">-- Choose Class --</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {getLocalizedName(cls.name)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1">Academic Subject *</label>
                      <select
                        value={formSubjectId}
                        onChange={(e) => setFormSubjectId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                        required={!isIslamicCenter}
                      >
                        <option value="">-- Choose Subject --</option>
                        {subjects.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {getLocalizedName(sub.name)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Teacher / Instructor */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Assigned Faculty / Teacher *
                </label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                  required
                >
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} {t.title ? `(${t.title})` : ''} {t.phone ? `• ${t.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Day of Week *</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white capitalize"
                    required
                  >
                    {days.map((d) => (
                      <option key={d} value={d} className="capitalize">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    placeholder="e.g. 07:30 AM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Time *</label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="e.g. 09:30 AM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Quick timing presets */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-gray-400 mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('07:30 AM', '09:30 AM')}
                  className="px-2 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                  Morning (7:30–9:30 AM)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('10:00 AM', '11:30 AM')}
                  className="px-2 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                  Midday (10:00–11:30 AM)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('04:30 PM', '05:45 PM')}
                  className="px-2 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                  Afternoon (4:30–5:45 PM)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('06:00 PM', '07:15 PM')}
                  className="px-2 py-0.5 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                  Evening (6:00–7:15 PM)
                </button>
              </div>

              {/* Room & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Room / Hall / Lab</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="e.g. Hall 1, Room 204, Main Mosque"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white"
                  >
                    <option value="active">Active (Visible to Students)</option>
                    <option value="inactive">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {editingSlotId ? 'Save Changes' : 'Create Schedule Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && slotToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">Remove Timetable Slot?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to remove the <strong className="text-gray-900 capitalize">{slotToDelete.day} ({slotToDelete.startTime} - {slotToDelete.endTime})</strong> session?
                This session will no longer appear on students’ portals.
              </p>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDelete}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Yes, Delete Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
