import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import ClassModel from '@/models/Class';
import { classSchema } from '@/validators/academic';

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const classes = await ClassModel.find({})
      .populate('divisionId', 'name code')
      .sort({ displayOrder: 1, numericValue: 1 })
      .lean();
    return NextResponse.json({ classes: JSON.parse(JSON.stringify(classes)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();
    const body = await req.json();
    const parsed = classSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const cls = await ClassModel.create(parsed.data);
    return NextResponse.json({ class: JSON.parse(JSON.stringify(cls)) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
