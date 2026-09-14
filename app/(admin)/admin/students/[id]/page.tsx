import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Branch from '@/models/Branch';
import Enrollment from '@/models/Enrollment';
import FeeRecord from '@/models/FeeRecord';
import Attendance from '@/models/Attendance';
import '@/models/AcademicYear';
import '@/models/Division';
import '@/models/Class';
import '@/models/Course';
import '@/models/FeePlan';
import Link from 'next/link';
import { ArrowLeft, User, BookOpen, Calendar, CreditCard, Clock } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import StudentProfileHeader from '@/components/admin/StudentProfileHeader';

async function getData(id: string) {
  await requireAdmin();
  await dbConnect();

  const student = await Student.findById(id)
    .populate('primaryBranchId', 'name slug')
    .populate('academicYearId', 'name')
    .lean();

  if (!student) return null;

  const [enrollments, feeRecords, attendanceStats, branches] = await Promise.all([
    Enrollment.find({ studentId: id, isActive: true })
      .populate('divisionId', 'name code')
      .populate('branchId', 'name')
      .populate('classId', 'name numericValue')
      .populate('courseId', 'name')
      .sort({ createdAt: -1 })
      .lean(),
    FeeRecord.find({ studentId: id, isActive: true })
      .populate('feePlanId', 'name monthlyFee')
      .sort({ dueDate: -1 })
      .limit(12)
      .lean(),
    Attendance.aggregate([
      { $match: { studentId: student._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Branch.find({ isActive: true }).select('name').sort({ displayOrder: 1 }).lean(),
  ]);

  const attnMap: Record<string, number> = {};
  let attnTotal = 0;
  for (const s of attendanceStats) {
    attnMap[s._id] = s.count;
    attnTotal += s.count;
  }

  return {
    student: JSON.parse(JSON.stringify(student)),
    enrollments: JSON.parse(JSON.stringify(enrollments)),
    feeRecords: JSON.parse(JSON.stringify(feeRecords)),
    branches: JSON.parse(JSON.stringify(branches)),
    attendance: { ...attnMap, total: attnTotal, percentage: attnTotal > 0 ? Math.round(((attnMap.present ?? 0) + (attnMap.late ?? 0)) / attnTotal * 100) : 0 },
  };
}

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const data = await getData(id);

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Student not found</p>
        <Link href="/admin/students" className="text-primary text-sm hover:underline mt-2 inline-block">← Back</Link>
      </div>
    );
  }

  const { student: s, enrollments, feeRecords, attendance, branches } = data;

  return (
    <div className="space-y-6">
      <Link href="/admin/students" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </Link>

      {/* Dynamic Profile Header with Edit & Remove actions */}
      <StudentProfileHeader
        student={s}
        branches={branches}
        initialEdit={sp.edit === 'true'}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">Enrollments</span>
          </div>
          <p className="text-2xl font-bold text-dark">{enrollments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Attendance</span>
          </div>
          <p className="text-2xl font-bold text-dark">{attendance.percentage}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs">Pending Fees</span>
          </div>
          <p className="text-2xl font-bold text-accent">
            {formatCurrency(feeRecords.filter((f: { status: string }) => f.status === 'pending').reduce((sum: number, f: { dueAmount: number; paidAmount: number }) => sum + (f.dueAmount - f.paidAmount), 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Total Days</span>
          </div>
          <p className="text-2xl font-bold text-dark">{attendance.total}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-dark mb-4 flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Information
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-gray-400 text-xs">Date of Birth</dt><dd className="text-dark font-medium">{formatDate(s.dateOfBirth) || '—'}</dd></div>
            <div><dt className="text-gray-400 text-xs">Gender</dt><dd className="text-dark font-medium capitalize">{s.gender ?? '—'}</dd></div>
            <div><dt className="text-gray-400 text-xs">Student Phone</dt><dd className="text-dark font-medium">{s.phone ?? '—'}</dd></div>
            <div><dt className="text-gray-400 text-xs">WhatsApp</dt><dd className="text-dark font-medium">{s.whatsapp ?? '—'}</dd></div>
            <div><dt className="text-gray-400 text-xs">Father</dt><dd className="text-dark font-medium">{s.fatherName ?? '—'}</dd></div>
            <div><dt className="text-gray-400 text-xs">Mother</dt><dd className="text-dark font-medium">{s.motherName ?? '—'}</dd></div>
            <div><dt className="text-gray-400 text-xs">Guardian</dt><dd className="text-dark font-medium">{s.guardianName ?? '—'}</dd></div>
            <div><dt className="text-gray-400 text-xs">Guardian Phone</dt><dd className="text-dark font-medium">{s.guardianPhone ?? '—'}</dd></div>
            <div className="col-span-2"><dt className="text-gray-400 text-xs">Email</dt><dd className="text-dark font-medium">{s.email ?? '—'}</dd></div>
            <div className="col-span-2"><dt className="text-gray-400 text-xs">Address</dt><dd className="text-dark font-medium">{[s.address?.line1, s.address?.area, s.address?.city, s.address?.state, s.address?.pincode].filter(Boolean).join(', ') || '—'}</dd></div>
            {s.notes && (
              <div className="col-span-2"><dt className="text-gray-400 text-xs">Administrative Notes</dt><dd className="text-dark font-medium bg-gray-50 p-2 rounded-lg text-xs mt-1">{s.notes}</dd></div>
            )}
          </dl>
        </div>

        {/* Enrollments */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-dark mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Enrollments
          </h3>
          {enrollments.length === 0 ? (
            <p className="text-sm text-gray-400">No enrollments yet</p>
          ) : (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {enrollments.map((e: any) => (
                <div key={e._id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-dark">
                      {(typeof e.divisionId?.name === 'object' ? e.divisionId?.name?.en : e.divisionId?.name) ?? '—'} — {(typeof e.classId?.name === 'object' ? e.classId?.name?.en : e.classId?.name) ?? (typeof e.courseId?.name === 'object' ? e.courseId?.name?.en : e.courseId?.name) ?? '—'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      e.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{e.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{e.branchId?.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fee Records */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-dark mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Recent Fee Records
        </h3>
        {feeRecords.length === 0 ? (
          <p className="text-sm text-gray-400">No fee records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left py-2 font-medium text-gray-500">Month</th>
                  <th className="text-left py-2 font-medium text-gray-500">Due</th>
                  <th className="text-left py-2 font-medium text-gray-500">Paid</th>
                  <th className="text-left py-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {feeRecords.map((f: any) => (
                  <tr key={f._id}>
                    <td className="py-2">{f.month}</td>
                    <td className="py-2">{formatCurrency(f.dueAmount)}</td>
                    <td className="py-2">{formatCurrency(f.paidAmount)}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        f.status === 'paid' ? 'bg-green-50 text-green-700' :
                        f.status === 'partial' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
