'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, XCircle, Phone, Mail, MapPin,
  Calendar, Clock, UserCheck, Copy, Check, Printer, MessageCircle, AlertCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
  name: { en: string; hi?: string; ur?: string } | string;
  code: string;
}

interface ClassOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
}

interface CourseOption {
  _id: string;
  name: { en: string; hi?: string; ur?: string } | string;
}

interface ApplicationData {
  _id: string;
  applicantName: string;
  fatherName?: string;
  guardianPhone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  preferredTiming?: string;
  message?: string;
  status: string;
  createdAt: string;
  divisionId?: { _id: string; name?: { en: string; hi?: string; ur?: string } | string; code?: string };
  classId?: { _id: string; name?: { en: string; hi?: string; ur?: string } | string };
  courseIds?: Array<{ _id: string; name?: { en: string; hi?: string; ur?: string } | string }>;
  preferredBranchId?: { _id: string; name?: string };
  convertedStudentId?: string;
}

function getLocalizedName(val: unknown): string {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj.en === 'string') return obj.en;
    if (typeof obj.hi === 'string') return obj.hi;
    if (typeof obj.ur === 'string') return obj.ur;
  }
  return '—';
}

export default function AdmissionReviewClient({
  application,
  branches,
  academicYears,
  divisions,
  classes,
  courses,
}: {
  application: ApplicationData;
  branches: BranchOption[];
  academicYears: AcademicYearOption[];
  divisions: DivisionOption[];
  classes: ClassOption[];
  courses: CourseOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [divisionCode, setDivisionCode] = useState<string>(
    application.divisionId?.code || 'NIC'
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    application.preferredBranchId?._id || branches[0]?._id || ''
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    academicYears.find((y) => y.isCurrent)?._id || academicYears[0]?._id || ''
  );
  const [selectedClass, setSelectedClass] = useState<string>(
    application.classId?._id || ''
  );
  const [selectedCourse, setSelectedCourse] = useState<string>(
    application.courseIds?.[0]?._id || ''
  );

  const [credentials, setCredentials] = useState<{
    username: string;
    temporaryPassword: string;
    studentId: string;
    studentName: string;
  } | null>(null);

  const [copied, setCopied] = useState('');

  async function handleApproveAndConvert() {
    setLoading(true);
    setError('');

    const currentDivision = divisions.find((d) => d.code === divisionCode);

    try {
      const res = await fetch(`/api/admin/admissions/${application._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'convert',
          enrollmentData: {
            divisionCode,
            divisionId: currentDivision?._id,
            branchId: selectedBranch,
            academicYearId: selectedYear,
            classId: divisionCode === 'NE' ? selectedClass || undefined : undefined,
            courseId: divisionCode === 'NIC' ? selectedCourse || undefined : undefined,
          },
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to approve application');

      setCredentials({
        username: result.credentials.username,
        temporaryPassword: result.credentials.temporaryPassword,
        studentId: result.student.studentId,
        studentName: `${result.student.firstName} ${result.student.lastName}`,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during approval');
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!confirm('Are you sure you want to mark this application as rejected?')) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/admissions/${application._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (!res.ok) throw new Error('Failed to reject application');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  }

  // Pre-formatted WhatsApp message for parent
  const cleanPhone = (application.whatsapp || application.guardianPhone || '').replace(/\D/g, '');
  const waPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const waMessage = credentials
    ? encodeURIComponent(
        `Assalamu Alaikum,\n\nAdmission Application for *${credentials.studentName}* has been APPROVED at *Nizami Islamic Center & Nizami Education*!\n\n🎓 *Student Portal Credentials:*\n• Student ID: ${credentials.studentId}\n• Username: ${credentials.username}\n• Temporary Password: ${credentials.temporaryPassword}\n\n🌐 Login URL: ${typeof window !== 'undefined' ? window.location.origin : ''}/login\n\nPlease log in and update your password. Welcome to the Nizami family!`
      )
    : '';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/admissions"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-emerald-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </Link>
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${
            application.status === 'pending'
              ? 'bg-amber-100 text-amber-800'
              : application.status === 'approved' || application.status === 'converted'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {application.status === 'converted' ? 'Admitted Student' : application.status}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Admission Application</h1>
        <p className="text-xs text-gray-500 mt-1">
          Applied on {formatDate(application.createdAt)} • Application ID: {application._id}
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Credentials Modal / Banner */}
      {credentials && (
        <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-950">
                Application Approved & Student Account Created!
              </h2>
              <p className="text-xs text-emerald-800 font-medium">
                Student ID: <span className="font-mono font-bold">{credentials.studentId}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-gray-100">
              <div>
                <p className="text-[10px] text-gray-500">Student Username / Login ID</p>
                <p className="font-mono font-bold text-xs text-gray-900">{credentials.username}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(credentials.username, 'user')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-500"
                title="Copy username"
              >
                {copied === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-gray-100">
              <div>
                <p className="text-[10px] text-gray-500">Temporary Password</p>
                <p className="font-mono font-bold text-xs text-emerald-700">{credentials.temporaryPassword}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(credentials.temporaryPassword, 'pass')}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-500"
                title="Copy password"
              >
                {copied === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {cleanPhone && (
              <a
                href={`https://wa.me/${waPhone}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Credentials to Guardian
              </a>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" /> Print Admission Slip
            </button>
            <Link
              href="/admin/students"
              className="py-2 px-4 bg-emerald-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              View in All Students &rarr;
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applicant Submitted Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Applicant Profile Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Applicant Full Name</span>
                <span className="font-semibold text-gray-900 text-sm">{application.applicantName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Father / Guardian Name</span>
                <span className="font-semibold text-gray-900">{application.fatherName || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Guardian Phone Number</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-gray-900">{application.guardianPhone}</span>
                  <a
                    href={`tel:${application.guardianPhone}`}
                    className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Email Address</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{application.email || 'Not provided'}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Date of Birth</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{application.dateOfBirth ? formatDate(application.dateOfBirth) : 'Not provided'}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Gender</span>
                <span className="capitalize font-medium text-gray-900">{application.gender || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Preferred Batch Timing</span>
                <div className="flex items-center gap-1.5 mt-0.5 font-medium text-gray-900">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{application.preferredTiming || 'Subah / Dopahar / Sham (Flexible)'}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Requested Campus</span>
                <div className="flex items-center gap-1.5 mt-0.5 font-medium text-gray-900">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{application.preferredBranchId?.name || 'Any Titwala Campus'}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Applied Program</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">
                  {application.divisionId
                    ? `${getLocalizedName(application.divisionId.name)} (${application.divisionId.code})`
                    : 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Applied Course / Class</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">
                  {application.classId
                    ? getLocalizedName(application.classId.name)
                    : application.courseIds && application.courseIds.length > 0
                    ? application.courseIds.map((c) => getLocalizedName(c.name)).join(', ')
                    : '—'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-400 block text-[11px]">Residential Address</span>
                <span className="text-gray-700 mt-0.5 block">{application.address || 'Baneli / Titwala (East)'}</span>
              </div>
              {application.message && (
                <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 block text-[10px] font-semibold uppercase">Notes from Applicant</span>
                  <p className="text-xs text-gray-700 mt-1 italic">&ldquo;{application.message}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Admission & Credentials Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Admission Decision & Enrollment
            </h2>

            {application.status === 'converted' ? (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-900">Student Already Admitted</p>
                <p className="text-[11px] text-emerald-700">
                  Credentials and student profile have been generated for this applicant.
                </p>
                <Link
                  href="/admin/students"
                  className="inline-block mt-2 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  View Students List &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Operating Division *
                  </label>
                  <select
                    value={divisionCode}
                    onChange={(e) => {
                      setDivisionCode(e.target.value);
                      if (e.target.value === 'NE') {
                        setSelectedCourse('');
                      } else {
                        setSelectedClass('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {divisions && divisions.length > 0 ? (
                      divisions.map((d) => (
                        <option key={d._id} value={d.code}>
                          {getLocalizedName(d.name)} ({d.code})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="NIC">Nizami Islamic Center (NIC)</option>
                        <option value="NE">Nizami Education (NE)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Assigned Campus / Branch *
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Academic Year *
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {academicYears.map((y) => (
                      <option key={y._id} value={y._id}>
                        {y.name} {y.isCurrent ? '(Current Session)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {divisionCode === 'NE' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Academic Class / Grade *
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Class (1 to 8)...</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                          {getLocalizedName(c.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Islamic Studies Course *
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Islamic Course...</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {getLocalizedName(c.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleApproveAndConvert}
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {loading ? 'Processing Admission...' : 'Approve & Issue Student Credentials'}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleReject}
                    className="w-full py-2 px-4 border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
