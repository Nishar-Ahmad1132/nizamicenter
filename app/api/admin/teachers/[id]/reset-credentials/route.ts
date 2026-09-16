import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;

    const teacher = await Teacher.findById(id).lean();
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    let user = null;
    if (teacher.userId) {
      user = await User.findById(teacher.userId).select('username email role isActive lastLogin createdAt').lean();
    }

    if (!user) {
      const username = `teacher_${teacher.phone.replace(/\D/g, '').slice(-6)}`;
      user = await User.findOne({ username }).select('username email role isActive lastLogin createdAt').lean();
    }

    return NextResponse.json({
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        phone: teacher.phone,
        email: teacher.email,
      },
      user: user ? JSON.parse(JSON.stringify(user)) : null,
      expectedUsername: `teacher_${teacher.phone.replace(/\D/g, '').slice(-6)}`,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const tempPassword = body?.newPassword?.trim() || ('Teacher@' + Math.random().toString(36).slice(-6));
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    let user = null;
    if (teacher.userId) {
      user = await User.findById(teacher.userId);
    }

    const username = `teacher_${teacher.phone.replace(/\D/g, '').slice(-6)}`;

    if (!user) {
      user = await User.findOne({ username });
    }

    if (!user) {
      user = await User.create({
        username,
        email: teacher.email || undefined,
        passwordHash,
        role: 'teacher',
        isActive: true,
        mustChangePassword: true,
      });

      teacher.userId = user._id;
      await teacher.save();
    } else {
      user.passwordHash = passwordHash;
      user.isActive = true;
      user.mustChangePassword = true;
      if (teacher.email && !user.email) {
        user.email = teacher.email;
      }
      await user.save();

      if (!teacher.userId) {
        teacher.userId = user._id;
        await teacher.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher login credentials generated successfully',
      credentials: {
        username: user.username,
        email: user.email || teacher.email || null,
        phone: teacher.phone,
        temporaryPassword: tempPassword,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
