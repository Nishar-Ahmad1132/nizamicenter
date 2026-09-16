'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Copy, UserCheck } from 'lucide-react';

interface BranchOption {
  _id: string;
  name: string;
}

interface SubjectOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
  code?: string;
}

interface CourseOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
}

interface Props {
  branches: BranchOption[];
  subjects: SubjectOption[];
  courses: CourseOption[];
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

export default function AddTeacherForm({ branches = [], subjects = [], courses = [] }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<{ username: string; temporaryPassword: string } | null>(null);
  const [newTeacherId, setNewTeacherId] = useState<string | null>(null);
  const [copied, setCopied] = useState('');

  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  function toggleBranch(id: string) {
    setSelectedBranches((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSubject(id: string) {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleCourse(id: string) {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const data = {
      name: (form.get('name') as string)?.trim(),
      phone: (form.get('phone') as string)?.trim(),
      email: (form.get('email') as string)?.trim() || undefined,
      qualification: (form.get('qualification') as string)?.trim() || undefined,
      experience: (form.get('experience') as string)?.trim() || undefined,
      bio: (form.get('bio') as string)?.trim() || undefined,
      branchIds: selectedBranches,
      subjectIds: selectedSubjects,
      courseIds: selectedCourses,
    };

    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Failed to create teacher');
      setCredentials(result.credentials);
      if (result.teacher?._id) {
        setNewTeacherId(result.teacher._id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating teacher');
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
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-dark mb-2">Teacher Created Successfully!</h2>
          <p className="text-xs text-gray-500 mb-6">
            A staff login account has been provisioned with the credentials below.
          </p>
          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="font-mono font-semibold">{credentials.username}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(credentials.username, 'u')}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                {copied === 'u' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Temporary Password</p>
                <p className="font-mono font-semibold">{credentials.temporaryPassword}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(credentials.temporaryPassword, 'p')}
                className="p-2 hover:bg-gray-200 rounded-lg transition"
              >
                {copied === 'p' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {newTeacherId && (
              <button
                type="button"
                onClick={() => router.push(`/admin/teachers/${newTeacherId}`)}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
              >
                View Teacher Profile &rarr;
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push('/admin/teachers')}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              Back to Teachers List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <Link href="/admin/teachers" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Teachers
      </Link>
      <h1 className="text-2xl font-bold text-dark mb-2">Add New Teacher</h1>
      <p className="text-xs text-gray-400 mb-6">
        Fill in teacher information and assign branches, academic subjects, and Islamic courses.
      </p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-dark flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. Maulana Farooq Ahmad"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                name="phone"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="teacher@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Qualification</label>
              <input
                type="text"
                name="qualification"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g., Alim, Hafiz, B.Ed"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Experience</label>
              <input
                type="text"
                name="experience"
                placeholder="e.g., 5 years teaching Quran and Arabic"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Short Bio</label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Brief introduction for faculty profile..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Allocations: Branches, Subjects & Courses */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-dark">Branch &amp; Subject Assignments</h2>

          {/* Branches */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Assign Branches <span className="text-gray-400 font-normal">({selectedBranches.length} selected)</span>
              </label>
              {selectedBranches.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedBranches([])}
                  className="text-[11px] text-gray-400 hover:text-red-500"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              {branches.map((b) => {
                const selected = selectedBranches.includes(b._id);
                return (
                  <button
                    key={b._id}
                    type="button"
                    onClick={() => toggleBranch(b._id)}
                    className={`px-3 py-1 text-xs rounded-md font-medium border transition-all ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}{b.name}
                  </button>
                );
              })}
              {branches.length === 0 && <span className="text-xs text-gray-400">No branches configured</span>}
            </div>
          </div>

          {/* Academic Subjects (NE) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Assign Academic Subjects (NE) <span className="text-gray-400 font-normal">({selectedSubjects.length} selected)</span>
              </label>
              {selectedSubjects.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSubjects([])}
                  className="text-[11px] text-gray-400 hover:text-red-500"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              {subjects.map((s) => {
                const selected = selectedSubjects.includes(s._id);
                const sName = getItemName(s);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => toggleSubject(s._id)}
                    className={`px-3 py-1 text-xs rounded-md font-medium border transition-all ${
                      selected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}{sName}
                  </button>
                );
              })}
              {subjects.length === 0 && <span className="text-xs text-gray-400">No subjects configured</span>}
            </div>
          </div>

          {/* Islamic Courses (NIC) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Assign Islamic Courses (NIC) <span className="text-gray-400 font-normal">({selectedCourses.length} selected)</span>
              </label>
              {selectedCourses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCourses([])}
                  className="text-[11px] text-gray-400 hover:text-red-500"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              {courses.map((c) => {
                const selected = selectedCourses.includes(c._id);
                const cName = getItemName(c);
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => toggleCourse(c._id)}
                    className={`px-3 py-1 text-xs rounded-md font-medium border transition-all ${
                      selected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}{cName}
                  </button>
                );
              })}
              {courses.length === 0 && <span className="text-xs text-gray-400">No courses configured</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50 text-sm shadow-sm"
          >
            {loading ? 'Creating...' : 'Create Teacher & Generate Credentials'}
          </button>
          <Link
            href="/admin/teachers"
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
