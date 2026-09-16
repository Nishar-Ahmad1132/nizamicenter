'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Pencil, Trash2, Globe, GlobeOff, Phone, Mail,
  GraduationCap, Briefcase, Building2, BookOpen, Clock,
  Calendar, Check, X, User, AlertTriangle, Key, Copy,
  RefreshCw, CheckCircle2, ShieldCheck, Lock
} from 'lucide-react';

interface Branch {
  _id: string;
  name: string;
  address?: string;
}

interface Subject {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  code?: string;
}

interface Course {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  category?: string;
  duration?: string;
  fee?: number;
}

interface TimetableSlot {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  branchId?: { name?: string };
  subjectId?: { name?: { en?: string } | string };
  courseId?: { name?: { en?: string } | string };
  classId?: { name?: { en?: string } | string };
}

interface TeacherData {
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
  courseIds?: Course[];
  userId?: {
    _id: string;
    username: string;
    email?: string;
    role: string;
    isActive: boolean;
  };
  createdAt?: string;
}

interface Props {
  initialTeacher: TeacherData;
  branches: Branch[];
  subjects: Subject[];
  courses: Course[];
  timetableSlots: TimetableSlot[];
}

function getItemName(item: { name?: { en?: string; hi?: string; ur?: string } | string } | string | undefined | null): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item.name === 'string') return item.name;
  if (typeof item.name === 'object' && item.name) {
    return item.name.en || item.name.hi || item.name.ur || '';
  }
  return '';
}

