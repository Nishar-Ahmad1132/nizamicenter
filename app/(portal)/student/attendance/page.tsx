import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import Teacher from '@/models/Teacher';
import Enrollment from '@/models/Enrollment';
import '@/models/Branch';
import '@/models/Course';
import '@/models/Class';
import '@/models/Division';
import '@/models/Subject';
import { CalendarCheck, CheckCircle2, XCircle, Clock, Minus, Sparkles, User, BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';

function getLocalizedName(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.en || val.ar || val.ur || Object.values(val)[0] || '';
  return String(val);
}

export default async function StudentAttendancePage() {
  const session = await auth();
  await dbConnect();

  let student = null;
  if (session?.user?.id) {
    student = await Student.findOne({ userId: session.user.id })
      .populate('primaryBranchId', 'name')
      .lean();
  }

  if (!student) {
    student = await Student.findOne({ status: 'active' })
      .populate('primaryBranchId', 'name')
      .lean();
  }

  // Fetch real attendance records, populating branch + the user who marked it
  let logs: Array<{
    _id: string;
    date: Date | string;
    status: 'present' | 'absent' | 'late' | 'leave';
    notes?: string;
    enrollmentId?: string;
    branchId?: { name: string };
    markedBy?: { _id: string };
    markedByName?: string;
    sessionLabel?: string;
  }> = [];

  if (student?._id) {
    const rawLogs = await Attendance.find({ studentId: student._id })
      .populate('branchId', 'name')
      .populate('markedBy', '_id')
      .sort({ date: -1 })
      .limit(60)
      .lean();

    const parsed: typeof logs = JSON.parse(JSON.stringify(rawLogs));

    // Collect unique markedBy user IDs → resolve teacher names
    const markerIds = [...new Set(
      parsed.map((l) => (l.markedBy as any)?._id?.toString()).filter(Boolean)
    )];

    const teachers = markerIds.length > 0
      ? await Teacher.find({ userId: { $in: markerIds } })
          .select('userId name qualification')
          .lean()
      : [];

    const teacherByUserId = new Map(
      teachers.map((t: any) => [t.userId.toString(), t])
    );

    // Collect enrollmentIds to resolve session details
    const enrollmentIds = [...new Set(
      parsed.map((l) => (l as any).enrollmentId?.toString()).filter(Boolean)
    )];

    const enrollments = enrollmentIds.length > 0
      ? await Enrollment.find({ _id: { $in: enrollmentIds } })
          .populate('divisionId', 'code name')
          .populate('courseId', 'name')
          .populate('classId', 'name numericValue')
          .populate('subjectIds', 'name code')
          .lean()
      : [];

    const enrollmentById = new Map(
      enrollments.map((e: any) => [e._id.toString(), e])
    );

    logs = parsed.map((log) => {
      const userId = (log.markedBy as any)?._id?.toString();
      const teacher = userId ? teacherByUserId.get(userId) : null;
      const markedByName = (teacher as any)?.name || null;

      // Build session label
      const enrollment = log.enrollmentId
        ? enrollmentById.get(log.enrollmentId.toString())
        : null;

      let sessionLabel = '';
      if (enrollment) {
        const div = (enrollment as any).divisionId;
        const divCode = div?.code || '';
        if (divCode === 'NIC') {
          const courseName = getLocalizedName((enrollment as any).courseId?.name) || 'Islamic Course';
          sessionLabel = `NIC · ${courseName}`;
        } else if (divCode === 'NE') {
          const className = getLocalizedName((enrollment as any).classId?.name)
            || ((enrollment as any).classId?.numericValue ? `Class ${(enrollment as any).classId.numericValue}` : 'Academic');
          const subjects = ((enrollment as any).subjectIds || [])
            .map((s: any) => getLocalizedName(s.name) || s.code)
            .filter(Boolean);
          sessionLabel = subjects.length > 0
            ? `NE · ${className} (${subjects.slice(0, 2).join(', ')}${subjects.length > 2 ? '…' : ''})`
            : `NE · ${className}`;
        } else {
          sessionLabel = divCode || 'Session';
        }
      }

      return { ...log, markedByName, sessionLabel };
    });
  }

  // Calculate live statistics
  const total = logs.length;
  const present = logs.filter((l) => l.status === 'present').length;
  const late = logs.filter((l) => l.status === 'late').length;
  const absent = logs.filter((l) => l.status === 'absent').length;
  const leave = logs.filter((l) => l.status === 'leave').length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

  const studentName = student
    ? `${student.firstName} ${student.lastName && student.lastName !== '-' ? student.lastName : ''}`.trim()
    : 'Student';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0D4A28] to-[#1B6B3A] rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[#D4AF37] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Verified Attendance Register
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2">My Attendance History</h1>
        <p className="text-emerald-100 text-xs sm:text-sm mt-1">
          Attendance history and session verification for {studentName} ({(student as any)?.studentId || 'NIZ'})
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Attendance Rate</p>
          <p className={`text-2xl font-extrabold mt-1 ${rate >= 85 ? 'text-emerald-800' : 'text-rose-600'}`}>{rate}%</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {rate >= 85 ? 'Excellent record' : 'Needs attention'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Sessions</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{total}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Recorded to date</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Present / On Time</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{present + late}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {late > 0 ? `${late} late arrivals` : 'No late arrivals'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Absences</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{absent}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {leave > 0 ? `${leave} approved leaves` : 'Unexcused'}
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm">Verified Daily Session Logs</h2>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
            {total} Total Records
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No attendance records yet</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Attendance marked by faculty will display here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 uppercase tracking-wider border-b border-gray-200 font-semibold text-[11px]">
                  <th className="p-4">Date</th>
                  <th className="p-4">Campus / Branch</th>
                  <th className="p-4">Session</th>
                  <th className="p-4">Marked By</th>
                  <th className="p-4">Remarks</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-semibold text-gray-900 font-mono whitespace-nowrap">
                      {formatDate(log.date)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {log.branchId?.name || (student as any)?.primaryBranchId?.name || 'Main Campus'}
                    </td>
                    <td className="p-4">
                      {log.sessionLabel ? (
                        <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                          <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                          {log.sessionLabel}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {log.markedByName ? (
                        <span className="inline-flex items-center gap-1 text-gray-700">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {log.markedByName.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium">{log.markedByName}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <User className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500">
                      {log.notes || '—'}
                    </td>
                    <td className="p-4">
                      {log.status === 'present' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Present
                        </span>
                      )}
                      {log.status === 'late' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" /> Late Arrival
                        </span>
                      )}
                      {log.status === 'absent' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          <XCircle className="w-3.5 h-3.5" /> Absent
                        </span>
                      )}
                      {log.status === 'leave' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <Minus className="w-3.5 h-3.5" /> Approved Leave
                        </span>
                      )}
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
