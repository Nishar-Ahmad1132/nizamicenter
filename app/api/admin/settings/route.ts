import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import WebsiteSetting from '@/models/WebsiteSetting';

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const settings = await WebsiteSetting.find({}).sort({ group: 1, key: 1 }).lean();
    return NextResponse.json({ settings: JSON.parse(JSON.stringify(settings)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();
    const body = await req.json();
    const { updates } = body; // Array of { key, value }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'updates array is required' }, { status: 400 });
    }

    const bulkOps = updates.map((u: { key: string; value: string }) => ({
      updateOne: {
        filter: { key: u.key },
        update: { $set: { value: u.value } },
        upsert: true,
      },
    }));

    await WebsiteSetting.bulkWrite(bulkOps);
    return NextResponse.json({ success: true, count: updates.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
