import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Course from '@/models/Course';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const course = await Course.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ course: JSON.parse(JSON.stringify(course)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
