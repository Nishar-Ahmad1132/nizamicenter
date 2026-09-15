'use client';

import { useState } from 'react';
import { GraduationCap, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Division { _id: string; name: { en: string }; code: string }
interface ClassItem {
  _id: string;
  name: { en: string };
  slug: string;
  numericValue?: number;
  divisionId?: Division | null;
  description?: string;
  fee?: number;
  status: string;
  displayOrder: number;
}

interface Props {
  initialClasses: ClassItem[];
  divisions: Division[];
}

const EMPTY_FORM = {
  name_en: '', slug: '', numericValue: '', divisionId: '',
  description: '', fee: '', status: 'active', displayOrder: 0,
};

export default function ClassesClient({ initialClasses, divisions }: Props) {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
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

  function openEdit(c: ClassItem) {
    setEditing(c);
    setForm({
      name_en: c.name?.en ?? '',
      slug: c.slug ?? '',
      numericValue: c.numericValue != null ? String(c.numericValue) : '',
      divisionId: c.divisionId?._id ?? '',
      description: c.description ?? '',
      fee: c.fee != null ? String(c.fee) : '',
      status: c.status ?? 'active',
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
        numericValue: form.numericValue ? Number(form.numericValue) : undefined,
        description: form.description || undefined,
        fee: form.fee !== '' ? Number(form.fee) : undefined,
        status: form.status,
        displayOrder: Number(form.displayOrder),
      };

      if (editing) {
        const res = await fetch(`/api/admin/classes/${editing._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
        setClasses((prev) =>
          prev.map((c) => c._id === editing._id
            ? { ...c, ...body, divisionId: divisions.find(d => d._id === form.divisionId) ?? c.divisionId }
            : c)
        );
      } else {
        const res = await fetch('/api/admin/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Create failed');
        const data = await res.json();
        const created = { ...data.class, divisionId: divisions.find(d => d._id === form.divisionId) };
        setClasses((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this class? Students in this class may be affected.')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/classes/${id}`, { method: 'DELETE' });
      setClasses((prev) => prev.filter((c) => c._id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  // Group by division for display
  const byDivision = divisions.map(div => ({
    division: div,
    classes: classes.filter(c => c.divisionId?._id === div._id),
  })).filter(g => g.classes.length > 0);

  const unassigned = classes.filter(c => !c.divisionId);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{classes.length} class{classes.length !== 1 ? 'es' : ''}</p>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      <div className="space-y-6">
        {byDivision.map(({ division, classes: divClasses }) => (
          <div key={division._id}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {division.name.en}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {divClasses.map((c) => (
                <div key={c._id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition group relative">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(c)} className="p-1 rounded-md hover:bg-blue-50 text-blue-500" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(c._id)} disabled={deletingId === c._id}
                      className="p-1 rounded-md hover:bg-red-50 text-red-500 disabled:opacity-40" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-dark">{c.name?.en}</h4>
                  {c.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                      c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{c.status}</span>
                    {c.fee != null && (
                      <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                        ₹{c.fee}/mo
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {unassigned.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Unassigned</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unassigned.map((c) => (
                <div key={c._id} className="bg-white rounded-xl border border-dashed border-gray-200 p-5 hover:shadow-sm transition group relative">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(c)} className="p-1 rounded-md hover:bg-blue-50 text-blue-500">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="p-1 rounded-md hover:bg-red-50 text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-semibold text-dark">{c.name?.en}</h4>
                  {c.fee != null && (
                    <span className="mt-2 inline-block text-xs font-bold text-primary">₹{c.fee}/mo</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {classes.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            No classes yet. Click &ldquo;Add Class&rdquo; to create one.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-dark">{editing ? 'Edit Class' : 'Add Class'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class Name * (e.g. Class 1)</label>
                <input value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono" placeholder="class-1" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Numeric Value</label>
                  <input type="number" value={form.numericValue} onChange={e => setForm(f => ({ ...f, numericValue: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="1" />
                </div>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Fee (₹)</label>
                  <input type="number" min="0" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. 500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
                  <input type="number" min="0" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Brief details about subjects taught" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2">
                {saving ? 'Saving…' : <><Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Create Class'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
