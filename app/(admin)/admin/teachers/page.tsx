import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';
import Branch from '@/models/Branch';
import Subject from '@/models/Subject';
import TeachersClient from '@/components/admin/TeachersClient';

export default async function TeachersPage() {
  await requireAdmin();
  await dbConnect();

  const [teachers, branches, subjects] = await Promise.all([
    Teacher.find({ isActive: true })
      .populate('branchIds', 'name')
      .populate('subjectIds', 'name')
      .sort({ name: 1 })
      .lean(),
    Branch.find({ isActive: true }).select('name').sort({ displayOrder: 1 }).lean(),
    Subject.find({ status: 'active' }).select('name').sort({ 'name.en': 1 }).lean(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Teachers</h1>
        <p className="text-xs text-gray-400 mt-1">
          Add, edit, delete teachers &nbsp;|&nbsp; Toggle homepage visibility per teacher
        </p>
      </div>
      <TeachersClient
        initialTeachers={JSON.parse(JSON.stringify(teachers))}
        branches={JSON.parse(JSON.stringify(branches))}
        subjects={JSON.parse(JSON.stringify(subjects))}
      />
    </div>
  );
}
