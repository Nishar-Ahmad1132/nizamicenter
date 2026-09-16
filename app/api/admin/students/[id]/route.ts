import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import Attendance from '@/models/Attendance';
import FeeRecord from '@/models/FeeRecord';
import AuditLog from '@/models/AuditLog';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;

    const student = await Student.findById(id)
      .populate('primaryBranchId', 'name slug')
      .populate('academicYearId', 'name')
      .lean();

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const enrollments = await Enrollment.find({ studentId: id, isActive: true })
      .populate('divisionId', 'name code')
      .populate('branchId', 'name')
      .populate('classId', 'name numericValue')
      .populate('courseId', 'name')
      .populate('subjectIds', 'name code')
      .populate('academicYearId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const feeRecords = await FeeRecord.find({ studentId: id, isActive: true })
      .sort({ dueDate: -1 })
      .limit(12)
      .lean();

    const attendanceStats = await Attendance.aggregate([
      { $match: { studentId: student._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      student: JSON.parse(JSON.stringify(student)),
      enrollments: JSON.parse(JSON.stringify(enrollments)),
      feeRecords: JSON.parse(JSON.stringify(feeRecords)),
      attendanceStats,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actingUser = await requireAdmin();
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Allowed updatable fields
    const updatableFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'photo',
      'phone', 'whatsapp', 'email', 'address', 'fatherName', 'motherName',
      'guardianName', 'guardianPhone', 'primaryBranchId', 'status', 'notes',
    ];

    for (const key of updatableFields) {
      if (body[key] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (student as any)[key] = body[key];
      }
    }

    await student.save();

    // Synchronize with User account if email or status changed
    if (student.userId) {
      const userUpdate: Record<string, unknown> = {};
      if (body.email !== undefined) userUpdate.email = body.email || undefined;
      if (body.status !== undefined) userUpdate.isActive = body.status === 'active';
      if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(student.userId, userUpdate);
      }
    }

    // Synchronize Enrollment if courseId, classId, or divisionCode provided
    if (body.courseId !== undefined || body.classId !== undefined || body.divisionCode) {
      const Division = (await import('@/models/Division')).default;
      let divId = body.divisionId;
      if (!divId && body.divisionCode) {
        const div = await Division.findOne({ code: body.divisionCode.toUpperCase() });
        divId = div?._id;
      }

      const activeEnrollment = await Enrollment.findOne({ studentId: student._id, isActive: true }).sort({ createdAt: -1 });
      if (activeEnrollment) {
        if (divId) activeEnrollment.divisionId = divId;
        if (student.primaryBranchId) activeEnrollment.branchId = student.primaryBranchId;
        activeEnrollment.courseId = body.courseId || undefined;
        activeEnrollment.classId = body.classId || undefined;
        await activeEnrollment.save();
      } else if (divId) {
        await Enrollment.create({
          studentId: student._id,
          divisionId: divId,
          branchId: student.primaryBranchId,
          academicYearId: student.academicYearId,
          courseId: body.courseId || undefined,
          classId: body.classId || undefined,
          enrollmentDate: new Date(),
          startDate: new Date(),
          status: 'active',
          isActive: true,
        });
      }
    }

    // Audit log
    await AuditLog.create({
      userId: actingUser.id,
      userRole: actingUser.role,
      action: 'UPDATE',
      entity: 'Student',
      entityId: student._id.toString(),
      description: `Updated student ${student.studentId} - ${student.firstName} ${student.lastName}`,
      newValue: body,
    });

    const updated = await Student.findById(id)
      .populate('primaryBranchId', 'name')
      .populate('academicYearId', 'name')
      .lean();

    return NextResponse.json({
      success: true,
      student: JSON.parse(JSON.stringify(updated)),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actingUser = await requireAdmin();
    await dbConnect();
    const { id } = await params;

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Soft delete student record
    student.isActive = false;
    student.deletedAt = new Date();
    student.status = 'inactive';
    await student.save();

    // Deactivate associated user login
    if (student.userId) {
      await User.findByIdAndUpdate(student.userId, {
        isActive: false,
        deletedAt: new Date(),
      });
    }

    // Drop active enrollments
    await Enrollment.updateMany(
      { studentId: student._id, isActive: true },
      { isActive: false, status: 'dropped' }
    );

    // Audit log
    await AuditLog.create({
      userId: actingUser.id,
      userRole: actingUser.role,
      action: 'DELETE',
      entity: 'Student',
      entityId: student._id.toString(),
      description: `Removed student ${student.studentId} - ${student.firstName} ${student.lastName}`,
    });

    return NextResponse.json({
      success: true,
      message: `Student ${student.studentId} (${student.firstName} ${student.lastName}) has been removed successfully.`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
