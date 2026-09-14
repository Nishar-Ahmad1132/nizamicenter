import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/auth/session';
import { getAttendanceSheet, saveAttendanceBulk } from '@/services/attendance.service';

export async function GET(req: NextRequest) {
  try {
    await requireTeacher();
    const { searchParams } = req.nextUrl;
    const branchId = searchParams.get('branchId');
    const date = searchParams.get('date');
    if (!branchId || !date) {
      return NextResponse.json({ error: 'branchId and date are required' }, { status: 400 });
    }
    const sheet = await getAttendanceSheet({
      branchId,
      divisionId: searchParams.get('divisionId') ?? undefined,
      classId: searchParams.get('classId') ?? undefined,
      courseId: searchParams.get('courseId') ?? undefined,
      date: new Date(date),
    });
    return NextResponse.json({ sheet: JSON.parse(JSON.stringify(sheet)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireTeacher();
    const body = await req.json();
    const { records, branchId, date } = body;
    if (!records?.length || !branchId || !date) {
      return NextResponse.json({ error: 'records, branchId, and date are required' }, { status: 400 });
    }
    await saveAttendanceBulk(records, branchId, new Date(date), user);
    return NextResponse.json({ success: true, count: records.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
