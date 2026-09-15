'use client';

import { useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2, Star, X, Check } from 'lucide-react';

interface Division { _id: string; name: { en: string }; code: string }
interface Course {
  _id: string;
  name: { en: string };
  slug: string;
  divisionId?: Division | null;
  fee?: number;
  status: string;
  featured: boolean;
  shortDescription?: { en?: string };
  duration?: string;
  displayOrder: number;
}

interface Props {
  initialCourses: Course[];
  divisions: Division[];
}

const EMPTY_FORM = {
  name_en: '', slug: '', divisionId: '', fee: '', duration: '',
  shortDescription_en: '', status: 'active', featured: false, displayOrder: 0,
};

export default function CoursesClient({ initialCourses, divisions }: Props) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  }

  function openEdit(c: Course) {
    setEditing(c);
    setForm({
      name_en: c.name?.en ?? '',
      slug: c.slug ?? '',
      divisionId: c.divisionId?._id ?? '',
      fee: c.fee != null ? String(c.fee) : '',
      duration: c.duration ?? '',
      shortDescription_en: c.shortDescription?.en ?? '',
      status: c.status ?? 'active',
      featured: c.featured ?? false,
      displayOrder: c.displayOrder ?? 0,
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name_en.trim() || !form.slug.trim() || !form.divisionId) {
      setError('Name, slug, and division are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        name: { en: form.name_en.trim() },
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        divisionId: form.divisionId,
        fee: form.fee ? Number(form.fee) : undefined,
        duration: form.duration || undefined,
        shortDescription: { en: form.shortDescription_en || undefined },
        status: form.status,
        featured: form.featured,
        displayOrder: Number(form.displayOrder),
      };

      if (editing) {
        const res = await fetch(`/api/admin/courses/${editing._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
        setCourses((prev) =>
          prev.map((c) => c._id === editing._id
            ? { ...c, ...body, divisionId: divisions.find(d => d._id === form.divisionId) ?? c.divisionId }
            : c)
        );
      } else {
        const res = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Create failed');
        const data = await res.json();
        const created = { ...data.course, divisionId: divisions.find(d => d._id === form.divisionId) };
        setCourses((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this course? It will be hidden from the site.')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleFeatured(c: Course) {
    const res = await fetch(`/api/admin/courses/${c._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !c.featured }),
    });
    if (res.ok) {
      setCourses((prev) => prev.map((x) => x._id === c._id ? { ...x, featured: !c.featured } : x));
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Course</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Division</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Fee</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Featured</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-dark">{c.name?.en}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {c.divisionId?.name?.en ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {c.fee ? `₹${c.fee.toLocaleString('en-IN')}/mo` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>{c.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleFeatured(c)} title="Toggle featured on homepage">
                    <Star className={`w-4 h-4 ${c.featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(c._id)} disabled={deletingId === c._id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition disabled:opacity-40" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div className="p-12 text-center text-gray-400">No courses yet. Click &ldquo;Add Course&rdquo; to create one.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-dark">{editing ? 'Edit Course' : 'Add Course'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Course Name (English) *</label>
                <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug * (e.g. nazra-quran)</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Division *</label>
                <select value={form.divisionId} onChange={e => setForm(f => ({ ...f, divisionId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">— Select Division —</option>
                  {divisions.map(d => <option key={d._id} value={d._id}>{d.name.en} ({d.code})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fee (₹/month)</label>
                  <input type="number" min="0" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                  <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. 6 months" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Short Description</label>
                <textarea value={form.shortDescription_en} onChange={e => setForm(f => ({ ...f, shortDescription_en: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
                  <input type="number" min="0" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                  className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700">Featured on homepage</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2">
                {saving ? 'Saving…' : <><Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Create Course'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
