'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Printer, UserCheck, Shield, Key } from 'lucide-react';

interface BranchOption {
  _id: string;
  name: string;
  area?: string;
}

interface AcademicYearOption {
  _id: string;
  name: string;
  isCurrent?: boolean;
}

interface DivisionOption {
  _id: string;
  name: { en: string };
  code: string;
}

interface CourseOption {
  _id: string;
  name: { en: string };
  fee?: number;
  divisionId?: string | { _id: string };
}

interface ClassOption {
  _id: string;
  name: { en: string };
  fee?: number;
  numericValue?: number;
  divisionId?: string | { _id: string };
}

export default function AddStudentForm({
  branches,
  academicYears,
  divisions = [],
  courses = [],
  classes = [],
}: {
  branches: BranchOption[];
  academicYears: AcademicYearOption[];
  divisions?: DivisionOption[];
  courses?: CourseOption[];
  classes?: ClassOption[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('NIC');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [credentials, setCredentials] = useState<{
    username: string;
    temporaryPassword: string;
    studentId: string;
    studentName: string;
  } | null>(null);
  const [copied, setCopied] = useState('');

  // Filter courses for NIC
  const nicCourses = courses.filter((c) => {
    if (!c.divisionId) return true;
    const divId = typeof c.divisionId === 'string' ? c.divisionId : c.divisionId._id;
    const nicDiv = divisions.find((d) => d.code === 'NIC');
    return !nicDiv || divId === nicDiv._id;
  });

  // Filter classes for NE
  const neClasses = classes.filter((c) => {
    if (!c.divisionId) return true;
    const divId = typeof c.divisionId === 'string' ? c.divisionId : c.divisionId._id;
    const neDiv = divisions.find((d) => d.code === 'NE');
    return !neDiv || divId === neDiv._id;
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const firstName = form.get('firstName') as string;
    const lastName = form.get('lastName') as string;
    const divisionCode = (form.get('divisionCode') as string) || selectedDivision || 'NIC';
    const courseId = (form.get('courseId') as string) || selectedCourseId || undefined;
    const classId = (form.get('classId') as string) || selectedClassId || undefined;

    if (divisionCode === 'NIC' && !courseId) {
      setError('Please select an Islamic Course for Nizami Islamic Center enrollment.');
      setLoading(false);
      return;
    }

    if (divisionCode === 'NE' && !classId) {
      setError('Please select an Academic Class for Nizami Education enrollment.');
      setLoading(false);
      return;
    }

    const data = {
      firstName,
      lastName,
      dateOfBirth: form.get('dateOfBirth') || undefined,
      gender: form.get('gender') || undefined,
      phone: form.get('phone') || undefined,
      whatsapp: form.get('whatsapp') || undefined,
      email: form.get('email') || undefined,
      fatherName: form.get('fatherName') || undefined,
      motherName: form.get('motherName') || undefined,
      guardianName: form.get('guardianName') || undefined,
      guardianPhone: form.get('guardianPhone') || undefined,
      primaryBranchId: form.get('primaryBranchId'),
      academicYearId: form.get('academicYearId'),
      divisionCode,
      courseId: divisionCode === 'NIC' ? courseId : undefined,
      classId: divisionCode === 'NE' ? classId : undefined,
      notes: form.get('notes') || undefined,
      address: {
        line1: form.get('addressLine1') || undefined,
        area: form.get('addressArea') || undefined,
        city: form.get('addressCity') || 'Titwala',
        state: form.get('addressState') || 'Maharashtra',
        pincode: form.get('addressPincode') || '421605',
      },
    };

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error ?? 'Failed to create student');

      setCredentials({
        username: result.credentials.username,
        temporaryPassword: result.credentials.temporaryPassword,
        studentId: result.student.studentId,
        studentName: `${result.student.firstName} ${result.student.lastName}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating student');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  }

  // Show credentials screen after successful creation
  if (credentials) {
    return (
      <div className="max-w-xl mx-auto mt-6">
        <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-lg p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
            <UserCheck className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Student Enrolled & User Account Active
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-3">{credentials.studentName}</h2>
            <p className="text-sm font-mono text-emerald-800 font-semibold mt-1">
              Student ID: {credentials.studentId}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 border border-gray-200/80">
            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Username / Login ID</p>
                <p className="font-mono font-bold text-sm text-gray-900">{credentials.username}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(credentials.username, 'user')}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
                title="Copy username"
              >
                {copied === 'user' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
              <div>
                <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-600" />
                  Temporary Password (One-time view)
                </p>
                <p className="font-mono font-bold text-sm text-emerald-700">{credentials.temporaryPassword}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(credentials.temporaryPassword, 'pass')}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
                title="Copy password"
              >
                {copied === 'pass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              Note: The student will be prompted to change this temporary password upon first login to the student portal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-4 h-4" /> Print Credential Slip
            </button>
            <Link
              href="/admin/students"
              className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
            >
              Done & Return to Students
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-emerald-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manually register a student and instantly generate portal access credentials
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Division & Campus Selection */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            Division, Program &amp; Campus Allocation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Division *</label>
              <select
                name="divisionCode"
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedCourseId('');
                  setSelectedClassId('');
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
              >
                <option value="NIC">Nizami Islamic Center (NIC)</option>
                <option value="NE">Nizami Education (NE)</option>
              </select>
            </div>

            {/* Dynamic Enrollment Type: Course for NIC, Class for NE */}
            {selectedDivision === 'NIC' ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Enrolling Islamic Course *
                </label>
                <select
                  name="courseId"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-xs bg-emerald-50/40 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                >
                  <option value="">— Select Islamic Course —</option>
                  {nicCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name.en} {c.fee ? `(₹${c.fee}/mo)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Enrolling Academic Class (1st – 8th) *
                </label>
                <select
                  name="classId"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-rose-300 rounded-xl text-xs bg-rose-50/40 text-gray-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-medium"
                >
                  <option value="">— Select Academic Class —</option>
                  {neClasses.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name.en} {cls.fee ? `(₹${cls.fee}/mo)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Primary Branch *</label>
              <select
                name="primaryBranchId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {branches.length === 0 ? (
                  <option value="">No active branches found</option>
                ) : (
                  branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} {b.area ? `(${b.area})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Academic Session *</label>
              <select
                name="academicYearId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {academicYears.length === 0 ? (
                  <option value="">No academic year found</option>
                ) : (
                  academicYears.map((y) => (
                    <option key={y._id} value={y._id}>
                      {y.name} {y.isCurrent ? '(Active)' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Student Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-gray-900">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                required
                placeholder="e.g. Zaid"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                required
                placeholder="e.g. Khan"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                defaultValue="male"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Student Phone</label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                name="whatsapp"
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="student@example.com (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Parent & Guardian Info */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-gray-900">Parent & Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Father's Name</label>
              <input
                type="text"
                name="fatherName"
                placeholder="Father's full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Mother's Name</label>
              <input
                type="text"
                name="motherName"
                placeholder="Mother's full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Guardian Name</label>
              <input
                type="text"
                name="guardianName"
                placeholder="Guardian name if different"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Guardian Phone *</label>
              <input
                type="tel"
                name="guardianPhone"
                required
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-gray-900">Residential Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Address Line</label>
              <input
                type="text"
                name="addressLine1"
                placeholder="Chawl / Building / Room No."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Area / Locality</label>
              <input
                type="text"
                name="addressArea"
                placeholder="e.g. Baneli / Kokan Nagar"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="addressCity"
                defaultValue="Titwala (E)"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                name="addressPincode"
                defaultValue="421605"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/students"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            {loading ? 'Creating Student...' : 'Create Student & Generate Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
