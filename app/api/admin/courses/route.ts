import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Course from '@/models/Course';
import { courseSchema } from '@/validators/academic';

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const courses = await Course.find({ isActive: true })
      .populate('divisionId', 'name code')
      .sort({ displayOrder: 1 })
      .lean();
    return NextResponse.json({ courses: JSON.parse(JSON.stringify(courses)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();
    const body = await req.json();
    const parsed = courseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const course = await Course.create(parsed.data);
    return NextResponse.json({ course: JSON.parse(JSON.stringify(course)) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
