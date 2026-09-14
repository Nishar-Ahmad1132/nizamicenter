import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Subject from '@/models/Subject';
import { subjectSchema } from '@/validators/academic';

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const subjects = await Subject.find({})
      .populate('divisionId', 'name code')
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ subjects: JSON.parse(JSON.stringify(subjects)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();
    const body = await req.json();
    const parsed = subjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const subject = await Subject.create(parsed.data);
    return NextResponse.json({ subject: JSON.parse(JSON.stringify(subject)) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
