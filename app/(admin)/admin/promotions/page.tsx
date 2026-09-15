import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import AcademicYear from '@/models/AcademicYear';
import Branch from '@/models/Branch';
import Division from '@/models/Division';
import ClassModel from '@/models/Class';
import Course from '@/models/Course';
import AdminPromotionsClient from '@/components/admin/AdminPromotionsClient';

export default async function AdminPromotionsPage() {
  await requireAdmin();
  await dbConnect();

  const [academicYears, branches, divisions, classes, courses] = await Promise.all([
    AcademicYear.find({ isActive: true }).sort({ startDate: -1 }).lean(),
    Branch.find({ isActive: true }).select('name').sort({ displayOrder: 1 }).lean(),
    Division.find({ isActive: true }).select('name code slug').sort({ displayOrder: 1 }).lean(),
    ClassModel.find({ isActive: true }).select('name divisionId numericValue').sort({ numericValue: 1 }).lean(),
    Course.find({ status: 'active' }).select('name divisionId slug').sort({ displayOrder: 1 }).lean(),
  ]);

  return (
    <AdminPromotionsClient
      academicYears={JSON.parse(JSON.stringify(academicYears))}
      branches={JSON.parse(JSON.stringify(branches))}
      divisions={JSON.parse(JSON.stringify(divisions))}
      classes={JSON.parse(JSON.stringify(classes))}
      courses={JSON.parse(JSON.stringify(courses))}
    />
  );
}
