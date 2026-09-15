'use client';

import { useState } from 'react';
import { Building2, Plus, Pencil, Trash2, MapPin, Phone, X, Check, Globe } from 'lucide-react';

interface Branch {
  _id: string;
  name: string;
  slug: string;
  address: string;
  area?: string;
  city?: string;
  state?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  description?: { en?: string };
  isActive: boolean;
  displayOrder: number;
}

const EMPTY_FORM = {
  name: '', slug: '', address: '', area: '', city: '', state: '', pincode: '',
  phone: '', whatsapp: '', email: '', description_en: '',
  isActive: true, displayOrder: 0,
};

export default function BranchesClient({ initialBranches }: { initialBranches: Branch[] }) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
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

  function openEdit(b: Branch) {
    setEditing(b);
    setForm({
      name: b.name ?? '',
      slug: b.slug ?? '',
      address: b.address ?? '',
      area: b.area ?? '',
      city: b.city ?? '',
      state: b.state ?? '',
      pincode: '',
      phone: b.phone ?? '',
      whatsapp: b.whatsapp ?? '',
      email: b.email ?? '',
      description_en: b.description?.en ?? '',
      isActive: b.isActive ?? true,
      displayOrder: b.displayOrder ?? 0,
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim() || !form.address.trim() || !form.phone.trim()) {
      setError('Name, slug, address, and phone are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        address: form.address.trim(),
        area: form.area || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp || undefined,
        email: form.email || undefined,
        description: { en: form.description_en || undefined },
        isActive: form.isActive,
        displayOrder: Number(form.displayOrder),
      };

      if (editing) {
        const res = await fetch(`/api/admin/branches/${editing._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
        setBranches((prev) => prev.map((b) => b._id === editing._id ? { ...b, ...body } : b));
      } else {
        const res = await fetch('/api/admin/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Create failed');
        const data = await res.json();
        setBranches((prev) => [...prev, data.branch]);
      }
      setShowModal(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deactivate branch "${name}"? It will be hidden from the website.`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/branches/${id}`, { method: 'DELETE' });
      setBranches((prev) => prev.filter((b) => b._id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(b: Branch) {
    const res = await fetch(`/api/admin/branches/${b._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    if (res.ok) {
      setBranches((prev) => prev.map((x) => x._id === b._id ? { ...x, isActive: !b.isActive } : x));
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {branches.length} branch{branches.length !== 1 ? 'es' : ''} &mdash;{' '}
          <span className="text-green-700 font-medium">{branches.filter(b => b.isActive).length} active</span>
        </p>
        <button onClick={openAdd} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((b) => (
          <div key={b._id} className={`bg-white rounded-xl border p-5 hover:shadow-md transition group ${b.isActive ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-70'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(b._id, b.name)} disabled={deletingId === b._id}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-40" title="Delete/Deactivate">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-dark">{b.name}</h3>
            {b.area && <p className="text-xs text-primary font-medium mt-0.5">{b.area}</p>}

            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500 flex items-start gap-1">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {b.address}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3 shrink-0" /> {b.phone}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => toggleActive(b)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
                  b.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                <Globe className="w-3 h-3" /> {b.isActive ? 'Active' : 'Inactive'}
              </button>
              <span className="text-[10px] text-gray-400">Order: {b.displayOrder}</span>
            </div>
          </div>
        ))}
        {branches.length === 0 && (
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            No branches yet. Click &ldquo;Add Branch&rdquo; to create one.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-dark">{editing ? 'Edit Branch' : 'Add Branch'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Branch Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. Kokan Nagar Branch (Near Quba Masjid)" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug * (URL identifier)</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="baneli-quba-masjid" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Address *</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Habeeb Ansari Chawl, Near Quba Masjid, Kokan Nagar…" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Area</label>
                  <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Kokan Nagar" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Titwala" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="8779282185" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp</label>
                  <input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="918779282185" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description (shown on homepage)</label>
                <textarea value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-gray-700">Active (visible on site)</span>
                </label>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
                  <input type="number" min="0" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2">
                {saving ? 'Saving…' : <><Check className="w-4 h-4" /> {editing ? 'Save Changes' : 'Add Branch'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
