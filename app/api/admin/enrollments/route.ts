import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Enrollment from '@/models/Enrollment';
import { enrollmentSchema } from '@/validators/student';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();
    const { searchParams } = req.nextUrl;
    const studentId = searchParams.get('studentId');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };
    if (studentId) filter.studentId = studentId;

    const enrollments = await Enrollment.find(filter)
      .populate('studentId', 'firstName lastName studentId')
      .populate('divisionId', 'name code')
      .populate('branchId', 'name')
      .populate('classId', 'name numericValue')
      .populate('courseId', 'name')
      .populate('subjectIds', 'name code')
      .populate('academicYearId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ enrollments: JSON.parse(JSON.stringify(enrollments)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();
    const body = await req.json();
    const parsed = enrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const enrollment = await Enrollment.create({
      ...parsed.data,
      enrollmentDate: new Date(),
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      status: 'active',
      isActive: true,
    });

    return NextResponse.json({ enrollment: JSON.parse(JSON.stringify(enrollment)) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
