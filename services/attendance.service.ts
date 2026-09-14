import dbConnect from '@/lib/db/mongoose';
import Attendance from '@/models/Attendance';
import type { IAttendance } from '@/models/Attendance';
import Enrollment from '@/models/Enrollment';
import Student from '@/models/Student';
import '@/models/Course';
import '@/models/Class';
import '@/models/Division';
import type { AttendanceStatus } from '@/models/Attendance';
import type { SessionUser } from '@/lib/auth/session';
import type { AnyBulkWriteOperation } from 'mongoose';

/**
 * Get all enrollments/students for a branch, program, or class on a given date.
 */
export async function getAttendanceSheet(params: {
  branchId: string;
  divisionId?: string;
  classId?: string;
  courseId?: string;
  date: Date;
}) {
  await dbConnect();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrollmentFilter: Record<string, any> = {
    branchId: params.branchId,
    status: 'active',
    isActive: true,
  };
  if (params.divisionId) enrollmentFilter.divisionId = params.divisionId;
  if (params.classId) enrollmentFilter.classId = params.classId;
  if (params.courseId) enrollmentFilter.courseId = params.courseId;

  const enrollments = await Enrollment.find(enrollmentFilter)
    .populate('studentId', 'firstName lastName studentId photo phone guardianPhone')
    .populate('courseId', 'name')
    .populate('classId', 'name numericValue')
    .populate('divisionId', 'name code')
    .lean();

  const enrolledStudentIds = new Set(
    enrollments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((e) => (e.studentId as any)?._id?.toString())
      .filter(Boolean)
  );

  // Only include un-enrolled students when viewing 'All Programs' (no division/class/course filter)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let extraStudents: any[] = [];
  if (!params.divisionId && !params.classId && !params.courseId) {
    const allEnrolledIds = await Enrollment.distinct('studentId', { status: 'active', isActive: true });
    extraStudents = await Student.find({
      primaryBranchId: params.branchId,
      status: 'active',
      isActive: true,
      _id: { $nin: allEnrolledIds },
    })
      .select('firstName lastName studentId photo phone guardianPhone')
      .lean();
  }

  // Get existing attendance for this date
  const dateStart = new Date(params.date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(params.date);
  dateEnd.setHours(23, 59, 59, 999);

  const allStudentIds = [
    ...Array.from(enrolledStudentIds),
    ...extraStudents.map((s) => s._id.toString()),
  ];

  const existingAttendance = await Attendance.find({
    studentId: { $in: allStudentIds },
    date: { $gte: dateStart, $lte: dateEnd },
  }).lean();

  const attendanceMap = new Map(
    existingAttendance.map((a) => [a.studentId.toString(), a])
  );

  const rows = [
    ...enrollments.map((enrollment) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = (enrollment as any).studentId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const courseName = (enrollment as any).courseId?.name?.en;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const className = (enrollment as any).classId?.name?.en || (enrollment as any).classId?.name;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const divName = (enrollment as any).divisionId?.name?.en;

      return {
        student: s,
        enrollmentId: enrollment._id.toString(),
        program: courseName || (className ? `Standard ${className}` : divName) || 'Enrolled Program',
        attendance: s?._id ? attendanceMap.get(s._id.toString()) ?? null : null,
      };
    }),
    ...extraStudents.map((student) => ({
      student,
      enrollmentId: undefined,
      program: 'Campus Batch',
      attendance: attendanceMap.get(student._id.toString()) ?? null,
    })),
  ];

  return rows.filter((r) => r.student && r.student._id);
}

/**
 * Save attendance for multiple students (upsert by studentId + date).
 */
export async function saveAttendanceBulk(
  records: Array<{
    enrollmentId?: string;
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }>,
  branchId: string,
  date: Date,
  actingUser: SessionUser
) {
  await dbConnect();

  const dateNorm = new Date(date);
  dateNorm.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const operations: AnyBulkWriteOperation<IAttendance>[] = records.map((record) => ({
    updateOne: {
      filter: { studentId: record.studentId, date: dateNorm } as any,
      update: {
        $set: {
          enrollmentId: record.enrollmentId || undefined,
          studentId: record.studentId,
          branchId,
          status: record.status,
          notes: record.notes,
          markedBy: actingUser.id,
          isEdited: true,
          editedBy: actingUser.id,
          editedAt: new Date(),
        },
        $setOnInsert: { date: dateNorm },
      } as any,
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(operations);
}

/**
 * Calculate attendance percentage for a student enrollment.
 */
export async function getAttendanceStats(enrollmentId: string) {
  await dbConnect();

  const stats = await Attendance.aggregate([
    { $match: { enrollmentId: { $eq: enrollmentId } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = { present: 0, absent: 0, late: 0, leave: 0, total: 0 };
  for (const s of stats) {
    counts[s._id as AttendanceStatus] = s.count;
    counts.total += s.count;
  }

  const effectivePresent = counts.present + counts.late;
  const percentage = counts.total > 0 ? Math.round((effectivePresent / counts.total) * 100) : 0;

  return { ...counts, percentage };
}
