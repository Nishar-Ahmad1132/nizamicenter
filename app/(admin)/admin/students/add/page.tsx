import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import AcademicYear from '@/models/AcademicYear';
import AddStudentForm from '@/components/admin/AddStudentForm';

export default async function AddStudentPage() {
  await requireAdmin();
  await dbConnect();

  const [branches, academicYears] = await Promise.all([
    Branch.find({ isActive: true })
      .select('name area')
      .sort({ displayOrder: 1 })
      .lean(),
    AcademicYear.find({ isActive: true })
      .select('name isCurrent')
      .sort({ startDate: -1 })
      .lean(),
  ]);

  return (
    <AddStudentForm
      branches={JSON.parse(JSON.stringify(branches))}
      academicYears={JSON.parse(JSON.stringify(academicYears))}
    />
  );
}
