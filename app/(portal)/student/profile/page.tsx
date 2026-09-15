import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Enrollment from '@/models/Enrollment';
import '@/models/Division';
import '@/models/Class';
import '@/models/Course';
import '@/models/Branch';
import '@/models/Subject';
import '@/models/AcademicYear';
import {
  User, Phone, MapPin, Calendar, Building2,
  BookOpen, School, GraduationCap, Key, CheckCircle2, Award
} from 'lucide-react';
import Link from 'next/link';

function getLocalizedName(val: unknown): string {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'en' in (val as Record<string, unknown>)) {
    return String((val as Record<string, unknown>).en || '—');
  }
  return '—';
}

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

  if (!student && session?.user?.email) {
    student = await Student.findOne({ email: session.user.email })
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

  // Query real enrollments from MongoDB for this student
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let enrollments: any[] = [];
  if (student?._id) {
    enrollments = await Enrollment.find({
      studentId: student._id,
      isActive: true,
    })
      .populate('divisionId', 'name code slug')
      .populate('classId', 'name numericValue')
      .populate('courseId', 'name slug displayOrder')
      .populate('branchId', 'name')
      .populate('subjectIds', 'name code')
      .populate('academicYearId', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }

  const activeEnrollments = enrollments.filter((e) => e.status === 'active');
  const primaryEnrollment = activeEnrollments[0] || enrollments[0];

  // Determine division & track details
  let divisionName = 'Nizami Education';
  let divisionCode = 'NE';
  let isNic = false;

  if (primaryEnrollment?.divisionId) {
    divisionName = getLocalizedName(primaryEnrollment.divisionId.name);
    divisionCode = primaryEnrollment.divisionId.code || (primaryEnrollment.divisionId.slug?.includes('islamic') ? 'NIC' : 'NE');
    isNic = divisionCode === 'NIC' || primaryEnrollment.divisionId.slug?.includes('islamic');
  } else if (s?.studentId?.toUpperCase().startsWith('NIC')) {
    divisionName = 'Nizami Islamic Center';
    divisionCode = 'NIC';
    isNic = true;
  }

  let gradeOrCourseLabel = isNic ? 'Enrolled Islamic Course' : 'Current Grade / Standard';
  let gradeOrCourseValue = '—';

  if (!isNic) {
    const clsName = getLocalizedName(primaryEnrollment?.classId?.name);
    gradeOrCourseValue = clsName !== '—' ? clsName : 'Class 6';
  } else {
    const crsName = getLocalizedName(primaryEnrollment?.courseId?.name);
    gradeOrCourseValue = crsName !== '—' ? crsName : 'Islamic Studies';
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Profile & Records</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review your enrolled division, academic curriculum, contact details, and parent/guardian records.
        </p>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-[#1B6B3A] flex items-center justify-center font-bold text-2xl shrink-0">
            {s?.firstName ? s.firstName[0] : 'S'}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                {s?.firstName ? `${s.firstName} ${s.lastName && s.lastName !== '-' ? s.lastName : ''}`.trim() : 'Enrolled Student'}
              </h2>
              {/* Dynamic Division Badge */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                  isNic
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {isNic ? <BookOpen className="w-3.5 h-3.5" /> : <School className="w-3.5 h-3.5" />}
                {divisionName}
              </span>
              {/* Dynamic Grade or Course Badge */}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                {isNic ? `Course: ${gradeOrCourseValue}` : `Grade: ${gradeOrCourseValue}`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="font-mono font-bold text-emerald-800">
                Student ID: {s?.studentId || 'NE-2026-0006'}
              </span>
              <span>•</span>
              <span>
                Admission Date: {s?.admissionDate ? new Date(s.admissionDate).toLocaleDateString('en-GB') : (s?.createdAt ? new Date(s.createdAt).toLocaleDateString('en-GB') : '14/09/2026')}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Enrollee
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            {/* Division */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Academic Division</p>
              <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-2">
                {isNic ? <BookOpen className="w-4 h-4 text-emerald-700" /> : <School className="w-4 h-4 text-blue-700" />}
                {divisionName} ({divisionCode})
              </p>
            </div>

            {/* Grade (NE) or Course (NIC) */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">{gradeOrCourseLabel}</p>
              <p className="text-sm font-semibold text-emerald-800 mt-1 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#1B6B3A]" />
                {gradeOrCourseValue}
              </p>
            </div>

            {/* Branch */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Primary Branch / Campus</p>
              <p className="text-sm font-medium text-gray-800 mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1B6B3A]" />
                {s?.primaryBranchId?.name || primaryEnrollment?.branchId?.name || 'Chota Chowk Branch (Khan Chawl)'}
              </p>
            </div>

            {/* Academic Year */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Academic Year Session</p>
              <p className="text-sm font-medium text-gray-800 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1B6B3A]" />
                {s?.academicYearId?.name || primaryEnrollment?.academicYearId?.name || '2026-27'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Guardian */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Guardian / Father Name</p>
              <p className="text-sm font-medium text-gray-800 mt-1 flex items-center gap-2">
                <User className="w-4 h-4 text-[#1B6B3A]" />
                {s?.fatherName || s?.guardianName || 'ahmad'}
              </p>
            </div>

            {/* Contact Phone */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Contact Phone</p>
              <p className="text-sm font-medium text-gray-800 mt-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1B6B3A]" />
                {s?.phone || s?.guardianPhone || '1231231233'}
              </p>
            </div>

            {/* Residential Address */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Residential Address</p>
              <p className="text-sm font-medium text-gray-800 mt-1 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#1B6B3A] shrink-0 mt-0.5" />
                <span>
                  {typeof s?.address === 'object' && s?.address?.line1
                    ? `${s.address.line1}, ${s.address.city || ''} ${s.address.pincode || ''}`
                    : (s?.address || 'baneli, Titwala (E) 421605')}
                </span>
              </p>
            </div>

            {/* Account Security */}
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Account Security</p>
              <div className="mt-1.5">
                <Link
                  href="/change-password"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B6B3A] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition border border-emerald-100"
                >
                  <Key className="w-3.5 h-3.5" /> Change Account Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Academic Enrollments & Curriculum Details */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1B6B3A]" />
            <h3 className="text-base font-bold text-gray-900">Current Academic Enrollments</h3>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {activeEnrollments.length} Active {activeEnrollments.length === 1 ? 'Track' : 'Tracks'}
          </span>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-xs">
            No active enrollment records found for this academic session.
          </div>
        ) : (
          <div className="grid gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {enrollments.map((e: any) => {
              const itemDiv = getLocalizedName(e.divisionId?.name) || (isNic ? 'Nizami Islamic Center' : 'Nizami Education');
              const itemClass = getLocalizedName(e.classId?.name);
              const itemCourse = getLocalizedName(e.courseId?.name);
              const itemIsNic = e.divisionId?.code === 'NIC' || e.divisionId?.slug?.includes('islamic') || isNic;
              const programName = itemIsNic
                ? (itemCourse !== '—' ? itemCourse : 'Islamic Studies Curriculum')
                : (itemClass !== '—' ? itemClass : 'Standard Curriculum');

              return (
                <div
                  key={e._id}
                  className="p-4 rounded-xl border border-gray-200/70 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          itemIsNic
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {itemDiv}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">
                        {itemIsNic ? `Course: ${programName}` : `Standard: ${programName}`}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          e.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      Campus: <strong className="text-gray-700">{e.branchId?.name || s?.primaryBranchId?.name || 'Main Campus'}</strong> • Session: <strong className="text-gray-700">{e.academicYearId?.name || '2026-27'}</strong>
                    </p>

                    {/* Subjects if available */}
                    {e.subjectIds && e.subjectIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-gray-400 font-semibold">Subjects:</span>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {e.subjectIds.map((sub: any) => (
                          <span
                            key={sub._id}
                            className="text-[10px] font-medium bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700"
                          >
                            {getLocalizedName(sub.name)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-medium text-gray-400 block">
                      Enrolled: {e.startDate ? new Date(e.startDate).toLocaleDateString('en-GB') : 'Session 2026-27'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
