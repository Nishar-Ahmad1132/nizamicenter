'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Copy } from 'lucide-react';

export default function AddTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<{ username: string; temporaryPassword: string } | null>(null);
  const [copied, setCopied] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get('name'),
      phone: form.get('phone'),
      email: form.get('email') || undefined,
      qualification: form.get('qualification') || undefined,
      experience: form.get('experience') || undefined,
      bio: form.get('bio') || undefined,
    };
    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Failed');
      setCredentials(result.credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  }

  if (credentials) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-dark mb-2">Teacher Created!</h2>
          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Username</p><p className="font-mono font-semibold">{credentials.username}</p></div>
              <button onClick={() => copy(credentials.username, 'u')} className="p-2 hover:bg-gray-200 rounded-lg">
                {copied === 'u' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Password</p><p className="font-mono font-semibold">{credentials.temporaryPassword}</p></div>
              <button onClick={() => copy(credentials.temporaryPassword, 'p')} className="p-2 hover:bg-gray-200 rounded-lg">
                {copied === 'p' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <button onClick={() => router.push('/admin/teachers')} className="px-6 py-2 bg-primary text-white rounded-lg text-sm">Go to Teachers</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/teachers" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Teachers
      </Link>
      <h1 className="text-2xl font-bold text-dark mb-6">Add New Teacher</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" name="name" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="tel" name="phone" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input type="text" name="qualification" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <input type="text" name="experience" placeholder="e.g., 5 years" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea name="bio" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Teacher & Generate Credentials'}
          </button>
          <Link href="/admin/teachers" className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
