import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Subject from '@/models/Subject';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;
    const subject = await Subject.findById(id)
      .populate('divisionId', 'name code')
      .populate('classIds', 'name numericValue')
      .lean();
    if (!subject) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ subject: JSON.parse(JSON.stringify(subject)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const allowed = ['name', 'code', 'divisionId', 'classIds', 'description', 'icon', 'status', 'isActive'];
    const updateData: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    const subject = await Subject.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate('divisionId', 'name code')
      .populate('classIds', 'name numericValue')
      .lean();

    if (!subject) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ subject: JSON.parse(JSON.stringify(subject)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;
    await Subject.findByIdAndUpdate(id, { isActive: false, status: 'inactive' });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
