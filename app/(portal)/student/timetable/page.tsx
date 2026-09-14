import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Timetable from '@/models/Timetable';
import '@/models/Branch';
import '@/models/Division';
import '@/models/Class';
import '@/models/Course';
import '@/models/Subject';
import '@/models/Teacher';
import StudentTimetableClient from '@/components/student/StudentTimetableClient';

export default async function StudentTimetablePage() {
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

  const queryFilter: Record<string, unknown> = {
    isActive: true,
    status: 'active',
  };

  // If student has a branch assigned, prioritize their campus sessions
  if (student?.primaryBranchId?._id) {
    queryFilter.$or = [
      { branchId: student.primaryBranchId._id },
      { branchId: { $exists: true } },
    ];
  }

  const slots = await Timetable.find(queryFilter)
    .populate('branchId', 'name')
    .populate('divisionId', 'name code slug')
    .populate('classId', 'name numericValue')
    .populate('courseId', 'name slug')
    .populate('subjectId', 'name code')
    .populate('teacherId', 'name title')
    .sort({ startTime: 1 })
    .lean();

  const studentObj = student ? JSON.parse(JSON.stringify(student)) : null;
  const fullName = studentObj ? `${studentObj.firstName} ${studentObj.lastName && studentObj.lastName !== '-' ? studentObj.lastName : ''}`.trim() : 'Enrolled Student';
  const campus = studentObj?.primaryBranchId?.name || 'All Campuses';

  return (
    <StudentTimetableClient
      slots={JSON.parse(JSON.stringify(slots))}
      studentName={fullName}
      campusName={campus}
    />
  );
}
