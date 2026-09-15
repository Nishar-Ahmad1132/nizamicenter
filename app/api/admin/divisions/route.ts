import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Division from '@/models/Division';

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const divisions = await Division.find({}).sort({ displayOrder: 1 }).lean();
    return NextResponse.json({ divisions: JSON.parse(JSON.stringify(divisions)) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
