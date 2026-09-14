import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;
    const branch = await Branch.findById(id).lean();
    if (!branch) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ branch: JSON.parse(JSON.stringify(branch)) });
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
    const branch = await Branch.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!branch) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ branch: JSON.parse(JSON.stringify(branch)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
