import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/auth/session';
import { getEffectiveTeacher } from '@/lib/auth/teacher';
import dbConnect from '@/lib/db/mongoose';
import mongoose from 'mongoose';
import Teacher from '@/models/Teacher';
import Attendance from '@/models/Attendance';
import Enrollment from '@/models/Enrollment';
import Division from '@/models/Division';
import '@/models/Class';
import '@/models/Subject';
import '@/models/Course';
import '@/models/Branch';
import '@/models/Student';

function getItemName(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item.name === 'string') return item.name;
  if (typeof item.name === 'object' && item.name) {
    return item.name.en || item.name.hi || item.name.ur || '';
  }
  return '';
}

/**
 * GET /api/teacher/attendance?date=YYYY-MM-DD&division=NIC|NE&branchId=xxx&courseId=yyy&subjectId=zzz
 * Returns enrolled students for the teacher's cohort with today's attendance status
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireTeacher();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const divisionCode = (searchParams.get('division') || '').toUpperCase().trim();
    const branchId = searchParams.get('branchId') || '';
    const courseId = searchParams.get('courseId') || '';
    const subjectId = searchParams.get('subjectId') || '';

    const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const dayStart = new Date(`${cleanDateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${cleanDateStr}T23:59:59.999Z`);

    // Find teacher record from user session
    const rawTeacher = await getEffectiveTeacher(user);
    if (!rawTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const teacher = await Teacher.findById(rawTeacher._id)
      .populate('branchIds', 'name shortName')
      .populate('courseIds', 'name category fee duration')
      .populate('subjectIds', 'name code')
      .lean();

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const branchIds = ((teacher.branchIds as any[]) || []).map((b: any) => b._id || b);
    const courseIds = ((teacher.courseIds as any[]) || []).map((c: any) => c._id || c);
    const subjectIds = ((teacher.subjectIds as any[]) || []).map((s: any) => s._id || s);

    // Fetch active divisions
    const allDivisions = await Division.find({ isActive: true }).select('code name slug').lean();
    const nicDiv = allDivisions.find((d) => d.code === 'NIC');
    const neDiv = allDivisions.find((d) => d.code === 'NE');

    // Build filter
    const enrollmentFilter: Record<string, any> = { isActive: true };

    if (branchId) {
      enrollmentFilter.branchId = branchId;
    } else if (branchIds.length > 0) {
      enrollmentFilter.branchId = { $in: branchIds };
    }

    if (divisionCode === 'NIC' && nicDiv) {
      enrollmentFilter.divisionId = nicDiv._id;
      if (courseId) {
        enrollmentFilter.courseId = courseId;
      } else if (courseIds.length > 0) {
        enrollmentFilter.courseId = { $in: courseIds };
      }
    } else if (divisionCode === 'NE' && neDiv) {
      enrollmentFilter.divisionId = neDiv._id;
      if (subjectId) {
        enrollmentFilter.subjectIds = subjectId;
      }
    } else {
      // All Divisions
      if (courseId) {
        enrollmentFilter.courseId = courseId;
      } else if (subjectId) {
        enrollmentFilter.subjectIds = subjectId;
      }
    }

    const enrollments = await Enrollment.find(enrollmentFilter)
      .populate({ path: 'studentId', select: 'studentId firstName lastName phone gender status' })
      .populate('divisionId', 'code name')
      .populate('branchId', 'name')
      .populate('courseId', 'name category')
      .populate('classId', 'name numericValue')
      .populate('subjectIds', 'name code')
      .sort({ createdAt: -1 })
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
      .map((e: any) => {
        const divCode = e.divisionId?.code || (e.courseId ? 'NIC' : 'NE');
        const divName = getItemName(e.divisionId) || (divCode === 'NIC' ? 'Nizami Islamic Center' : 'Nizami Education');

        let cohortDetails = '';
        if (divCode === 'NIC') {
          cohortDetails = getItemName(e.courseId) || 'Islamic Course';
        } else {
          const className = getItemName(e.classId) || 'Academic';
          const subNames = (e.subjectIds || []).map((s: any) => getItemName(s) || s.code).filter(Boolean);
          cohortDetails = subNames.length > 0 ? `${className} (${subNames.join(', ')})` : className;
        }

        return {
          _id: e.studentId._id.toString(),
          studentId: e.studentId.studentId,
          enrollmentId: e._id.toString(),
          branchId: (e.branchId?._id || e.branchId)?.toString() || '',
          name: `${e.studentId.firstName} ${e.studentId.lastName}`.trim(),
          phone: e.studentId.phone || '',
          gender: e.studentId.gender || 'male',
          branch: e.branchId?.name || '',
          divisionCode: divCode,
          divisionName: divName,
          cohortDetails,
          attendanceStatus: attendanceMap[e.studentId._id.toString()] || 'present',
          hasRecord: !!attendanceMap[e.studentId._id.toString()],
        };
      });

    return NextResponse.json({
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        branchIds: teacher.branchIds,
        courseIds: teacher.courseIds,
        subjectIds: teacher.subjectIds,
      },
      divisions: allDivisions.map((d) => ({
        _id: d._id,
        code: d.code,
        name: getItemName(d) || d.code,
      })),
      date: dateStr,
      selectedDivision: divisionCode,
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
      entries: {
        studentId: string;
        enrollmentId?: string;
        branchId?: string;
        status: string;
        notes?: string;
      }[];
    };

    if (!date || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'date and entries are required' }, { status: 400 });
    }

    // Find teacher and a valid branch for markedBy lookup
    const fallbackTeacher = await getEffectiveTeacher(user);
    if (!fallbackTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const cleanDateStr = date.includes('T') ? date.split('T')[0] : date;
    const dayStart = new Date(`${cleanDateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${cleanDateStr}T23:59:59.999Z`);
    const attendanceDate = new Date(`${cleanDateStr}T12:00:00.000Z`); // noon UTC

    const defaultBranchId = (fallbackTeacher.branchIds as any[])?.[0] ?? null;

    const ops = entries.map((entry) => {
      const setFields: Record<string, any> = {
        studentId: new mongoose.Types.ObjectId(entry.studentId),
        date: attendanceDate,
        status: entry.status,
        markedBy: new mongoose.Types.ObjectId(user.id),
        notes: entry.notes || '',
        isEdited: false,
      };

      if (entry.enrollmentId && mongoose.Types.ObjectId.isValid(entry.enrollmentId)) {
        setFields.enrollmentId = new mongoose.Types.ObjectId(entry.enrollmentId);
      }

      const branchToUse = entry.branchId || defaultBranchId;
      if (branchToUse && mongoose.Types.ObjectId.isValid(branchToUse.toString())) {
        setFields.branchId = new mongoose.Types.ObjectId(branchToUse.toString());
      }

      return {
        updateOne: {
          filter: {
            studentId: new mongoose.Types.ObjectId(entry.studentId),
            date: { $gte: dayStart, $lte: dayEnd },
          },
          update: { $set: setFields },
          upsert: true,
        },
      };
    });

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
