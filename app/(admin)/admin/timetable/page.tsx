import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Timetable from '@/models/Timetable';
import Branch from '@/models/Branch';
import Division from '@/models/Division';
import ClassModel from '@/models/Class';
import Subject from '@/models/Subject';
import Teacher from '@/models/Teacher';
import Course from '@/models/Course';
import AcademicYear from '@/models/AcademicYear';
import AdminTimetableClient from '@/components/admin/AdminTimetableClient';

export default async function AdminTimetablePage() {
  await requireAdmin();
  await dbConnect();

  const [
    timetableSlots,
    divisions,
    branches,
    classes,
    courses,
    subjects,
    teachers,
    academicYear,
  ] = await Promise.all([
    Timetable.find({ isActive: true })
      .populate('branchId', 'name')
      .populate('divisionId', 'name code slug')
      .populate('classId', 'name numericValue')
      .populate('courseId', 'name slug')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name title phone')
      .sort({ day: 1, startTime: 1 })
      .lean(),
    Division.find({ isActive: true }).select('name code slug').sort({ displayOrder: 1 }).lean(),
    Branch.find({ isActive: true }).select('name').sort({ displayOrder: 1 }).lean(),
    ClassModel.find({ isActive: true }).select('name divisionId numericValue').sort({ numericValue: 1 }).lean(),
    Course.find({ status: 'active' }).select('name divisionId slug').sort({ displayOrder: 1 }).lean(),
    Subject.find({ status: 'active' }).select('name divisionId code').lean(),
    Teacher.find({ status: 'active' }).select('name title phone').sort({ name: 1 }).lean(),
    AcademicYear.findOne({ isCurrent: true, isActive: true }).select('_id name').lean(),
  ]);

  const defaultYear = academicYear || (await AcademicYear.findOne({ isActive: true }).select('_id name').lean());

  return (
    <AdminTimetableClient
      initialSlots={JSON.parse(JSON.stringify(timetableSlots))}
      divisions={JSON.parse(JSON.stringify(divisions))}
      branches={JSON.parse(JSON.stringify(branches))}
      classes={JSON.parse(JSON.stringify(classes))}
      courses={JSON.parse(JSON.stringify(courses))}
      subjects={JSON.parse(JSON.stringify(subjects))}
      teachers={JSON.parse(JSON.stringify(teachers))}
      currentAcademicYearId={defaultYear ? defaultYear._id.toString() : ''}
    />
  );
}
