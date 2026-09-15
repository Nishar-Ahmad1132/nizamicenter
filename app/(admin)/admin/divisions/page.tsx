import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Division from '@/models/Division';
import Course from '@/models/Course';
import Class from '@/models/Class';
import AdminDivisionsClient from '@/components/admin/AdminDivisionsClient';

export default async function AdminDivisionsPage() {
  await requireAdmin();
  await dbConnect();

  const [divisions, totalCourses, totalClasses] = await Promise.all([
    Division.find({}).sort({ displayOrder: 1 }).lean(),
    Course.countDocuments({ isActive: true }),
    Class.countDocuments({ isActive: true }),
  ]);

  const items = JSON.parse(JSON.stringify(divisions));

  return (
    <AdminDivisionsClient
      initialDivisions={items}
      totalCourses={totalCourses}
      totalClasses={totalClasses}
    />
  );
}
