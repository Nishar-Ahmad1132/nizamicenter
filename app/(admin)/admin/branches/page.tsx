import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import Link from 'next/link';
import { Building2, Plus, MapPin, Phone } from 'lucide-react';

export default async function BranchesPage() {
  await requireAdmin();
  await dbConnect();
  const branches = JSON.parse(JSON.stringify(await Branch.find({}).sort({ displayOrder: 1 }).lean()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Branches</h1>
          <p className="text-sm text-gray-500 mt-0.5">{branches.length} branch{branches.length !== 1 ? 'es' : ''}</p>
        </div>
        <Link href="/admin/branches/add" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Branch
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {branches.map((b: any) => (
          <Link key={b._id} href={`/admin/branches/${b._id}`}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition group">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-dark group-hover:text-primary transition">{b.name}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.area}, {b.city}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {b.phone}</p>
            </div>
            <span className={`mt-3 inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
              b.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>{b.isActive ? 'Active' : 'Inactive'}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
