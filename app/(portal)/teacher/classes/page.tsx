import { auth } from '@/lib/auth';
import { getEffectiveTeacher } from '@/lib/auth/teacher';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';
import Enrollment from '@/models/Enrollment';
import '@/models/Student';
import '@/models/Branch';
import '@/models/Course';
import '@/models/Subject';
import Link from 'next/link';
import { BookOpen, Users, Building2, CalendarCheck, GraduationCap, Phone } from 'lucide-react';

function getItemName(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item.name === 'string') return item.name;
  if (typeof item.name === 'object' && item.name) {
    return item.name.en || item.name.hi || item.name.ur || '';
  }
  return '';
}

export default async function TeacherClassesPage() {
  const session = await auth();
  const rawTeacher = await getEffectiveTeacher(session?.user as any);
  let teacher: any = null;
  if (rawTeacher) {
    teacher = await Teacher.findById(rawTeacher._id)
      .populate('branchIds', 'name')
      .populate('subjectIds', 'name code')
      .populate('courseIds', 'name category fee duration')
      .lean();
  }

  if (!teacher) {
    return <div className="p-8 text-center text-gray-500">Teacher not found.</div>;
  }

  const teacherBranchIds = (teacher.branchIds || []).map((b: any) => b._id);
  const teacherCourseIds = (teacher.courseIds || []).map((c: any) => c._id);
  const teacherSubjectIds = (teacher.subjectIds || []).map((s: any) => s._id);

  // Fetch real enrollments across teacher's assigned branches, courses, and subjects
  const enrollments = await Enrollment.find({
    isActive: true,
    $or: [
      { courseId: { $in: teacherCourseIds } },
      { subjectIds: { $in: teacherSubjectIds } },
      { branchId: { $in: teacherBranchIds } },
    ],
  })
    .populate('studentId', 'studentId firstName lastName phone gender status')
    .populate('divisionId', 'code name')
    .populate('branchId', 'name')
    .populate('courseId', 'name duration')
    .populate('classId', 'name numericValue')
    .populate('subjectIds', 'name code')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Allocated Classes &amp; Students</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review all courses and student cohorts assigned to you across branches.
        </p>
      </div>

      {/* Cohorts Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Islamic Courses */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900">Assigned Islamic Courses (NIC)</h2>
          </div>
          {teacher.courseIds && teacher.courseIds.length > 0 ? (
            <div className="space-y-3">
              {teacher.courseIds.map((c: any) => {
                const count = enrollments.filter(
                  (e: any) => e.courseId?._id?.toString() === c._id.toString()
                ).length;
                return (
                  <div
                    key={c._id}
                    className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-sm text-emerald-950">{getItemName(c)}</p>
                      <p className="text-xs text-emerald-700 mt-0.5">{c.duration || 'Standard Term'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {count} Enrolled
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No Islamic courses assigned.</p>
          )}
        </div>

        {/* Academic Subjects */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-gray-900">Assigned Academic Subjects (NE)</h2>
          </div>
          {teacher.subjectIds && teacher.subjectIds.length > 0 ? (
            <div className="space-y-3">
              {teacher.subjectIds.map((s: any) => (
                <div
                  key={s._id}
                  className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-sm text-purple-950">{getItemName(s) || s.code}</p>
                    <p className="text-xs text-purple-700 mt-0.5">Code: {s.code || 'NE-SUB'}</p>
                  </div>
                  <Link
                    href="/teacher/attendance"
                    className="text-xs font-bold text-purple-800 bg-white px-2.5 py-1 rounded-lg border border-purple-200 hover:bg-purple-100 transition"
                  >
                    Take Attendance &rarr;
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No academic subjects assigned.</p>
          )}
        </div>
      </div>

      {/* Enrolled Students Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Students in Your Assigned Cohorts</h2>
            <p className="text-xs text-gray-500 mt-0.5">{enrollments.length} total active enrollments</p>
          </div>
          <Link
            href="/teacher/attendance"
            className="px-4 py-2 bg-[#1B6B3A] text-white text-xs font-bold rounded-xl hover:bg-[#14522c] transition flex items-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5" /> Mark Cohort Attendance
          </Link>
        </div>

        {enrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 font-semibold border-b">
                <tr>
                  <th className="px-5 py-3">Student ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Division</th>
                  <th className="px-5 py-3">Campus</th>
                  <th className="px-5 py-3">Course / Class</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrollments.map((e: any) => {
                  const s = e.studentId;
                  if (!s) return null;
                  const isNIC = e.divisionId?.code === 'NIC' || !!e.courseId;
                  const cohortLabel = isNIC
                    ? getItemName(e.courseId) || 'Islamic Course'
                    : `${getItemName(e.classId) || 'Academic'}${
                        e.subjectIds && e.subjectIds.length > 0
                          ? ` (${e.subjectIds.map((sub: any) => getItemName(sub) || sub.code).join(', ')})`
                          : ''
                      }`;

                  return (
                    <tr key={e._id} className="hover:bg-gray-50/80 transition">
                      <td className="px-5 py-3 font-mono font-bold text-xs text-[#1B6B3A]">
                        {s.studentId}
                      </td>
                      <td className="px-5 py-3 font-semibold text-dark">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isNIC
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {isNIC ? '🕌 NIC' : '📚 NE'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600">
                        {e.branchId?.name || '—'}
                      </td>
                      <td className="px-5 py-3 text-xs font-medium text-gray-700">
                        {cohortLabel}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {s.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {s.phone}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 text-sm">
            No enrolled students found in your assigned courses and campuses.
          </div>
        )}
      </div>
    </div>
  );
}
