import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Enquiry from '@/models/Enquiry';
import '@/models/Branch';
import AdminEnquiriesClient from '@/components/admin/AdminEnquiriesClient';

export default async function AdminEnquiriesPage() {
  await requireAdmin();
  await dbConnect();

  const [enquiries, totalCount, newCount, followupCount, convertedCount, resolvedCount] = await Promise.all([
    Enquiry.find({})
      .populate('branchId', 'name')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    Enquiry.countDocuments({}),
    Enquiry.countDocuments({ status: 'new' }),
    Enquiry.countDocuments({ status: 'followup' }),
    Enquiry.countDocuments({ status: 'converted' }),
    Enquiry.countDocuments({ status: 'resolved' }),
  ]);

  const items = JSON.parse(JSON.stringify(enquiries));

  return (
    <AdminEnquiriesClient
      initialEnquiries={items}
      counts={{
        total: totalCount,
        new: newCount,
        followup: followupCount,
        converted: convertedCount,
        resolved: resolvedCount,
      }}
    />
  );
}
