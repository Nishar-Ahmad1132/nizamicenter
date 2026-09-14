import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Notice from '@/models/Notice';

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();
    const notices = await Notice.find({}).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ notices: JSON.parse(JSON.stringify(notices)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    await dbConnect();
    const body = await req.json();
    const { title, content, category, priority, status: noticeStatus } = body;

    if (!title?.en) {
      return NextResponse.json({ error: 'Title (English) is required' }, { status: 400 });
    }

    const notice = await Notice.create({
      title: { en: title.en, hi: title.hi, ur: title.ur },
      content: { en: content?.en, hi: content?.hi, ur: content?.ur },
      category: category ?? 'general',
      priority: priority ?? 'medium',
      status: noticeStatus ?? 'published',
      publishDate: new Date(),
      createdBy: user.id,
    });

    return NextResponse.json({ notice: JSON.parse(JSON.stringify(notice)) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
