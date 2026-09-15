import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import ClassModel from '@/models/Class';
import Division from '@/models/Division';
import ClassesClient from '@/components/admin/ClassesClient';

export default async function ClassesPage() {
  await requireAdmin();
  await dbConnect();

  const [classes, divisions] = await Promise.all([
    ClassModel.find({})
      .populate('divisionId', 'name code')
      .sort({ displayOrder: 1, numericValue: 1 })
      .lean(),
    Division.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
  ]);

  const data = JSON.parse(JSON.stringify(classes));
  const divisionData = JSON.parse(JSON.stringify(divisions));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Classes</h1>
        <p className="text-xs text-gray-400 mt-1">Hover over any class card to Edit or Delete it</p>
      </div>
      <ClassesClient initialClasses={data} divisions={divisionData} />
    </div>
  );
}
