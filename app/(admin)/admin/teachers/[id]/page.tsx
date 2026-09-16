import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';
import Branch from '@/models/Branch';
import Subject from '@/models/Subject';
import Course from '@/models/Course';
import Timetable from '@/models/Timetable';
import '@/models/User';
import '@/models/Class';
import TeacherProfileClient from '@/components/admin/TeacherProfileClient';

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  await dbConnect();

  const { id } = await params;

  const [teacher, branches, subjects, courses, timetableSlots] = await Promise.all([
    Teacher.findById(id)
      .populate('userId', 'username email role isActive')
      .populate('branchIds', 'name address')
      .populate('subjectIds', 'name code')
      .populate('courseIds', 'name category fee duration')
      .lean(),
    Branch.find({ isActive: true }).select('name address').sort({ displayOrder: 1 }).lean(),
    Subject.find({ status: 'active' }).select('name code').sort({ 'name.en': 1 }).lean(),
    Course.find({ isActive: true, status: 'active' })
      .select('name category fee duration')
      .sort({ displayOrder: 1 })
      .lean(),
    Timetable.find({ teacherId: id, isActive: true })
      .populate('branchId', 'name')
      .populate('subjectId', 'name code')
      .populate('courseId', 'name')
      .populate('classId', 'name numericValue')
      .sort({ day: 1, startTime: 1 })
      .lean(),
  ]);

  if (!teacher || !teacher.isActive) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <TeacherProfileClient
        initialTeacher={JSON.parse(JSON.stringify(teacher))}
        branches={JSON.parse(JSON.stringify(branches))}
        subjects={JSON.parse(JSON.stringify(subjects))}
        courses={JSON.parse(JSON.stringify(courses))}
        timetableSlots={JSON.parse(JSON.stringify(timetableSlots))}
      />
    </div>
  );
}
