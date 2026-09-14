import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import { User, Phone, Mail, MapPin, Calendar, Building2, Shield, Key } from 'lucide-react';
import Link from 'next/link';

export default async function StudentProfilePage() {
  const session = await auth();
  await dbConnect();

  let student = null;
  if (session?.user?.id) {
    student = await Student.findOne({ userId: session.user.id })
      .populate('primaryBranchId', 'name address')
      .populate('academicYearId', 'name')
      .lean();
  }

  if (!student) {
    student = await Student.findOne({ status: 'active' })
      .populate('primaryBranchId', 'name address')
      .populate('academicYearId', 'name')
      .lean();
  }

  const s = student ? JSON.parse(JSON.stringify(student)) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Profile & Records</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review your enrolled credentials, contact details, and parent/guardian records.
        </p>
      </div>

      {/* Main Profile Details */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-[#1B6B3A] flex items-center justify-center font-bold text-2xl shrink-0">
            {s?.firstName ? s.firstName[0] : 'S'}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">
              {s?.firstName ? `${s.firstName} ${s.lastName || ''}` : 'Enrolled Student'}
            </h2>
            <p className="text-xs text-emerald-700 font-semibold">
              Student ID: {s?.studentId || 'NIZ-2026-0042'}
            </p>
            <p className="text-xs text-gray-500">
              Admission Date: {s?.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : '01 August 2025'}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Primary Branch / Campus</p>
              <p className="text-sm font-medium text-gray-800 mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1B6B3A]" />
                {s?.primaryBranchId?.name || 'Main Campus'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Academic Year</p>
              <p className="text-sm font-medium text-gray-800 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1B6B3A]" />
                {s?.academicYearId?.name || '2025-2026 Session'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Guardian / Father Name</p>
              <p className="text-sm font-medium text-gray-800 mt-1 flex items-center gap-2">
                <User className="w-4 h-4 text-[#1B6B3A]" />
                {s?.fatherName || s?.guardianName || 'Tariq Khan'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Contact Phone</p>
              <p className="text-sm font-medium text-gray-800 mt-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1B6B3A]" />
                {s?.phone || s?.guardianPhone || '+91 98765 43210'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Residential Address</p>
              <p className="text-sm font-medium text-gray-800 mt-1 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#1B6B3A] shrink-0 mt-0.5" />
                <span>
                  {s?.address?.line1 || 'Near Jama Masjid Enclave'}, {s?.address?.city || 'Delhi NCR'} {s?.address?.pincode || '110025'}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Account Security</p>
              <div className="mt-2">
                <Link
                  href="/change-password"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B6B3A] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
                >
                  <Key className="w-3.5 h-3.5" /> Change Account Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
