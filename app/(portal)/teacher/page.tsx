import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';
import Enrollment from '@/models/Enrollment';
import Timetable from '@/models/Timetable';
import TeacherIssue from '@/models/TeacherIssue';
import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  Clock,
  BookOpen,
  ArrowRight,
  Building2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

function getItemName(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item.name === 'string') return item.name;
  if (typeof item.name === 'object' && item.name) {
    return item.name.en || item.name.hi || item.name.ur || '';
  }
  return '';
}

export default async function TeacherDashboardPage() {
  const session = await auth();
  await dbConnect();

  let teacher = null;
  if (session?.user?.id) {
    teacher = await Teacher.findOne({ userId: session.user.id, isActive: true })
      .populate('branchIds', 'name address')
      .populate('subjectIds', 'name code')
      .populate('courseIds', 'name category fee duration')
      .lean();
  }

  // Fallback for admin previewing the portal
  if (!teacher) {
    teacher = await Teacher.findOne({ isActive: true })
      .populate('branchIds', 'name address')
      .populate('subjectIds', 'name code')
      .populate('courseIds', 'name category fee duration')
      .lean();
  }

  if (!teacher) {
    return (
      <div className="p-8 bg-white rounded-2xl border text-center">
        <h2 className="text-xl font-bold text-gray-800">Faculty Profile Not Found</h2>
        <p className="text-gray-500 text-sm mt-2">
          Your user account is not currently linked to an active teacher record. Please contact the administrator.
        </p>
      </div>
    );
  }

  const teacherBranchIds = (teacher.branchIds || []).map((b: any) => b._id);
  const teacherCourseIds = (teacher.courseIds || []).map((c: any) => c._id);

  // Real data queries
  const [enrolledStudentsCount, timetableSlots, recentIssues] = await Promise.all([
    Enrollment.countDocuments({
      isActive: true,
      $or: [
        { courseId: { $in: teacherCourseIds } },
        { branchId: { $in: teacherBranchIds } },
      ],
    }),
    Timetable.find({ teacherId: teacher._id, isActive: true })
      .populate('branchId', 'name')
      .populate('subjectId', 'name code')
      .populate('courseId', 'name')
      .populate('classId', 'name numericValue')
      .sort({ day: 1, startTime: 1 })
      .lean(),
    TeacherIssue.find({ teacherId: teacher._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner with Allocation Info */}
      <div className="bg-gradient-to-br from-[#0D4A28] via-[#1B6B3A] to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold px-3 py-1 bg-white/15 rounded-full border border-white/20 text-emerald-200 uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Faculty Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {teacher.name}
            </h1>
            <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
              Manage your allocated campuses, view class schedules, record daily student attendance, and submit updates to the administration.
            </p>

            {/* Quick badges of allocations */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {teacher.branchIds?.map((b: any) => (
                <span
                  key={b._id}
                  className="px-2.5 py-1 bg-white/20 backdrop-blur-xs rounded-lg text-xs font-semibold text-white flex items-center gap-1"
                >
                  <Building2 className="w-3 h-3 text-emerald-300" />
                  {b.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <Link
              href="/teacher/attendance"
              className="w-full sm:w-auto px-5 py-3 text-xs font-bold rounded-xl bg-white text-[#1B6B3A] hover:bg-emerald-50 transition shadow-md flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-[#1B6B3A]" /> Mark Attendance
            </Link>
            <Link
              href="/teacher/issues"
              className="w-full sm:w-auto px-5 py-3 text-xs font-bold rounded-xl bg-emerald-800/80 border border-emerald-600/60 text-white hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" /> Raise Issue
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Assigned Branches</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{teacher.branchIds?.length || 0}</p>
          <p className="text-[11px] text-blue-700 mt-1 font-medium">Campuses Allocated</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Assigned Courses &amp; Subjects</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {(teacher.courseIds?.length || 0) + (teacher.subjectIds?.length || 0)}
          </p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">
            {teacher.courseIds?.length || 0} Islamic, {teacher.subjectIds?.length || 0} Academic
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Active Enrolled Students</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{enrolledStudentsCount}</p>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">In your assigned cohorts</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Weekly Class Periods</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{timetableSlots.length}</p>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Scheduled timetable periods</p>
        </div>
      </div>

      {/* Allocated Classes & Subjects Matrix */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Allocated Classes &amp; Subjects</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Curriculum allocations configured by administration
            </p>
          </div>
          <Link
            href="/teacher/classes"
            className="text-xs font-semibold text-[#1B6B3A] hover:underline flex items-center gap-1"
          >
            View Student Cohorts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Islamic Courses (NIC) */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-emerald-950">Islamic Courses (NIC)</h3>
              <span className="text-[11px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full font-bold ml-auto">
                {teacher.courseIds?.length || 0}
              </span>
            </div>
            {teacher.courseIds && teacher.courseIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {teacher.courseIds.map((c: any) => (
                  <span
                    key={c._id}
                    className="px-3 py-1.5 bg-white text-emerald-900 border border-emerald-200 text-xs font-semibold rounded-xl shadow-xs"
                  >
                    {getItemName(c)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No Islamic courses assigned.</p>
            )}
          </div>

          {/* Academic Subjects (NE) */}
          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-purple-700" />
              <h3 className="text-sm font-bold text-purple-950">Academic Subjects (NE)</h3>
              <span className="text-[11px] bg-purple-200/70 text-purple-900 px-2 py-0.5 rounded-full font-bold ml-auto">
                {teacher.subjectIds?.length || 0}
              </span>
            </div>
            {teacher.subjectIds && teacher.subjectIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {teacher.subjectIds.map((s: any) => (
                  <span
                    key={s._id}
                    className="px-3 py-1.5 bg-white text-purple-900 border border-purple-200 text-xs font-semibold rounded-xl shadow-xs"
                  >
                    {getItemName(s) || s.code}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No academic subjects assigned.</p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Schedule & Recent Issues Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Timetable Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1B6B3A]" />
              <h2 className="font-bold text-gray-900 text-base">Your Weekly Schedule</h2>
            </div>
            <Link
              href="/teacher/attendance"
              className="text-xs font-semibold text-[#1B6B3A] hover:underline"
            >
              Take Attendance &rarr;
            </Link>
          </div>

          {timetableSlots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-400 font-semibold text-left">
                    <th className="pb-2">Day</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Subject / Course</th>
                    <th className="pb-2">Branch / Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {timetableSlots.map((slot: any) => (
                    <tr key={slot._id} className="hover:bg-gray-50/80 transition">
                      <td className="py-2.5 font-bold capitalize text-dark">{slot.day}</td>
                      <td className="py-2.5 text-xs text-gray-600 font-medium">
                        {slot.startTime} &ndash; {slot.endTime}
                      </td>
                      <td className="py-2.5">
                        <span className="font-semibold text-gray-900">
                          {getItemName(slot.subjectId) || getItemName(slot.courseId) || '—'}
                        </span>
                        {slot.classId && (
                          <span className="text-xs text-gray-500 ml-1.5">
                            ({getItemName(slot.classId)})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-xs text-gray-600">
                        {slot.branchId?.name || '—'} {slot.room ? `(${slot.room})` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">
              No weekly timetable periods configured for this teacher yet.
            </div>
          )}
        </div>

        {/* Recent Issues & Admin Communication */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h2 className="font-bold text-gray-900 text-base">Issues &amp; Requests</h2>
              </div>
              <Link
                href="/teacher/issues"
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                + New Issue
              </Link>
            </div>

            {recentIssues.length > 0 ? (
              <div className="space-y-3">
                {recentIssues.map((issue: any) => (
                  <div
                    key={issue._id}
                    className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 truncate max-w-[180px]">
                        {issue.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          issue.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : issue.status === 'in_review'
                            ? 'bg-blue-100 text-blue-800'
                            : issue.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {issue.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{issue.description}</p>
                    {issue.adminResponse && (
                      <p className="text-[11px] text-blue-800 bg-blue-50/80 p-1.5 rounded-md mt-1">
                        <strong>Admin:</strong> {issue.adminResponse}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400 text-xs bg-gray-50 rounded-xl">
                No open issues or requests submitted.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <Link
              href="/teacher/issues"
              className="w-full inline-block text-center py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition"
            >
              Raise Request / Leave Notice &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
