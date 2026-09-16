import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import AcademicYear from '@/models/AcademicYear';
import Division from '@/models/Division';
import Course from '@/models/Course';
import ClassModel from '@/models/Class';
import AddStudentForm from '@/components/admin/AddStudentForm';

export default async function AddStudentPage() {
  await requireAdmin();
  await dbConnect();

  const [branches, academicYears, divisions, courses, classes] = await Promise.all([
    Branch.find({ isActive: true })
      .select('name area')
      .sort({ displayOrder: 1 })
      .lean(),
    AcademicYear.find({ isActive: true })
      .select('name isCurrent')
      .sort({ startDate: -1 })
      .lean(),
    Division.find({ isActive: true })
      .select('name code slug')
      .sort({ displayOrder: 1 })
      .lean(),
    Course.find({ isActive: true, status: 'active' })
      .select('name fee divisionId')
      .sort({ displayOrder: 1 })
      .lean(),
    ClassModel.find({ isActive: true, status: 'active' })
      .select('name fee numericValue divisionId')
      .sort({ displayOrder: 1, numericValue: 1 })
      .lean(),
  ]);

  return (
    <AddStudentForm
      branches={JSON.parse(JSON.stringify(branches))}
      academicYears={JSON.parse(JSON.stringify(academicYears))}
      divisions={JSON.parse(JSON.stringify(divisions))}
      courses={JSON.parse(JSON.stringify(courses))}
      classes={JSON.parse(JSON.stringify(classes))}
    />
  );
}
