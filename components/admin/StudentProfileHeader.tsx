'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pencil, Trash2, X, Check, AlertTriangle, Phone, Building2,
  Calendar, Save, Loader2, KeyRound, Copy, BookOpen
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface BranchOption {
  _id: string;
  name: string;
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
  divisionId?: string | { _id: string; code?: string };
}

interface ClassOption {
  _id: string;
  name: { en: string };
  fee?: number;
  numericValue?: number;
  divisionId?: string | { _id: string; code?: string };
}

interface EnrollmentItem {
  _id: string;
  divisionId?: { _id: string; name?: { en?: string }; code?: string } | string;
  courseId?: { _id: string; name?: { en?: string } } | string;
  classId?: { _id: string; name?: { en?: string }; numericValue?: number } | string;
  branchId?: { _id: string; name?: string } | string;
  status?: string;
}

interface StudentData {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianPhone?: string;
  primaryBranchId?: { _id: string; name: string } | string;
  admissionDate?: string;
  status: string;
  address?: {
    line1?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  notes?: string;
}

export default function StudentProfileHeader({
  student,
  branches,
  enrollments = [],
  divisions = [],
  courses = [],
  classes = [],
  initialEdit = false,
}: {
  student: StudentData;
  branches: BranchOption[];
  enrollments?: EnrollmentItem[];
  divisions?: DivisionOption[];
  courses?: CourseOption[];
  classes?: ClassOption[];
  initialEdit?: boolean;
}) {
  const router = useRouter();
  const [currentStudent, setCurrentStudent] = useState<StudentData>(student);
  const [isEditOpen, setIsEditOpen] = useState(initialEdit);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password reset state
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [adminNewPassword, setAdminNewPassword] = useState('Nizami@2026');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleAdminPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      const res = await fetch(`/api/admin/students/${student._id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: adminNewPassword }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to reset password');

      setResetSuccess(result.message || 'Password reset successfully');
    } catch (err) {
      setResetError((err as Error).message);
    } finally {
      setResetLoading(false);
    }
  }

  // Primary enrollment details
  const primaryEnrollment = enrollments[0];
  const initialDivisionCode =
    (typeof primaryEnrollment?.divisionId === 'object'
      ? primaryEnrollment?.divisionId?.code
      : undefined) || (student.studentId?.toUpperCase().startsWith('NIC') ? 'NIC' : 'NE');

  const initialCourseId =
    (typeof primaryEnrollment?.courseId === 'object'
      ? primaryEnrollment?.courseId?._id
      : primaryEnrollment?.courseId) || '';

  const initialClassId =
    (typeof primaryEnrollment?.classId === 'object'
      ? primaryEnrollment?.classId?._id
      : primaryEnrollment?.classId) || '';

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

  // Edit form state
  const [formData, setFormData] = useState({
    firstName: student.firstName,
    lastName: student.lastName === '-' ? '' : student.lastName,
    dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
    gender: student.gender || 'male',
    phone: student.phone || '',
    whatsapp: student.whatsapp || '',
    email: student.email || '',
    fatherName: student.fatherName || '',
    motherName: student.motherName || '',
    guardianName: student.guardianName || '',
    guardianPhone: student.guardianPhone || '',
    primaryBranchId: (typeof student.primaryBranchId === 'object' ? student.primaryBranchId?._id : student.primaryBranchId) || branches[0]?._id || '',
    status: student.status || 'active',
    divisionCode: initialDivisionCode,
    courseId: initialCourseId,
    classId: initialClassId,
    line1: student.address?.line1 || '',
    area: student.address?.area || '',
    city: student.address?.city || 'Titwala (E)',
    state: student.address?.state || 'Maharashtra',
    pincode: student.address?.pincode || '421605',
    notes: student.notes || '',
  });

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/admin/students/${student._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender,
          phone: formData.phone || undefined,
          whatsapp: formData.whatsapp || undefined,
          email: formData.email || undefined,
          fatherName: formData.fatherName || undefined,
          motherName: formData.motherName || undefined,
          guardianName: formData.guardianName || undefined,
          guardianPhone: formData.guardianPhone || undefined,
          primaryBranchId: formData.primaryBranchId,
          status: formData.status,
          divisionCode: formData.divisionCode,
          courseId: formData.divisionCode === 'NIC' ? formData.courseId : undefined,
          classId: formData.divisionCode === 'NE' ? formData.classId : undefined,
          address: {
            line1: formData.line1 || undefined,
            area: formData.area || undefined,
            city: formData.city || undefined,
            state: formData.state || undefined,
            pincode: formData.pincode || undefined,
          },
          notes: formData.notes || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update student');

      if (result.student) {
        setCurrentStudent(result.student);
      }
      setSuccessMessage('Student details updated successfully!');
      setTimeout(() => {
        setIsEditOpen(false);
        setSuccessMessage('');
        router.refresh();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating student');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/students/${student._id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to remove student');

      router.push('/admin/students');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing student');
      setLoading(false);
    }
  }

  const s = currentStudent;
  const displayName = `${s.firstName}${s.lastName && s.lastName !== '-' ? ' ' + s.lastName : ''}`;
  const initials = `${s.firstName?.[0] || 'S'}${s.lastName && s.lastName !== '-' ? s.lastName[0] : ''}`.toUpperCase();
  const branchName = typeof s.primaryBranchId === 'object' ? s.primaryBranchId?.name : (branches.find(b => b._id === s.primaryBranchId)?.name || '—');

  return (
    <>
      {/* Profile Banner */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-bold text-xl uppercase shadow-inner shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {displayName}
                </h1>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                    s.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : s.status === 'inactive'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <p className="font-mono text-xs font-semibold text-emerald-800 mt-0.5">
                {s.studentId}
              </p>

              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {s.guardianPhone || s.phone || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {branchName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Admitted: {s.admissionDate ? formatDate(s.admissionDate) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Details
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPasswordResetOpen(true);
                setResetSuccess('');
                setResetError('');
                setAdminNewPassword('Nizami@2026');
                setCopied(false);
              }}
              className="px-3.5 py-2 border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700" /> Reset Password
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="px-3.5 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
              title="Remove Student"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl my-8 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Edit Student: {student.studentId}
                </h3>
                <p className="text-xs text-gray-500">
                  Update student profile, contacts, or branch allocation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Personal Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact & Portal */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="font-semibold text-gray-900 mb-2">Contact & Account</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Student Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="+91..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Parents / Guardians */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="font-semibold text-gray-900 mb-2">Guardian Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Father Name</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Mother Name</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Guardian Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Branch & Status */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="font-semibold text-gray-900 mb-2">Institutional Status & Campus</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Primary Branch *</label>
                    <select
                      value={formData.primaryBranchId}
                      onChange={(e) => setFormData({ ...formData, primaryBranchId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                    >
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Account Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="transferred">Transferred</option>
                      <option value="graduated">Graduated</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Enrollment & Program Allocation */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  Enrollment &amp; Program Allocation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Division *</label>
                    <select
                      value={formData.divisionCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          divisionCode: e.target.value,
                          courseId: '',
                          classId: '',
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-medium"
                    >
                      <option value="NIC">Nizami Islamic Center (NIC)</option>
                      <option value="NE">Nizami Education (NE)</option>
                    </select>
                  </div>

                  {formData.divisionCode === 'NIC' ? (
                    <div>
                      <label className="block text-gray-600 mb-1">Islamic Course / Program *</label>
                      <select
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                        className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-xs bg-emerald-50/40 text-gray-900 font-medium"
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
                      <label className="block text-gray-600 mb-1">Academic Class (1st – 8th) *</label>
                      <select
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        className="w-full px-3 py-2 border border-rose-300 rounded-lg text-xs bg-rose-50/40 text-gray-900 font-medium"
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
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="font-semibold text-gray-900 mb-2">Residential Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-gray-600 mb-1">Address Line</label>
                    <input
                      type="text"
                      value={formData.line1}
                      onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                      placeholder="Chawl / Flat / Street"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Area</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g. Baneli"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">Remove Student?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to remove <strong className="text-gray-900">{student.firstName} {student.lastName}</strong> ({student.studentId})?
                This will archive their records and deactivate their student portal credentials.
              </p>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDelete}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Yes, Remove Student
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reset Password Modal */}
      {isPasswordResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Reset Student Password</h3>
                  <p className="text-[11px] text-gray-500 font-mono">{student.studentId} ({student.firstName})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordResetOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {resetError}
              </div>
            )}

            {resetSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{resetSuccess}</p>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Username: <strong className="font-mono">{student.studentId.toLowerCase()}</strong>
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      New Password: <strong className="font-mono">{adminNewPassword}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`Username: ${student.studentId.toLowerCase()}\nPassword: ${adminNewPassword}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 py-2 px-3 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPasswordResetOpen(false)}
                    className="py-2 px-4 bg-gray-900 text-white hover:bg-black rounded-xl text-xs font-semibold transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminPasswordReset} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Set New Password (min 6 chars)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setAdminNewPassword(`Nizami@${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-gray-600 font-medium whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Provide this new password to the student or parent for their portal login.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPasswordResetOpen(false)}
                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || !adminNewPassword}
                    className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm flex items-center justify-center gap-1.5 transition"
                  >
                    {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    Confirm & Update
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
