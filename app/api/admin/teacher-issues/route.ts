import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import TeacherIssue from '@/models/TeacherIssue';

/**
 * GET /api/admin/teacher-issues  – list all issues with optional status filter
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const issues = await TeacherIssue.find(filter)
      .populate('teacherId', 'name teacherId phone email')
      .populate('branchId', 'name')
      .populate('respondedBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ issues: JSON.parse(JSON.stringify(issues)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

/**
 * PATCH /api/admin/teacher-issues  – update status + optional admin response
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdmin();
    await dbConnect();

    const body = await req.json();
    const { issueId, status, adminResponse } = body;

    if (!issueId || !status) {
      return NextResponse.json({ error: 'issueId and status are required' }, { status: 400 });
    }

    const update: Record<string, unknown> = { status };
    if (adminResponse) update.adminResponse = adminResponse.trim();
    if (status === 'resolved') update.resolvedAt = new Date();
    if (adminResponse || status !== 'pending') update.respondedBy = user.id;

    const issue = await TeacherIssue.findByIdAndUpdate(issueId, { $set: update }, { new: true })
      .populate('teacherId', 'name')
      .lean();

    if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

    return NextResponse.json({ success: true, issue: JSON.parse(JSON.stringify(issue)) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
