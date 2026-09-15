import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Course from '@/models/Course';
import Division from '@/models/Division';
import CoursesClient from '@/components/admin/CoursesClient';

export default async function CoursesPage() {
  await requireAdmin();
  await dbConnect();

  const [courses, divisions] = await Promise.all([
    Course.find({ isActive: true })
      .populate('divisionId', 'name code')
      .sort({ displayOrder: 1 })
      .lean(),
    Division.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
  ]);

  const data = JSON.parse(JSON.stringify(courses));
  const divisionData = JSON.parse(JSON.stringify(divisions));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Courses</h1>
        <p className="text-xs text-gray-400 mt-1">
          ⭐ Star = Featured on homepage &nbsp;|&nbsp; Edit or delete any course inline
        </p>
      </div>
      <CoursesClient initialCourses={data} divisions={divisionData} />
    </div>
  );
}
