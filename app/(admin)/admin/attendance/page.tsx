import { requireTeacher } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import Division from '@/models/Division';
import Course from '@/models/Course';
import ClassModel from '@/models/Class';
import AdminAttendanceClient from '@/components/admin/AdminAttendanceClient';

export default async function AdminAttendancePage() {
  await requireTeacher();
  await dbConnect();

  const [branches, divisions, courses, classes] = await Promise.all([
    Branch.find({ isActive: true }).select('name').sort({ displayOrder: 1 }).lean(),
    Division.find({ isActive: true }).select('name code slug').sort({ displayOrder: 1 }).lean(),
    Course.find({ status: 'active' }).select('name divisionId slug').sort({ displayOrder: 1 }).lean(),
    ClassModel.find({ isActive: true }).select('name divisionId numericValue').sort({ numericValue: 1 }).lean(),
  ]);

  return (
    <AdminAttendanceClient
      branches={JSON.parse(JSON.stringify(branches))}
      divisions={JSON.parse(JSON.stringify(divisions))}
      courses={JSON.parse(JSON.stringify(courses))}
      classes={JSON.parse(JSON.stringify(classes))}
    />
  );
}
