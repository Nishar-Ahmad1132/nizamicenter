import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import AdmissionApplication from '@/models/AdmissionApplication';
import Branch from '@/models/Branch';
import AcademicYear from '@/models/AcademicYear';
import Division from '@/models/Division';
import Class from '@/models/Class';
import Course from '@/models/Course';
import { notFound } from 'next/navigation';
import AdmissionReviewClient from '@/components/admin/AdmissionReviewClient';

export default async function AdmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  await dbConnect();

  const { id } = await params;

  const [application, branches, academicYears, divisions, classes, courses] = await Promise.all([
    AdmissionApplication.findById(id)
      .populate('preferredBranchId', 'name')
      .populate('divisionId', 'name code')
      .populate('classId', 'name')
      .populate('courseIds', 'name')
      .lean(),
    Branch.find({ isActive: true }).select('name area').sort({ displayOrder: 1 }).lean(),
    AcademicYear.find({ isActive: true }).select('name isCurrent').sort({ startDate: -1 }).lean(),
    Division.find({ isActive: true }).select('name code').sort({ displayOrder: 1 }).lean(),
    Class.find({ isActive: true }).select('name').sort({ numericValue: 1 }).lean(),
    Course.find({ isActive: true }).select('name').sort({ displayOrder: 1 }).lean(),
  ]);

  if (!application) {
    notFound();
  }

  return (
    <AdmissionReviewClient
      application={JSON.parse(JSON.stringify(application))}
      branches={JSON.parse(JSON.stringify(branches))}
      academicYears={JSON.parse(JSON.stringify(academicYears))}
      divisions={JSON.parse(JSON.stringify(divisions))}
      classes={JSON.parse(JSON.stringify(classes))}
      courses={JSON.parse(JSON.stringify(courses))}
    />
  );
}
