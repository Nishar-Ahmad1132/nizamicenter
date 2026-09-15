import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import ClassModel from '@/models/Class';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;
    const cls = await ClassModel.findById(id).populate('divisionId', 'name code').lean();
    if (!cls) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ class: JSON.parse(JSON.stringify(cls)) });
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
    const cls = await ClassModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
    if (!cls) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ class: JSON.parse(JSON.stringify(cls)) });
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
    await ClassModel.findByIdAndUpdate(id, { isActive: false, status: 'inactive' });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
