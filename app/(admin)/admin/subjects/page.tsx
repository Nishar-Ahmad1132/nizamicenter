import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Subject from '@/models/Subject';
import Division from '@/models/Division';
import ClassModel from '@/models/Class';
import SubjectsClient from '@/components/admin/SubjectsClient';

export default async function AdminSubjectsPage() {
  await requireAdmin();
  await dbConnect();

  const [rawSubjects, rawDivisions, rawClasses] = await Promise.all([
    Subject.find({ isActive: { $ne: false } })
      .populate('divisionId', 'name code')
      .populate('classIds', 'name numericValue')
      .sort({ name: 1 })
      .lean(),
    Division.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
    ClassModel.find({ isActive: true }).sort({ displayOrder: 1, numericValue: 1 }).lean(),
  ]);

  const subjects = JSON.parse(JSON.stringify(rawSubjects));
  const divisions = JSON.parse(JSON.stringify(rawDivisions));
  const classes = JSON.parse(JSON.stringify(rawClasses));

  return (
    <div className="space-y-6">
      <SubjectsClient
        initialSubjects={subjects}
        divisions={divisions}
        classes={classes}
      />
    </div>
  );
}
