import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Download,
  Phone,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function ParentDashboardPage() {
  const session = await auth();
  await dbConnect();

  const childrenData = [
    {
      studentId: 'NIZ-2026-0042',
      name: 'Zaid Khan',
      grade: 'Class 10 & Hifz-ul-Qur’an',
      branch: 'Main Campus',
      attendancePct: 94,
      presentDays: 47,
      totalDays: 50,
      feeBalance: 0,
      lastPayment: '02 Sep 2026 (₹2,500)',
      recentRemark: 'Excellent retention in Sabaq (Surah Maryam). Math scores improved by 15% in the latest weekly mock test.',
      teacherName: 'Qari Abdul Rahman & Er. Zeeshan Akhtar',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full border border-white/20 text-purple-200">
            Parent & Guardian Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Child Progress & Monitoring Console
          </h1>
          <p className="text-purple-200 text-sm mt-1">
            Track daily attendance, fee statements, and teacher remarks in real time.
          </p>
        </div>
      </div>

      {/* Children Overview Cards */}
      <div className="space-y-6">
        {childrenData.map((child, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xl">
                  {child.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{child.name}</h2>
                  <p className="text-xs text-purple-700 font-semibold mt-0.5">
                    ID: {child.studentId} • {child.grade}
                  </p>
                  <p className="text-xs text-gray-500">Campus: {child.branch}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Enrolled Active
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-gray-500 font-medium">Monthly Attendance</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{child.attendancePct}%</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {child.presentDays} of {child.totalDays} sessions attended
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-gray-500 font-medium">Pending Fee Dues</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(child.feeBalance)}</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">All dues cleared</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-gray-500 font-medium">Last Payment Recorded</p>
                <p className="text-sm font-bold text-gray-900 mt-2">{child.lastPayment}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Receipt #REC-2026-089</p>
              </div>
            </div>

            {/* Teacher Remarks / Assessment Note */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <h3 className="text-xs uppercase font-bold text-amber-900 tracking-wider mb-1.5">
                Latest Faculty Evaluation Note
              </h3>
              <p className="text-sm text-gray-800 leading-relaxed italic">
                “{child.recentRemark}”
              </p>
              <p className="text-xs text-amber-800 font-medium mt-2">
                — Mentors: {child.teacherName}
              </p>
            </div>

            {/* Contact Desk */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <Phone className="w-4 h-4 text-purple-700" /> Need to consult teacher? Call{' '}
                <strong>+91 98765 43210</strong>
              </span>
              <Link
                href="/notices"
                className="font-semibold text-purple-700 hover:underline"
              >
                View General Institute Notices →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
