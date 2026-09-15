import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import BranchesClient from '@/components/admin/BranchesClient';

export default async function BranchesPage() {
  await requireAdmin();
  await dbConnect();

  const branches = JSON.parse(
    JSON.stringify(await Branch.find({}).sort({ displayOrder: 1 }).lean())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Branches</h1>
        <p className="text-xs text-gray-400 mt-1">
          Hover a card to Edit or Delete &nbsp;|&nbsp; Toggle Active/Inactive to show or hide on homepage
        </p>
      </div>
      <BranchesClient initialBranches={branches} />
    </div>
  );
}
