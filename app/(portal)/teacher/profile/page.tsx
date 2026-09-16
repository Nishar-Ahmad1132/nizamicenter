'use client';

import { useState, useEffect } from 'react';
import {
  UserCircle, Mail, Phone,
  Edit3, Check, Loader2, GraduationCap, ShieldCheck, Building2, BookOpen
} from 'lucide-react';

interface TeacherProfile {
  _id: string;
  teacherId: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  gender?: string;
  qualification?: string;
  specialization?: string;
  bio?: string;
  photo?: string;
  address?: { line1?: string; city?: string; state?: string; pincode?: string };
  branchIds: { _id: string; name: string; shortName?: string }[];
  subjectIds: { _id: string; name: { en: string; hi?: string; ur?: string } | string; code?: string }[];
  courseIds: { _id: string; name: { en: string; hi?: string; ur?: string } | string }[];
  employmentType?: string;
  joiningDate?: string;
  isActive: boolean;
}

function getItemName(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item.name === 'string') return item.name;
  if (typeof item.name === 'object' && item.name) {
    return item.name.en || item.name.hi || item.name.ur || '';
  }
  return '';
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    phone: '',
    whatsapp: '',
    email: '',
    bio: '',
  });

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/profile');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setProfile(data.teacher);
      setForm({
        phone: data.teacher.phone || '',
        whatsapp: data.teacher.whatsapp || '',
        email: data.teacher.email || '',
        bio: data.teacher.bio || '',
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProfile(); }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/teacher/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSuccess('Profile updated successfully.');
      setEditing(false);
      await fetchProfile();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B6B3A]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm bg-white rounded-2xl border">
        {error || 'Profile not found.'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2.5 bg-[#1B6B3A] text-white text-xs font-bold rounded-xl hover:bg-[#14522c] transition flex items-center gap-2 shadow-sm"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setError(''); }}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#1B6B3A] text-white text-xs font-bold rounded-xl hover:bg-[#14522c] transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">{error}</div>}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Identity Card */}
      <div className="bg-gradient-to-br from-[#1B6B3A] to-[#0f4424] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-lg">
        <div className="shrink-0">
          {profile.photo ? (
            <img src={profile.photo} alt={profile.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
              <UserCircle className="w-12 h-12 text-white/70" />
            </div>
          )}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-extrabold">{profile.name}</h2>
          <p className="text-green-200 text-sm mt-0.5 font-medium">
            {profile.specialization || 'Faculty Member'}
          </p>
          <p className="text-xs text-green-300 mt-1 font-mono font-semibold tracking-wide">
            Account ID: {profile.teacherId || (profile.phone ? `teacher_${profile.phone.replace(/\D/g, '').slice(-6)}` : 'Faculty')}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
            {profile.branchIds.map((b) => (
              <span key={b._id} className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                📍 {b.shortName || getItemName(b)}
              </span>
            ))}
            {profile.employmentType && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold capitalize">
                {profile.employmentType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* View / Edit Contact Info */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#1B6B3A]" /> Contact Information
        </h3>
        {!editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <InfoRow icon={<Phone className="w-4 h-4 text-gray-400" />} label="Phone" value={profile.phone || '—'} />
            <InfoRow icon={<Phone className="w-4 h-4 text-gray-400" />} label="WhatsApp" value={profile.whatsapp || '—'} />
            <InfoRow icon={<Mail className="w-4 h-4 text-gray-400" />} label="Email" value={profile.email || '—'} />
            <InfoRow icon={<GraduationCap className="w-4 h-4 text-gray-400" />} label="Qualification" value={profile.qualification || '—'} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { label: 'Phone', key: 'phone' as const, type: 'tel' },
              { label: 'WhatsApp', key: 'whatsapp' as const, type: 'tel' },
              { label: 'Email', key: 'email' as const, type: 'email' },
            ] as { label: string; key: keyof typeof form; type: string }[]).map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bio */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#1B6B3A]" /> About / Bio
        </h3>
        {!editing ? (
          <p className="text-sm text-gray-600 leading-relaxed">
            {profile.bio || 'No bio added yet. Click Edit Profile to add one.'}
          </p>
        ) : (
          <textarea
            value={form.bio}
            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            rows={4}
            placeholder="Write a brief professional bio..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 resize-none"
          />
        )}
      </div>

      {/* Allocations (read-only) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1B6B3A]" /> Allocations (Set by Admin)
        </h3>
        <p className="text-xs text-gray-500">These are managed by the admin and cannot be edited here.</p>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Branches</p>
            <div className="flex flex-wrap gap-2">
              {profile.branchIds.length > 0 ? profile.branchIds.map((b) => (
                <span key={b._id} className="px-3 py-1.5 rounded-full bg-[#1B6B3A]/10 text-[#1B6B3A] text-xs font-semibold flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {getItemName(b)}
                </span>
              )) : <span className="text-xs text-gray-400">No branches assigned</span>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Subjects (NE Academic)</p>
            <div className="flex flex-wrap gap-2">
              {profile.subjectIds.length > 0 ? profile.subjectIds.map((s) => (
                <span key={s._id} className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-800 text-xs font-semibold flex items-center gap-1 border border-purple-100">
                  <BookOpen className="w-3 h-3" /> {getItemName(s) || s.code || 'Subject'}
                </span>
              )) : <span className="text-xs text-gray-400">No subjects assigned</span>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Courses (NIC Islamic)</p>
            <div className="flex flex-wrap gap-2">
              {profile.courseIds.length > 0 ? profile.courseIds.map((c) => (
                <span key={c._id} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1 border border-emerald-100">
                  <GraduationCap className="w-3 h-3" /> {getItemName(c)}
                </span>
              )) : <span className="text-xs text-gray-400">No courses assigned</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-900 break-all">{value}</p>
      </div>
    </div>
  );
}
