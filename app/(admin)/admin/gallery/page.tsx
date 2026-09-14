import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Gallery from '@/models/Gallery';
import Branch from '@/models/Branch';
import { Images, Plus, Eye, EyeOff } from 'lucide-react';

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireAdmin();
  await dbConnect();

  const { category } = await searchParams;
  const filter: Record<string, unknown> = {};
  if (category && category !== 'all') {
    filter.category = category;
  }

  const images = await Gallery.find(filter)
    .populate('branchId', 'name')
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean();

  const items = JSON.parse(JSON.stringify(images));

  const categories = ['all', 'classes', 'events', 'branches', 'achievements', 'activities'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo & Media Gallery</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage media highlights, campus facilities, classroom sessions, and events
          </p>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {categories.map((cat) => (
          <a
            key={cat}
            href={`/admin/gallery${cat === 'all' ? '' : `?category=${cat}`}`}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              (!category && cat === 'all') || category === cat
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {cat}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
            <Images className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700">No media found in this category</p>
            <p className="text-xs text-gray-400 mt-1">Upload images to display in the public institute gallery</p>
          </div>
        ) : (
          items.map((img: {
            _id: string;
            url: string;
            caption?: { en?: string };
            category: string;
            isPublished: boolean;
            branchId?: { name: string };
          }) => (
            <div key={img._id} className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm group">
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.caption?.en || 'Gallery image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] capitalize backdrop-blur-sm">
                  {img.category}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {img.caption?.en || 'Untitled Image'}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{img.branchId?.name || 'All Campuses'}</span>
                  <span className={`flex items-center gap-0.5 ${img.isPublished ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {img.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {img.isPublished ? 'Live' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
