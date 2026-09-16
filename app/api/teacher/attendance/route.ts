import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import mongoose from 'mongoose';
import Teacher from '@/models/Teacher';
import Attendance from '@/models/Attendance';
import Enrollment from '@/models/Enrollment';

/**
 * GET /api/teacher/attendance?date=YYYY-MM-DD&branchId=xxx&courseId=yyy
 * Returns enrolled students for the teacher's cohort with today's attendance status
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireTeacher();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const branchId = searchParams.get('branchId');
    const courseId = searchParams.get('courseId');

    const date = new Date(dateStr);
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);

    // Find teacher record from user session
    const teacher = await Teacher.findOne({ userId: user.id, isActive: true })
      .populate('branchIds', 'name')
      .populate('courseIds', 'name')
      .lean();

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const branchIds = (teacher.branchIds as any[]).map((b: any) => b._id);
    const courseIds = (teacher.courseIds as any[]).map((c: any) => c._id);

    // Build filter: if specific branch/course requested, use those; else use all teacher's allocations
    const enrollmentFilter: Record<string, unknown> = { isActive: true };
    if (branchId) {
      enrollmentFilter.branchId = branchId;
    } else {
      enrollmentFilter.branchId = { $in: branchIds };
    }
    if (courseId) {
      enrollmentFilter.courseId = courseId;
    } else if (courseIds.length > 0) {
      enrollmentFilter.courseId = { $in: courseIds };
    }

    const enrollments = await Enrollment.find(enrollmentFilter)
      .populate({ path: 'studentId', select: 'studentId firstName lastName phone gender status' })
      .populate('branchId', 'name')
      .populate('courseId', 'name')
      .lean();

    // Get existing attendance records for this date
    const studentIds = enrollments.map((e: any) => e.studentId?._id).filter(Boolean);
    const existingAttendance = await Attendance.find({
      studentId: { $in: studentIds },
      date: { $gte: dayStart, $lte: dayEnd },
    }).lean();

    const attendanceMap: Record<string, string> = {};
    for (const a of existingAttendance) {
      attendanceMap[a.studentId.toString()] = a.status;
    }

    const students = enrollments
      .filter((e: any) => e.studentId)
      .map((e: any) => ({
        _id: e.studentId._id.toString(),
        studentId: e.studentId.studentId,
        name: `${e.studentId.firstName} ${e.studentId.lastName}`.trim(),
        phone: e.studentId.phone || '',
        gender: e.studentId.gender || 'male',
        branch: e.branchId?.name || '',
        course: typeof e.courseId === 'object' && e.courseId?.name ? (e.courseId.name.en || e.courseId.name) : '',
        attendanceStatus: attendanceMap[e.studentId._id.toString()] || 'present',
        hasRecord: !!attendanceMap[e.studentId._id.toString()],
      }));

    return NextResponse.json({
      teacher: { _id: teacher._id, name: teacher.name, branchIds: teacher.branchIds, courseIds: teacher.courseIds },
      date: dateStr,
      students,
      alreadySaved: students.every((s) => s.hasRecord) && students.length > 0,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

/**
 * POST /api/teacher/attendance
 * Saves attendance for the teacher's session
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireTeacher();
    await dbConnect();

    const body = await req.json();
    const { date, entries } = body as {
      date: string;
      entries: { studentId: string; status: string; notes?: string }[];
    };

    if (!date || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'date and entries are required' }, { status: 400 });
    }

    // Find teacher and a valid branch for markedBy lookup
    const teacher = await Teacher.findOne({ userId: user.id, isActive: true }).lean();
    const fallbackTeacher = teacher || (await Teacher.findOne({ isActive: true }).lean());
    if (!fallbackTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(12, 0, 0, 0); // noon to avoid TZ issues

    const branchId = (fallbackTeacher.branchIds as any[])?.[0] ?? null;

    const ops = entries.map((entry) => ({
      updateOne: {
        filter: {
          studentId: new mongoose.Types.ObjectId(entry.studentId),
          date: {
            $gte: new Date(date + 'T00:00:00.000Z'),
            $lte: new Date(date + 'T23:59:59.999Z'),
          },
        },
        update: {
          $set: {
            studentId: new mongoose.Types.ObjectId(entry.studentId),
            branchId: branchId ? new mongoose.Types.ObjectId(branchId.toString()) : undefined,
            date: attendanceDate,
            status: entry.status,
            markedBy: new mongoose.Types.ObjectId(user.id),
            notes: entry.notes || '',
            isEdited: false,
          },
        },
        upsert: true,
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await Attendance.bulkWrite(ops as any);

    return NextResponse.json({
      success: true,
      saved: result.upsertedCount + result.modifiedCount + result.matchedCount,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
