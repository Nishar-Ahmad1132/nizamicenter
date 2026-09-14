import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Timetable from '@/models/Timetable';
import AuditLog from '@/models/AuditLog';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const slot = await Timetable.findById(id);
    if (!slot) {
      return NextResponse.json({ error: 'Timetable slot not found' }, { status: 404 });
    }

    const updatable = [
      'branchId', 'divisionId', 'classId', 'courseId', 'subjectId',
      'teacherId', 'day', 'startTime', 'endTime', 'room', 'status', 'academicYearId'
    ];

    for (const key of updatable) {
      if (body[key] !== undefined) {
        if (key === 'day') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (slot as any).day = body.day.toLowerCase();
        } else if (['classId', 'courseId', 'subjectId', 'room'].includes(key) && !body[key]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (slot as any)[key] = undefined;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (slot as any)[key] = body[key];
        }
      }
    }

    await slot.save();

    await AuditLog.create({
      userId: user.id,
      userRole: user.role,
      action: 'UPDATE',
      entity: 'Timetable',
      entityId: slot._id.toString(),
      description: `Updated timetable session ${slot._id}`,
      newValue: body,
    });

    const populated = await Timetable.findById(slot._id)
      .populate('branchId', 'name')
      .populate('divisionId', 'name code slug')
      .populate('classId', 'name')
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .populate('teacherId', 'name')
      .lean();

    return NextResponse.json({
      success: true,
      slot: JSON.parse(JSON.stringify(populated)),
      message: 'Timetable slot updated successfully.',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    await dbConnect();
    const { id } = await params;

    const slot = await Timetable.findById(id);
    if (!slot) {
      return NextResponse.json({ error: 'Timetable slot not found' }, { status: 404 });
    }

    // Soft delete
    slot.isActive = false;
    slot.status = 'inactive';
    await slot.save();

    await AuditLog.create({
      userId: user.id,
      userRole: user.role,
      action: 'DELETE',
      entity: 'Timetable',
      entityId: slot._id.toString(),
      description: `Removed timetable session ${slot.day} (${slot.startTime}-${slot.endTime})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Timetable slot deleted successfully.',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
