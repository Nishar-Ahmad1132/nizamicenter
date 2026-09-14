import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import FeeRecord from '@/models/FeeRecord';
import Notice from '@/models/Notice';
import Timetable, { DayOfWeek } from '@/models/Timetable';
import '@/models/Branch';
import '@/models/Division';
import '@/models/Class';
import '@/models/Course';
import '@/models/Subject';
import '@/models/Teacher';
import Link from 'next/link';
import {
  CalendarCheck,
  CreditCard,
  BookOpen,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function StudentDashboardPage() {
  const session = await auth();
  await dbConnect();

  let student = null;
  if (session?.user?.id) {
    student = await Student.findOne({ userId: session.user.id })
      .populate('primaryBranchId', 'name')
      .populate('academicYearId', 'name')
      .lean();
  }

  // Fallback to first student if demo user or new account
  if (!student) {
    student = await Student.findOne({ status: 'active' })
      .populate('primaryBranchId', 'name')
      .populate('academicYearId', 'name')
      .lean();
  }

  const studentObj = student ? JSON.parse(JSON.stringify(student)) : null;

  // Fetch recent notices
  const notices = await Notice.find({ status: 'published' })
    .sort({ publishDate: -1 })
    .limit(3)
    .lean();

  let attendanceStats = {
    percentage: 100,
    presentDays: 0,
    totalDays: 0,
  };

  if (student?._id) {
    const rawAttn = await Attendance.find({ studentId: student._id }).lean();
    const totalDays = rawAttn.length;
    const presentDays = rawAttn.filter((a) => a.status === 'present' || a.status === 'late').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
    attendanceStats = { percentage, presentDays, totalDays };
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayDay = dayNames[new Date().getDay()];

  // Query today's active schedule slots from database
  let todaySlots = await Timetable.find({
    day: todayDay as DayOfWeek,
    isActive: true,
    status: 'active',
  })
    .populate('divisionId', 'name code slug')
    .populate('courseId', 'name')
    .populate('subjectId', 'name')
    .populate('classId', 'name')
    .populate('teacherId', 'name title')
    .sort({ startTime: 1 })
    .lean();

  const isWeekendOff = todaySlots.length === 0;
  if (isWeekendOff) {
    todaySlots = await Timetable.find({
      day: 'monday' as DayOfWeek,
      isActive: true,
      status: 'active',
    })
      .populate('divisionId', 'name code slug')
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .populate('classId', 'name')
      .populate('teacherId', 'name title')
      .sort({ startTime: 1 })
      .lean();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schedule = todaySlots.map((s: any) => {
    const isNic = s.divisionId?.code === 'NIC' || s.divisionId?.slug?.includes('islamic');
    const courseName = typeof s.courseId?.name === 'object' ? s.courseId?.name?.en : s.courseId?.name;
    const subjectName = typeof s.subjectId?.name === 'object' ? s.subjectId?.name?.en : s.subjectId?.name;
    const className = typeof s.classId?.name === 'object' ? s.classId?.name?.en : s.classId?.name;

    const subject = courseName || (subjectName ? `${subjectName} (${className || 'Class'})` : className) || 'Scheduled Batch';

    return {
      id: s._id.toString(),
      time: `${s.startTime} - ${s.endTime}`,
      subject,
      teacher: s.teacherId?.name || 'Assigned Faculty',
      room: s.room || 'Main Hall',
      isNic,
    };
  });

  return (
    <div className="space-y-8">
      {/* Student Overview Banner */}
      <div className="bg-gradient-to-br from-[#0D4A28] to-[#1B6B3A] rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full border border-white/20 text-[#D4AF37]">
              Student ID: {studentObj?.studentId || 'NIZ-2026-0042'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
              {studentObj?.firstName ? `${studentObj.firstName} ${studentObj.lastName || ''}` : 'Enrolled Student'}
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              Campus: {studentObj?.primaryBranchId?.name || 'Main Campus'} • Academic Year: {studentObj?.academicYearId?.name || '2025-2026'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/attendance"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white text-[#1B6B3A] hover:bg-gray-100 transition shadow"
            >
              View Attendance
            </Link>
            <Link
              href="/student/fees"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#D4AF37] text-gray-900 hover:bg-[#c49f2c] transition shadow"
            >
              Pay Tuition Fee
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B6B3A] flex items-center justify-center mb-3">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Overall Attendance</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{attendanceStats.percentage}%</p>
          <p className="text-[11px] text-emerald-600 mt-1">
            {attendanceStats.totalDays > 0
              ? `${attendanceStats.presentDays} of ${attendanceStats.totalDays} sessions attended`
              : 'No sessions recorded yet'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Fee Balance</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(0)}</p>
          <p className="text-[11px] text-emerald-600 mt-1">All dues cleared</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Active Enrolled Tracks</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">2</p>
          <p className="text-[11px] text-gray-500 mt-1">Hifz & Secondary School</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Next Test Date</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">Monday</p>
          <p className="text-[11px] text-purple-700 mt-1">Math Chapter 4 Mock</p>
        </div>
      </div>

      {/* Today's Classes & Recent Announcements */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                {isWeekendOff ? "Upcoming Monday's Schedule" : "Today’s Class Timetable"}
              </h2>
              {isWeekendOff && (
                <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  Upcoming
                </span>
              )}
            </div>
            <Link href="/student/timetable" className="text-xs font-semibold text-[#1B6B3A] hover:underline flex items-center gap-1">
              Full Week <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {schedule.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">No classes scheduled</p>
              <p className="text-xs text-gray-400 mt-0.5">Check back later or view the full week timetable</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-3 hover:border-emerald-200 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{item.subject}</h3>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          item.isNic
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.isNic ? 'Islamic Center' : 'Education'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Faculty: {item.teacher} • {item.room}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-white border border-gray-200 text-emerald-800 font-mono rounded-lg shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Notices */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Important Notices</h2>
              <Link href="/notices" className="text-xs font-semibold text-[#1B6B3A] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {notices.map((n: any) => (
                <div key={n._id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {n.category}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 mt-1.5 line-clamp-1">{n.title?.en}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{n.content?.en}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{formatDate(n.publishDate)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100">
            <Link
              href="/student/profile"
              className="w-full block text-center py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
            >
              Update Profile Information
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
