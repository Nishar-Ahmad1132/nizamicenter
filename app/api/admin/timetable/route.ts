import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Timetable from '@/models/Timetable';
import AcademicYear from '@/models/AcademicYear';
import AuditLog from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');
    const divisionId = searchParams.get('divisionId');
    const day = searchParams.get('day');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };
    if (branchId) filter.branchId = branchId;
    if (divisionId) filter.divisionId = divisionId;
    if (day) filter.day = day.toLowerCase();

    const slots = await Timetable.find(filter)
      .populate('branchId', 'name')
      .populate('divisionId', 'name code slug')
      .populate('classId', 'name numericValue')
      .populate('courseId', 'name slug')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name phone')
      .populate('academicYearId', 'name')
      .sort({ day: 1, startTime: 1 })
      .lean();

    return NextResponse.json({ slots: JSON.parse(JSON.stringify(slots)) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    await dbConnect();

    const body = await req.json();
    const {
      branchId,
      divisionId,
      classId,
      courseId,
      subjectId,
      teacherId,
      day,
      startTime,
      endTime,
      room,
      status = 'active',
      academicYearId: providedAcademicYearId,
    } = body;

    if (!branchId || !divisionId || !teacherId || !day || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Branch, Division, Teacher, Day, Start Time, and End Time are required.' },
        { status: 400 }
      );
    }

    let academicYearId = providedAcademicYearId;
    if (!academicYearId) {
      const currentYear = await AcademicYear.findOne({ isCurrent: true, isActive: true }) ||
        await AcademicYear.findOne({ isActive: true });
      if (!currentYear) {
        return NextResponse.json({ error: 'No active academic year found in database.' }, { status: 400 });
      }
      academicYearId = currentYear._id;
    }

    const newSlot = await Timetable.create({
      branchId,
      divisionId,
      classId: classId || undefined,
      courseId: courseId || undefined,
      subjectId: subjectId || undefined,
      teacherId,
      day: day.toLowerCase(),
      startTime,
      endTime,
      room: room || undefined,
      status,
      academicYearId,
      isActive: true,
    });

    const populated = await Timetable.findById(newSlot._id)
      .populate('branchId', 'name')
      .populate('divisionId', 'name code slug')
      .populate('classId', 'name')
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .populate('teacherId', 'name')
      .lean();

    await AuditLog.create({
      userId: user.id,
      userRole: user.role,
      action: 'CREATE',
      entity: 'Timetable',
      entityId: newSlot._id.toString(),
      description: `Added timetable session for ${day} (${startTime}-${endTime})`,
      newValue: body,
    });

    return NextResponse.json(
      {
        success: true,
        slot: JSON.parse(JSON.stringify(populated)),
        message: 'Timetable slot created successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
