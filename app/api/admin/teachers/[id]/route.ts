import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const allowed = [
      'name', 'phone', 'email', 'isPublic', 'status',
      'qualification', 'experience', 'bio', 'availability',
      'branchIds', 'subjectIds', 'courseIds',
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    const teacher = await Teacher.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate('branchIds', 'name')
      .populate('subjectIds', 'name')
      .populate('courseIds', 'name')
      .lean();
    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

    return NextResponse.json({ success: true, teacher: JSON.parse(JSON.stringify(teacher)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;
    await Teacher.findByIdAndUpdate(id, { isActive: false, deletedAt: new Date() });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
