import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';
import TeacherIssue from '@/models/TeacherIssue';

export async function GET() {
  try {
    const user = await requireTeacher();
    await dbConnect();

    const teacher = await Teacher.findOne({ userId: user.id, isActive: true }).lean();
    if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

    const issues = await TeacherIssue.find({ teacherId: teacher._id })
      .populate('branchId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ issues: JSON.parse(JSON.stringify(issues)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireTeacher();
    await dbConnect();

    const teacher = await Teacher.findOne({ userId: user.id, isActive: true }).lean();
    // Fallback for admin testing
    const effectiveTeacher = teacher || (await Teacher.findOne({ isActive: true }).lean());
    if (!effectiveTeacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const body = await req.json();
    const { category, priority, title, description, branchId } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const issue = await TeacherIssue.create({
      teacherId: effectiveTeacher._id,
      branchId: branchId || (effectiveTeacher.branchIds as any[])?.[0] || undefined,
      category: category || 'other',
      priority: priority || 'medium',
      title: title.trim(),
      description: description.trim(),
      status: 'pending',
    });

    return NextResponse.json({ success: true, issue: JSON.parse(JSON.stringify(issue)) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