export default function TeacherProfileClient({
  initialTeacher,
  branches = [],
  subjects = [],
  courses = [],
  timetableSlots = [],
}: Props) {
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherData>(initialTeacher);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Login credentials state
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [resettingCreds, setResettingCreds] = useState(false);
  const [credsData, setCredsData] = useState<{
    user: { username: string; email?: string; role: string; isActive: boolean; lastLogin?: string } | null;
    expectedUsername: string;
    generatedCredentials?: { username: string; temporaryPassword: string };
  } | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [credsSuccess, setCredsSuccess] = useState('');

  async function openCredsModal() {
    setShowCredsModal(true);
    setLoadingCreds(true);
    setCredsSuccess('');
    try {
      const res = await fetch(`/api/admin/teachers/${teacher._id}/reset-credentials`);
      const data = await res.json();
      if (res.ok) {
        setCredsData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCreds(false);
    }
  }

  async function handleResetCredentials(isCustom = false) {
    setResettingCreds(true);
    setCredsSuccess('');
    try {
      const body = isCustom && customPassword ? { newPassword: customPassword } : {};
      const res = await fetch(`/api/admin/teachers/${teacher._id}/reset-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate credentials');
      setCredsData((prev) => ({
        user: {
          username: data.credentials.username,
          email: data.credentials.email,
          role: 'teacher',
          isActive: true,
        },
        expectedUsername: data.credentials.username,
        generatedCredentials: data.credentials,
      }));
      setCredsSuccess('Credentials generated successfully!');
      setCustomPassword('');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setResettingCreds(false);
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  }

  const [form, setForm] = useState({
    name: teacher.name || '',
    phone: teacher.phone || '',
    email: teacher.email || '',
    qualification: teacher.qualification || '',
    experience: teacher.experience || '',
    bio: teacher.bio || '',
    status: teacher.status || 'active',
    isPublic: teacher.isPublic ?? true,
    branchIds: (teacher.branchIds || []).map((b) => b._id),
    subjectIds: (teacher.subjectIds || []).map((s) => s._id),
    courseIds: (teacher.courseIds || []).map((c) => c._id),
  });

  function openEdit() {
    setForm({
      name: teacher.name || '',
      phone: teacher.phone || '',
      email: teacher.email || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      bio: teacher.bio || '',
      status: teacher.status || 'active',
      isPublic: teacher.isPublic ?? true,
      branchIds: (teacher.branchIds || []).map((b) => b._id),
      subjectIds: (teacher.subjectIds || []).map((s) => s._id),
      courseIds: (teacher.courseIds || []).map((c) => c._id),
    });
    setError('');
    setShowEditModal(true);
  }

  function toggleBranch(id: string) {
    setForm((f) => ({
      ...f,
      branchIds: f.branchIds.includes(id) ? f.branchIds.filter((x) => x !== id) : [...f.branchIds, id],
    }));
  }

  function toggleSubject(id: string) {
    setForm((f) => ({
      ...f,
      subjectIds: f.subjectIds.includes(id) ? f.subjectIds.filter((x) => x !== id) : [...f.subjectIds, id],
    }));
  }

  function toggleCourse(id: string) {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(id) ? f.courseIds.filter((x) => x !== id) : [...f.courseIds, id],
    }));
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
        branchIds: form.branchIds,
        subjectIds: form.subjectIds,
        courseIds: form.courseIds,
      };

      const res = await fetch(`/api/admin/teachers/${teacher._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setTeacher(data.teacher);
      setShowEditModal(false);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to remove teacher "${teacher.name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/teachers/${teacher._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/admin/teachers');
    } catch (e) {
      alert((e as Error).message);
      setDeleting(false);
    }
  }

  async function togglePublic() {
    try {
      const res = await fetch(`/api/admin/teachers/${teacher._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !teacher.isPublic }),
      });
      if (res.ok) {
        setTeacher((prev) => ({ ...prev, isPublic: !prev.isPublic }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/teachers"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Teachers
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={openCredsModal}
            className="px-3.5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
            title="View or Reset Teacher Portal Login Credentials"
          >
            <Key className="w-4 h-4" /> Login Credentials
          </button>
          <button
            onClick={openEdit}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2 shadow-sm"
          >
            <Pencil className="w-4 h-4" /> Edit Profile &amp; Classes
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 border border-gray-200 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
            title="Delete Teacher"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
              {teacher.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-dark">{teacher.name}</h1>
                <span
                  className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    teacher.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {teacher.status.toUpperCase()}
                </span>
                <button
                  onClick={togglePublic}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full transition ${
                    teacher.isPublic
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Click to toggle homepage visibility"
                >
                  {teacher.isPublic ? <Globe className="w-3.5 h-3.5" /> : <GlobeOff className="w-3.5 h-3.5" />}
                  {teacher.isPublic ? 'Public Faculty' : 'Hidden from Faculty'}
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                {teacher.qualification || 'No qualification specified'}
                {teacher.experience && (
                  <>
                    <span className="text-gray-300">&bull;</span>
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    {teacher.experience}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
            <a
              href={`tel:${teacher.phone}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span>{teacher.phone}</span>
            </a>
            {teacher.email && (
              <a
                href={`mailto:${teacher.email}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <Mail className="w-4 h-4 text-primary" />
                <span>{teacher.email}</span>
              </a>
            )}
          </div>
        </div>

        {teacher.bio && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Biography</p>
            <p className="text-sm text-gray-700 leading-relaxed">{teacher.bio}</p>
          </div>
        )}
      </div>

      {/* Grid: Assigned Branches, Academic Subjects & Islamic Courses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Branches */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-dark">Assigned Branches</h2>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
              {teacher.branchIds?.length || 0}
            </span>
          </div>

          {teacher.branchIds && teacher.branchIds.length > 0 ? (
            <ul className="space-y-2.5">
              {teacher.branchIds.map((b) => (
                <li key={b._id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <p className="font-semibold text-sm text-blue-950">{b.name}</p>
                  {b.address && <p className="text-xs text-gray-500 mt-0.5">{b.address}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">
              No branches assigned yet.
            </div>
          )}
        </div>

        {/* Academic Subjects (NE) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-dark">Academic Subjects (NE)</h2>
            </div>
            <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
              {teacher.subjectIds?.length || 0}
            </span>
          </div>

          {teacher.subjectIds && teacher.subjectIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {teacher.subjectIds.map((s) => (
                <div
                  key={s._id}
                  className="px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl text-xs font-semibold text-purple-800"
                >
                  {getItemName(s) || s.code}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">
              No academic subjects assigned yet.
            </div>
          )}
        </div>

        {/* Islamic Courses (NIC) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-dark">Islamic Courses (NIC)</h2>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
              {teacher.courseIds?.length || 0}
            </span>
          </div>

          {teacher.courseIds && teacher.courseIds.length > 0 ? (
            <ul className="space-y-2">
              {teacher.courseIds.map((c) => (
                <li key={c._id} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <p className="font-semibold text-sm text-emerald-950">{getItemName(c)}</p>
                  <div className="flex items-center gap-3 text-xs text-emerald-700 mt-1">
                    {c.duration && <span>⏱ {c.duration}</span>}
                    {c.category && <span>📂 {c.category}</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">
              No Islamic courses assigned yet.
            </div>
          )}
        </div>
      </div>

      {/* Account & Weekly Timetable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Account Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="font-bold text-dark">Login Account</h2>
          </div>

          {teacher.userId ? (
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Username</p>
                <p className="font-mono font-bold text-dark mt-0.5">{teacher.userId.username}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Account Role</p>
                <p className="font-medium text-dark capitalize mt-0.5">{teacher.userId.role}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Account Status</p>
                <p className="font-medium text-green-700 mt-0.5">
                  {teacher.userId.isActive ? 'Active & Ready' : 'Disabled'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No linked user portal account.</p>
          )}
        </div>

        {/* Schedule / Timetable */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-dark">Weekly Teaching Schedule</h2>
            </div>
            <Link
              href="/admin/timetable"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open Timetable Master &rarr;
            </Link>
          </div>

          {timetableSlots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500 font-semibold">
                    <th className="text-left pb-2">Day</th>
                    <th className="text-left pb-2">Timing</th>
                    <th className="text-left pb-2">Subject / Course</th>
                    <th className="text-left pb-2">Branch / Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {timetableSlots.map((slot) => (
                    <tr key={slot._id} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium capitalize text-dark">{slot.day}</td>
                      <td className="py-2.5 text-gray-600">
                        {slot.startTime} &ndash; {slot.endTime}
                      </td>
                      <td className="py-2.5">
                        <span className="font-medium text-dark">
                          {getItemName(slot.subjectId) || getItemName(slot.courseId) || '—'}
                        </span>
                        {slot.classId && (
                          <span className="text-xs text-gray-400 ml-2">
                            ({getItemName(slot.classId)})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-gray-600">
                        {slot.branchId?.name || '—'} {slot.room ? `(${slot.room})` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">
              No class schedule found for this teacher in the current timetable.
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-dark">Edit Teacher Profile &amp; Allocations</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qualification</label>
                  <input
                    value={form.qualification}
                    onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Experience</label>
                  <input
                    value={form.experience}
                    onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-gray-700">Visible on homepage</span>
                </label>
              </div>

              {/* Assign Branches */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Assign Branches <span className="text-gray-400 font-normal">({form.branchIds.length} selected)</span>
                  </label>
                  {form.branchIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, branchIds: [] }))}
                      className="text-[11px] text-gray-400 hover:text-red-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                  {branches.map((b) => {
                    const selected = form.branchIds.includes(b._id);
                    return (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => toggleBranch(b._id)}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-all ${
                          selected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}{b.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assign Academic Subjects (NE) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Assign Academic Subjects (NE) <span className="text-gray-400 font-normal">({form.subjectIds.length} selected)</span>
                  </label>
                  {form.subjectIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, subjectIds: [] }))}
                      className="text-[11px] text-gray-400 hover:text-red-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                  {subjects.map((s) => {
                    const selected = form.subjectIds.includes(s._id);
                    const sName = getItemName(s);
                    return (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => toggleSubject(s._id)}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-all ${
                          selected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}{sName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assign Islamic Courses (NIC) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Assign Islamic Courses (NIC) <span className="text-gray-400 font-normal">({form.courseIds.length} selected)</span>
                  </label>
                  {form.courseIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, courseIds: [] }))}
                      className="text-[11px] text-gray-400 hover:text-red-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                  {courses.map((c) => {
                    const selected = form.courseIds.includes(c._id);
                    const cName = getItemName(c);
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => toggleCourse(c._id)}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-all ${
                          selected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}{cName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  'Saving…'
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Credentials Modal */}
      {showCredsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-dark">Teacher Login Account</h3>
                  <p className="text-xs text-gray-500">Manage portal access credentials for {teacher.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCredsModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {loadingCreds ? (
                <div className="py-12 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  Loading account details...
                </div>
              ) : (
                <>
                  {credsSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {credsSuccess}
                    </div>
                  )}

                  {/* Account Summary */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-xs text-gray-500 font-medium">Login Username:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-800">
                          {credsData?.user?.username || credsData?.expectedUsername}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(credsData?.user?.username || credsData?.expectedUsername || '', 'u')}
                          className="p-1 hover:bg-gray-200 rounded transition"
                          title="Copy Username"
                        >
                          {copiedKey === 'u' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-xs text-gray-500 font-medium">Phone (can also be used to login):</span>
                      <span className="font-mono text-gray-700">{teacher.phone}</span>
                    </div>

                    {teacher.email && (
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">Email (can also be used to login):</span>
                        <span className="font-mono text-gray-700">{teacher.email}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Account Status:</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        credsData?.user ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {credsData?.user ? (credsData.user.isActive ? 'Active User' : 'Inactive') : 'Account Ready To Generate'}
                      </span>
                    </div>
                  </div>

                  {/* Generated Temporary Password Card */}
                  {credsData?.generatedCredentials && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950">
                      <p className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-emerald-700" /> New Temporary Credentials Generated:
                      </p>
                      <div className="space-y-1.5 font-mono text-xs bg-white/80 p-3 rounded-lg border border-emerald-200">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Portal URL:</span>
                          <span className="font-semibold text-emerald-800">/login</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Username:</span>
                          <span className="font-bold">{credsData.generatedCredentials.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Password:</span>
                          <span className="font-bold text-emerald-700">{credsData.generatedCredentials.temporaryPassword}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const text = `Nizami Islamic Center - Teacher Login\nPortal: ${window.location.origin}/login\nUsername: ${credsData?.generatedCredentials?.username}\nPassword: ${credsData?.generatedCredentials?.temporaryPassword}`;
                          copyText(text, 'all');
                        }}
                        className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        {copiedKey === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'all' ? 'Copied to Clipboard!' : 'Copy Complete Credentials'}
                      </button>
                    </div>
                  )}

                  {/* Action Section: Reset Password */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Generate or Reset Password
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleResetCredentials(false)}
                        disabled={resettingCreds}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${resettingCreds ? 'animate-spin' : ''}`} />
                        {resettingCreds ? 'Generating...' : 'Auto-Generate Temporary Password'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Or type custom password (min 6 chars)"
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleResetCredentials(true)}
                        disabled={resettingCreds || customPassword.length < 6}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-semibold transition disabled:opacity-40"
                      >
                        Set Custom
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCredsModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
