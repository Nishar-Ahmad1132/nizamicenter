'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AddNoticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: { en: form.get('titleEn'), hi: form.get('titleHi') || undefined, ur: form.get('titleUr') || undefined },
          content: { en: form.get('contentEn'), hi: form.get('contentHi') || undefined, ur: form.get('contentUr') || undefined },
          category: form.get('category'),
          priority: form.get('priority'),
          status: form.get('status'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/admin/notices');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/notices" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Notices
      </Link>
      <h1 className="text-2xl font-bold text-dark mb-6">Create Notice</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (English) *</label>
            <input type="text" name="titleEn" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Hindi)</label>
              <input type="text" name="titleHi" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Urdu)</label>
              <input type="text" name="titleUr" dir="rtl" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (English)</label>
            <textarea name="contentEn" rows={5} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="event">Event</option>
                <option value="holiday">Holiday</option>
                <option value="fee">Fee</option>
                <option value="exam">Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
          {loading ? 'Publishing...' : 'Publish Notice'}
        </button>
      </form>
    </div>
  );
}
