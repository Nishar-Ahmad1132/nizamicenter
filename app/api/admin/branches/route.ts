import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import { branchSchema } from '@/validators/academic';

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const branches = await Branch.find({}).sort({ displayOrder: 1 }).lean();
    return NextResponse.json({ branches: JSON.parse(JSON.stringify(branches)) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();
    const body = await req.json();
    const parsed = branchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const branch = await Branch.create(parsed.data);
    return NextResponse.json({ branch: JSON.parse(JSON.stringify(branch)) }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
