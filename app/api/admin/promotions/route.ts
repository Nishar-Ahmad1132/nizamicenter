import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Enrollment from '@/models/Enrollment';
import Division from '@/models/Division';
import ClassModel from '@/models/Class';
import Course from '@/models/Course';
import AuditLog from '@/models/AuditLog';
import '@/models/Branch';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const branchId = searchParams.get('branchId');
    const academicYearId = searchParams.get('academicYearId');
    const divisionId = searchParams.get('divisionId');
    const classId = searchParams.get('classId');
    const courseId = searchParams.get('courseId');

    // Query active divisions for resolution
    const divisions = await Division.find({ isActive: true }).select('name code slug').lean();
    const nicDivision = divisions.find((d) => d.code === 'NIC' || d.slug?.includes('islamic')) || divisions[0];
    const eduDivision = divisions.find((d) => d.code === 'NE' || d.slug?.includes('education')) || divisions[1] || divisions[0];

    // Load available classes ordered by numericValue to project next class
    const classes = await ClassModel.find({ isActive: true }).select('name numericValue').sort({ numericValue: 1 }).lean();
    const classOrder = classes.map((c) => c._id.toString());

    // Load available Islamic courses ordered by displayOrder to project next course
    const courses = await Course.find({ status: 'active' }).select('name displayOrder').sort({ displayOrder: 1 }).lean();
    const courseOrder = courses.map((c) => c._id.toString());

    // Filter students
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studentFilter: Record<string, any> = {
      status: 'active',
      isActive: true,
    };

    if (branchId && branchId !== 'all') studentFilter.primaryBranchId = branchId;
    if (academicYearId && academicYearId !== 'all') studentFilter.academicYearId = academicYearId;

    // Fetch all active students matching branch/academic year
    const students = await Student.find(studentFilter)
      .populate('primaryBranchId', 'name')
      .populate('academicYearId', 'name')
      .sort({ studentId: 1 })
      .lean();

    // Fetch active enrollments for these students
    const studentIds = students.map((s) => s._id);
    const enrollments = await Enrollment.find({
      studentId: { $in: studentIds },
      status: 'active',
      isActive: true,
    })
      .populate('divisionId', 'name code slug')
      .populate('classId', 'name numericValue')
      .populate('courseId', 'name slug displayOrder')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Map by studentId (prefer newest active enrollment)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrollmentMap = new Map<string, any>();
    for (const e of enrollments) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sid = (e.studentId as any).toString();
      if (!enrollmentMap.has(sid)) {
        enrollmentMap.set(sid, e);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidates: any[] = [];

    for (const student of students) {
      const enrollment = enrollmentMap.get(student._id.toString());

      // Determine division
      let studentDivision = enrollment?.divisionId;
      if (!studentDivision) {
        // Deduce from studentId prefix (e.g. NIC- vs NE-)
        if (student.studentId.toUpperCase().startsWith('NIC')) {
          studentDivision = nicDivision;
        } else {
          studentDivision = eduDivision;
        }
      }

      const divCode = studentDivision?.code || (student.studentId.toUpperCase().startsWith('NIC') ? 'NIC' : 'NE');
      const divId = studentDivision?._id?.toString() || (divCode === 'NIC' ? nicDivision?._id?.toString() : eduDivision?._id?.toString());
      const isNic = divCode === 'NIC' || student.studentId.toUpperCase().startsWith('NIC');

      // Filter by division if requested
      if (divisionId && divisionId !== 'all' && divId !== divisionId) {
        continue;
      }

      // Filter by classId if requested (for NE)
      if (classId && classId !== 'all') {
        const studentClassId = enrollment?.classId?._id?.toString();
        if (studentClassId !== classId) continue;
      }

      // Filter by courseId if requested (for NIC)
      if (courseId && courseId !== 'all') {
        const studentCourseId = enrollment?.courseId?._id?.toString();
        if (studentCourseId !== courseId) continue;
      }

      // Extract localized names safely
      const courseName = typeof enrollment?.courseId?.name === 'object' ? enrollment?.courseId?.name?.en : enrollment?.courseId?.name;
      const className = typeof enrollment?.classId?.name === 'object' ? enrollment?.classId?.name?.en : enrollment?.classId?.name;
      const divName = typeof studentDivision?.name === 'object' ? studentDivision?.name?.en : studentDivision?.name;

      const currentProgram = courseName
        ? `Course: ${courseName}`
        : className
        ? `Standard: ${className}`
        : divName || (isNic ? 'Islamic Curriculum' : 'Academic Curriculum');

      // Compute projected next level
      let projectedProgram = 'Same Level';
      if (!isNic) {
        const curClassId = enrollment?.classId?._id?.toString();
        if (curClassId) {
          const idx = classOrder.indexOf(curClassId);
          if (idx !== -1 && idx + 1 < classOrder.length) {
            const nextCls = classes[idx + 1];
            const nextName = typeof nextCls?.name === 'object' ? nextCls?.name?.en : nextCls?.name;
            projectedProgram = `Standard: ${nextName}`;
          } else {
            projectedProgram = 'Standard: Class 8 (Senior)';
          }
        } else {
          const firstCls = classes[0];
          const firstName = typeof firstCls?.name === 'object' ? firstCls?.name?.en : firstCls?.name;
          projectedProgram = `Standard: ${firstName || 'Class 1'}`;
        }
      } else {
        const curCourseId = enrollment?.courseId?._id?.toString();
        if (curCourseId) {
          const idx = courseOrder.indexOf(curCourseId);
          if (idx !== -1 && idx + 1 < courseOrder.length) {
            const nextCrs = courses[idx + 1];
            const nextName = typeof nextCrs?.name === 'object' ? nextCrs?.name?.en : nextCrs?.name;
            projectedProgram = `Course: ${nextName}`;
          } else {
            projectedProgram = 'Islamic Track: Completed';
          }
        } else {
          const firstCrs = courses[0];
          const firstName = typeof firstCrs?.name === 'object' ? firstCrs?.name?.en : firstCrs?.name;
          projectedProgram = `Course: ${firstName || 'Nazra Quran'}`;
        }
      }

      candidates.push({
        enrollmentId: enrollment?._id?.toString(),
        studentId: student._id.toString(),
        studentCode: student.studentId,
        name: `${student.firstName} ${student.lastName && student.lastName !== '-' ? student.lastName : ''}`.trim(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        branchName: enrollment?.branchId?.name || (student.primaryBranchId as any)?.name || 'Main Campus',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        branchId: enrollment?.branchId?._id?.toString() || (student.primaryBranchId as any)?._id?.toString() || (student.primaryBranchId as any)?.toString(),
        divisionId: divId,
        divisionCode: divCode,
        isNic,
        currentProgram,
        projectedProgram,
        currentClassId: enrollment?.classId?._id?.toString(),
        currentCourseId: enrollment?.courseId?._id?.toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        academicYearId: (student.academicYearId as any)?._id?.toString() || student.academicYearId?.toString(),
        status: student.status,
      });
    }

    return NextResponse.json({ candidates: JSON.parse(JSON.stringify(candidates)) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actingUser = await requireAdmin();
    await dbConnect();

    const body = await req.json();
    const {
      studentRecords, // array of { studentId, enrollmentId, branchId, divisionId, isNic }
      toAcademicYearId,
      targetClassId,
      targetCourseId,
      action = 'promote', // 'promote' | 'retain' | 'graduate'
      notes,
    } = body;

    if (!studentRecords || !studentRecords.length) {
      return NextResponse.json({ error: 'Please select at least one student to promote.' }, { status: 400 });
    }

    if (action !== 'graduate' && !toAcademicYearId) {
      return NextResponse.json({ error: 'Target academic year is required for promotion or retention.' }, { status: 400 });
    }

    // Query active divisions for default assignment
    const divisions = await Division.find({ isActive: true }).select('name code slug').lean();
    const nicDivision = divisions.find((d) => d.code === 'NIC' || d.slug?.includes('islamic')) || divisions[0];
    const eduDivision = divisions.find((d) => d.code === 'NE' || d.slug?.includes('education')) || divisions[1] || divisions[0];

    // Load available classes ordered by numericValue to auto-advance if specific target class is not set
    const classes = await ClassModel.find({ isActive: true }).sort({ numericValue: 1 }).lean();
    const classOrder = classes.map((c) => c._id.toString());

    // Load available Islamic courses
    const courses = await Course.find({ status: 'active' }).sort({ displayOrder: 1 }).lean();
    const courseOrder = courses.map((c) => c._id.toString());

    let processedCount = 0;

    for (const record of studentRecords) {
      const student = await Student.findById(record.studentId);
      if (!student) continue;

      let oldEnrollment = null;
      if (record.enrollmentId) {
        oldEnrollment = await Enrollment.findById(record.enrollmentId);
      }
      if (!oldEnrollment) {
        oldEnrollment = await Enrollment.findOne({ studentId: student._id, isActive: true }).sort({ createdAt: -1 });
      }

      const isNic = record.isNic ?? (student.studentId.toUpperCase().startsWith('NIC') || oldEnrollment?.divisionId?.toString() === nicDivision._id.toString());

      if (action === 'graduate') {
        student.status = 'graduated';
        await student.save();

        if (oldEnrollment) {
          oldEnrollment.status = 'completed';
          oldEnrollment.endDate = new Date();
          oldEnrollment.notes = notes || 'Graduated / Completed curriculum';
          await oldEnrollment.save();
        }
        processedCount++;
      } else if (action === 'retain') {
        // Retain: complete old enrollment, create new enrollment in same class/course for new academic year
        if (oldEnrollment) {
          oldEnrollment.status = 'completed';
          oldEnrollment.endDate = new Date();
          await oldEnrollment.save();
        }

        await Enrollment.create({
          studentId: student._id,
          divisionId: oldEnrollment?.divisionId || (isNic ? nicDivision._id : eduDivision._id),
          branchId: oldEnrollment?.branchId || student.primaryBranchId,
          academicYearId: toAcademicYearId,
          classId: !isNic ? oldEnrollment?.classId || classOrder[0] : undefined,
          courseId: isNic ? oldEnrollment?.courseId || courseOrder[0] : undefined,
          subjectIds: oldEnrollment?.subjectIds || [],
          enrollmentDate: new Date(),
          startDate: new Date(),
          status: 'active',
          notes: notes ? `Retained: ${notes}` : 'Retained in same grade/course for target academic year',
        });

        student.academicYearId = toAcademicYearId;
        await student.save();
        processedCount++;
      } else {
        // PROMOTE
        if (oldEnrollment) {
          oldEnrollment.status = 'completed';
          oldEnrollment.endDate = new Date();
          await oldEnrollment.save();
        }

        let nextClassId = !isNic ? targetClassId : undefined;
        let nextCourseId = isNic ? targetCourseId : undefined;

        // If targetClassId not explicitly specified for NE student, advance to next numeric standard
        if (!isNic) {
          if (!nextClassId && oldEnrollment?.classId) {
            const currentIndex = classOrder.indexOf(oldEnrollment.classId.toString());
            if (currentIndex !== -1 && currentIndex + 1 < classOrder.length) {
              nextClassId = classOrder[currentIndex + 1];
            } else {
              nextClassId = oldEnrollment.classId.toString();
            }
          } else if (!nextClassId) {
            nextClassId = classOrder[0];
          }
        }

        // If targetCourseId not explicitly specified for NIC student, advance to next course in sequence
        if (isNic) {
          if (!nextCourseId && oldEnrollment?.courseId) {
            const currentIndex = courseOrder.indexOf(oldEnrollment.courseId.toString());
            if (currentIndex !== -1 && currentIndex + 1 < courseOrder.length) {
              nextCourseId = courseOrder[currentIndex + 1];
            } else {
              nextCourseId = oldEnrollment.courseId.toString();
            }
          } else if (!nextCourseId) {
            nextCourseId = courseOrder[0];
          }
        }

        await Enrollment.create({
          studentId: student._id,
          divisionId: oldEnrollment?.divisionId || (isNic ? nicDivision._id : eduDivision._id),
          branchId: oldEnrollment?.branchId || student.primaryBranchId,
          academicYearId: toAcademicYearId,
          classId: !isNic ? nextClassId : undefined,
          courseId: isNic ? nextCourseId : undefined,
          subjectIds: oldEnrollment?.subjectIds || [],
          enrollmentDate: new Date(),
          startDate: new Date(),
          status: 'active',
          notes: notes || 'Promoted to next level for new academic session',
        });

        student.academicYearId = toAcademicYearId;
        student.status = 'active';
        await student.save();
        processedCount++;
      }
    }

    // Audit Log
    await AuditLog.create({
      userId: actingUser.id,
      userRole: actingUser.role,
      action: 'UPDATE',
      entity: 'Student',
      entityId: actingUser.id,
      description: `Executed batch ${action} for ${processedCount} students across NIC/NE divisions`,
      newValue: {
        action,
        count: processedCount,
        toAcademicYearId,
        targetClassId,
        targetCourseId,
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      count: processedCount,
      message: `Successfully processed ${processedCount} student(s) with action "${action}".`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
