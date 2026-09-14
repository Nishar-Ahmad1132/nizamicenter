import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const teachers = await Teacher.find({ isActive: true })
      .populate('branchIds', 'name')
      .populate('subjectIds', 'name')
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ teachers: JSON.parse(JSON.stringify(teachers)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();
    const body = await req.json();
    const { name, phone, email, qualification, experience, bio, branchIds, subjectIds, courseIds } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // Create user account for teacher
    const username = `teacher_${phone.replace(/\D/g, '').slice(-6)}`;
    const tempPassword = 'Teacher@' + Math.random().toString(36).slice(-6);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await User.create({
      username,
      email: email || undefined,
      passwordHash,
      role: 'teacher',
      isActive: true,
      mustChangePassword: true,
    });

    const teacher = await Teacher.create({
      userId: user._id,
      name,
      phone,
      email,
      qualification,
      experience,
      bio,
      branchIds: branchIds ?? [],
      subjectIds: subjectIds ?? [],
      courseIds: courseIds ?? [],
      status: 'active',
      isPublic: true,
    });

    return NextResponse.json({
      teacher: JSON.parse(JSON.stringify(teacher)),
      credentials: { username, temporaryPassword: tempPassword },
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
