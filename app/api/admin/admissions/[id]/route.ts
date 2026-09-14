import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import AdmissionApplication from '@/models/AdmissionApplication';
import { convertApplicationToStudent } from '@/services/student.service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const app = await AdmissionApplication.findById(id);
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    if (action === 'approve') {
      await AdmissionApplication.findByIdAndUpdate(id, { status: 'approved' });
      return NextResponse.json({ success: true, status: 'approved' });
    }

    if (action === 'reject') {
      await AdmissionApplication.findByIdAndUpdate(id, { status: 'rejected', rejectionReason: body.reason });
      return NextResponse.json({ success: true, status: 'rejected' });
    }

    if (action === 'convert') {
      const result = await convertApplicationToStudent(id, body.enrollmentData, user);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
