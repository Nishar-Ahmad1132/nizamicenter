'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Globe, GlobeOff, Pencil, Trash2, X, Check, Plus } from 'lucide-react';

interface Branch { _id: string; name: string }
interface Subject { _id: string; name: { en: string } }
interface Teacher {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  qualification?: string;
  experience?: string;
  bio?: string;
  status: string;
  isPublic: boolean;
  branchIds?: Branch[];
  subjectIds?: Subject[];
}

interface Props {
  initialTeachers: Teacher[];
  branches: Branch[];
  subjects: Subject[];
}

const EMPTY_FORM = {
  name: '', phone: '', email: '', qualification: '', experience: '', bio: '',
  status: 'active', isPublic: true,
};

export default function TeachersClient({ initialTeachers, branches, subjects }: Props) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState('');

  function openEdit(t: Teacher) {
    setEditing(t);
    setForm({
      name: t.name ?? '',
      phone: t.phone ?? '',
      email: t.email ?? '',
      qualification: t.qualification ?? '',
      experience: t.experience ?? '',
      bio: t.bio ?? '',
      status: t.status ?? 'active',
      isPublic: t.isPublic ?? true,
    });
    setError('');
    setShowModal(true);
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email || undefined,
        qualification: form.qualification || undefined,
        experience: form.experience || undefined,
        bio: form.bio || undefined,
        status: form.status,
        isPublic: form.isPublic,
      };

      if (editing) {
        const res = await fetch(`/api/admin/teachers/${editing._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
        setTeachers((prev) =>
          prev.map((t) => t._id === editing._id ? { ...t, ...body } : t)
        );
      } else {
        // Create new teacher via POST
        const res = await fetch('/api/admin/teachers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Create failed');
        const data = await res.json();
        setTeachers((prev) => [...prev, data.teacher]);
      }
      setShowModal(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove teacher "${name}" from the system?`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function togglePublic(id: string, current: boolean) {
    setToggling(id);
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !current }),
      });
      if (res.ok) {
        setTeachers((prev) =>
          prev.map((t) => (t._id === id ? { ...t, isPublic: !current } : t))
        );
      }
    } finally {
      setToggling(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} &mdash;{' '}
          <span className="text-green-700 font-medium">
            {teachers.filter(t => t.isPublic).length} visible on homepage
          </span>
        </p>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 mb-4">
        <strong>Homepage Visibility:</strong> Toggle &ldquo;Visible/Hidden&rdquo; to control which teachers appear in the <em>Our Faculty &amp; Teachers</em> section on the public site.
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {teachers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No teachers yet. Click &ldquo;Add Teacher&rdquo;.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Qualification</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Branches</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Subjects</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Homepage</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-dark">{t.name}</td>
                    <td className="px-4 py-3 text-gray-600">{t.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{t.qualification ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {t.branchIds?.map((b) => b.name).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {t.subjectIds?.map((s) => s.name?.en).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        t.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublic(t._id, t.isPublic)}
                        disabled={toggling === t._id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
                          t.isPublic
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        {t.isPublic ? <><Globe className="w-3 h-3" /> Visible</> : <><GlobeOff className="w-3 h-3" /> Hidden</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <Link href={`/admin/teachers/${t._id}`} className="text-primary hover:underline text-xs">View</Link>
                        <button onClick={() => handleDelete(t._id, t.name)} disabled={deletingId === t._id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition disabled:opacity-40" title="Remove">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-dark">{editing ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qualification</label>
                  <input value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. Alim & Hafiz, B.Ed" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Experience</label>
                  <input value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. 5 years" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Short Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-5">
                  <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
                    className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-gray-700">Visible on homepage</span>
                </label>
              </div>

              {!editing && (
                <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                  A user account will be auto-created. You can assign branches &amp; subjects from the teacher profile page after creation.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2">
                {saving ? 'Saving…' : <><Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Create Teacher'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
