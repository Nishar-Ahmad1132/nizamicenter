import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';

export async function GET() {
  try {
    const user = await requireTeacher();
    await dbConnect();

    const teacher = await Teacher.findOne({ userId: user.id, isActive: true })
      .populate('branchIds', 'name shortName')
      .populate('subjectIds', 'name shortName')
      .populate('courseIds', 'name')
      .lean();

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ teacher: JSON.parse(JSON.stringify(teacher)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireTeacher();
    await dbConnect();

    const teacher = await Teacher.findOne({ userId: user.id, isActive: true });
    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

    const body = await req.json();
    // Only allow updating safe fields that exist on the Teacher schema
    const allowed = ['phone', 'whatsapp', 'email', 'bio', 'photo'] as const;
    for (const field of allowed) {
      if (body[field] !== undefined) {
        (teacher as any)[field] = body[field];
      }
    }

    await teacher.save();
    return NextResponse.json({ success: true, teacher: JSON.parse(JSON.stringify(teacher.toObject())) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
