'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, BookOpen, Layers } from 'lucide-react';

interface Division {
  _id: string;
  name: { en: string };
  code: string;
}

interface ClassItem {
  _id: string;
  name: { en: string };
  numericValue?: number;
  divisionId?: string | { _id: string };
}

interface SubjectItem {
  _id: string;
  name: { en: string; hi?: string; ur?: string };
  code?: string;
  divisionId?: Division | null;
  classIds?: Array<{ _id: string; name?: { en?: string }; numericValue?: number }>;
  description?: string;
  icon?: string;
  status: 'active' | 'inactive';
  isActive?: boolean;
}

interface Props {
  initialSubjects: SubjectItem[];
  divisions: Division[];
  classes: ClassItem[];
}

const EMPTY_FORM = {
  name_en: '',
  code: '',
  divisionId: '',
  classIds: [] as string[],
  description: '',
  status: 'active' as 'active' | 'inactive',
};

export default function SubjectsClient({ initialSubjects, divisions, classes }: Props) {
  const [subjects, setSubjects] = useState<SubjectItem[]>(initialSubjects);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SubjectItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>('all');

  function openAdd() {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      divisionId: divisions[0]?._id || '',
    });
    setError('');
    setShowModal(true);
  }

  function openEdit(sub: SubjectItem) {
    setEditing(sub);
    const existingClassIds = sub.classIds?.map((c) => (typeof c === 'string' ? c : c._id)) || [];
    setForm({
      name_en: sub.name?.en || '',
      code: sub.code || '',
      divisionId: sub.divisionId?._id || divisions[0]?._id || '',
      classIds: existingClassIds,
      description: sub.description || '',
      status: sub.status || 'active',
    });
    setError('');
    setShowModal(true);
  }

  function toggleClass(classId: string) {
    setForm((f) => {
      const exists = f.classIds.includes(classId);
      return {
        ...f,
        classIds: exists ? f.classIds.filter((id) => id !== classId) : [...f.classIds, classId],
      };
    });
  }

  function selectAllClasses() {
    setForm((f) => ({
      ...f,
      classIds: classes.map((c) => c._id),
    }));
  }

  function clearAllClasses() {
    setForm((f) => ({
      ...f,
      classIds: [],
    }));
  }

  async function handleSave() {
    if (!form.name_en.trim()) {
      setError('Subject name is required.');
      return;
    }
    if (!form.divisionId) {
      setError('Division is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const body = {
        name: { en: form.name_en.trim() },
        code: form.code.trim().toUpperCase() || undefined,
        divisionId: form.divisionId,
        classIds: form.classIds,
        description: form.description.trim() || undefined,
        status: form.status,
      };

      if (editing) {
        const res = await fetch(`/api/admin/subjects/${editing._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to update subject');
        }
        const data = await res.json();
        setSubjects((prev) =>
          prev.map((s) => (s._id === editing._id ? (data.subject || { ...s, ...body }) : s))
        );
      } else {
        const res = await fetch('/api/admin/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to create subject');
        }
        const data = await res.json();
        const createdSubject = data.subject || data;
        // Populate division and classes locally if needed
        const populated = {
          ...createdSubject,
          divisionId: divisions.find((d) => d._id === form.divisionId) || null,
          classIds: classes.filter((c) => form.classIds.includes(c._id)),
        };
        setSubjects((prev) => [populated, ...prev]);
      }

      setShowModal(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete/deactivate this subject?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete subject');
      setSubjects((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredSubjects = subjects.filter((sub) => {
    if (selectedDivFilter === 'all') return true;
    return sub.divisionId?._id === selectedDivFilter;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Subjects</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage all subjects taught across classes and divisions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {divisions.length > 1 && (
            <select
              value={selectedDivFilter}
              onChange={(e) => setSelectedDivFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Divisions</option>
              {divisions.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name.en} ({d.code})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubjects.map((sub) => {
          const divName = sub.divisionId?.name?.en || 'General';
          return (
            <div
              key={sub._id}
              className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition relative group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                  {sub.code || 'SUB'}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      sub.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {sub.status}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                    <button
                      onClick={() => openEdit(sub)}
                      className="p-1 rounded-md hover:bg-blue-50 text-blue-600"
                      title="Edit Subject"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub._id)}
                      disabled={deletingId === sub._id}
                      className="p-1 rounded-md hover:bg-red-50 text-red-500 disabled:opacity-40"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 text-base">{sub.name?.en}</h3>
              <p className="text-xs text-gray-500 mt-1">Division: {divName}</p>

              {sub.description && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{sub.description}</p>
              )}

              {sub.classIds && sub.classIds.length > 0 ? (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                    Taught in Classes ({sub.classIds.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {sub.classIds.map((c: any) => (
                      <span
                        key={c._id || c}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                      >
                        {c.name?.en || c.name || `Class ${c.numericValue || ''}`}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 italic">
                  No classes assigned yet
                </div>
              )}
            </div>
          );
        })}

        {filteredSubjects.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            No subjects found. Click &ldquo;Add Subject&rdquo; to create your first subject.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto grow">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Subject Name * (e.g. Mathematics, English, Urdu)
                  </label>
                  <input
                    type="text"
                    value={form.name_en}
                    onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Subject name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Code (e.g. MATH)
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                    placeholder="MATH"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Division *</label>
                  <select
                    value={form.divisionId}
                    onChange={(e) => setForm((f) => ({ ...f, divisionId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">— Select Division —</option>
                    {divisions.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name.en} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Course outline, syllabus or topics covered..."
                />
              </div>

              {/* Class multi-select */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Applicable Classes ({form.classIds.length} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllClasses}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={clearAllClasses}
                      className="text-[11px] text-gray-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50/50">
                  {classes.map((cls) => {
                    const isSelected = form.classIds.includes(cls._id);
                    return (
                      <button
                        key={cls._id}
                        type="button"
                        onClick={() => toggleClass(cls._id)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-primary text-white border-primary font-semibold'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="truncate">{cls.name?.en || `Class ${cls.numericValue}`}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  'Saving…'
                ) : (
                  <>
                    <Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Create Subject'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
