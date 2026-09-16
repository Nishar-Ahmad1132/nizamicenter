import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import Subject from '@/models/Subject';
import Course from '@/models/Course';
import AddTeacherForm from '@/components/admin/AddTeacherForm';

export default async function AddTeacherPage() {
  await requireAdmin();
  await dbConnect();

  const [branches, subjects, courses] = await Promise.all([
    Branch.find({ isActive: true }).select('name').sort({ displayOrder: 1 }).lean(),
    Subject.find({ status: 'active' }).select('name code').sort({ 'name.en': 1 }).lean(),
    Course.find({ isActive: true, status: 'active' }).select('name').sort({ displayOrder: 1 }).lean(),
  ]);

  return (
    <AddTeacherForm
      branches={JSON.parse(JSON.stringify(branches))}
      subjects={JSON.parse(JSON.stringify(subjects))}
      courses={JSON.parse(JSON.stringify(courses))}
    />
  );
}
