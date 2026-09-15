import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import bcrypt from 'bcryptjs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actingUser = await requireAdmin();
    await dbConnect();
    const { id } = await params;

    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    let user = null;
    if (student.userId) {
      user = await User.findById(student.userId);
    }

    if (!user) {
      // Find user by username
      user = await User.findOne({ username: student.studentId.toLowerCase() });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    if (!user) {
      // Create user if one didn't exist
      user = await User.create({
        username: student.studentId.toLowerCase(),
        email: student.email || undefined,
        passwordHash,
        role: 'student',
        isActive: true,
        mustChangePassword: false,
      });

      student.userId = user._id;
      await student.save();
    } else {
      user.passwordHash = passwordHash;
      user.isActive = true;
      user.deletedAt = undefined;
      user.mustChangePassword = false;
      if (student.email && !user.email) {
        user.email = student.email;
      }
      await user.save();
    }

    // Audit log
    await AuditLog.create({
      userId: actingUser.id,
      userRole: actingUser.role,
      action: 'UPDATE',
      entity: 'Student',
      entityId: student._id.toString(),
      description: `Administrator ${actingUser.username || actingUser.id} reset password for student ${student.studentId} (${student.firstName})`,
    });

    return NextResponse.json({
      success: true,
      message: `Password has been reset successfully for student ${student.studentId}.`,
      username: user.username,
      studentId: student.studentId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
