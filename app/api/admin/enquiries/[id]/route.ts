import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Enquiry from '@/models/Enquiry';
import AuditLog from '@/models/AuditLog';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;

    const enquiry = await Enquiry.findById(id)
      .populate('branchId', 'name')
      .populate('assignedTo', 'username name')
      .populate('respondedBy', 'username name')
      .lean();

    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, enquiry });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actingUser = await requireAdmin();
    await dbConnect();
    const { id } = await params;

    const body = await req.json();
    const { status, notes, adminResponse, markContacted } = body;

    // Ensure status enum in compiled model includes 'resolved'
    const statusPath = Enquiry.schema.path('status');
    if (statusPath && 'enumValues' in statusPath && Array.isArray((statusPath as { enumValues: string[] }).enumValues)) {
      const values = (statusPath as { enumValues: string[] }).enumValues;
      if (!values.includes('resolved')) {
        values.push('resolved');
      }
    }

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found.' }, { status: 404 });
    }

    const previousStatus = enquiry.status;

    if (status) {
      enquiry.status = status;
    }

    if (typeof notes === 'string') {
      enquiry.notes = notes;
    }

    if (typeof adminResponse === 'string') {
      enquiry.adminResponse = adminResponse;
      enquiry.respondedAt = new Date();
      enquiry.respondedBy = new Types.ObjectId(actingUser.id);
    }

    if (markContacted || status === 'contacted') {
      enquiry.lastContactedAt = new Date();
    }

    await enquiry.save();

    // Log audit
    await AuditLog.create({
      userId: actingUser.id,
      userRole: actingUser.role,
      action: 'UPDATE',
      entity: 'Enquiry',
      entityId: enquiry._id.toString(),
      description: `Administrator ${actingUser.username || actingUser.id} updated enquiry #${enquiry._id.toString().slice(-6)}: Status changed from ${previousStatus} to ${enquiry.status}${adminResponse ? ' with official response' : ''}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Enquiry updated successfully.',
      enquiry,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actingUser = await requireAdmin();
    await dbConnect();
    const { id } = await params;

    const enquiry = await Enquiry.findByIdAndDelete(id);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found.' }, { status: 404 });
    }

    await AuditLog.create({
      userId: actingUser.id,
      userRole: actingUser.role,
      action: 'DELETE',
      entity: 'Enquiry',
      entityId: id,
      description: `Administrator ${actingUser.username || actingUser.id} deleted enquiry from ${enquiry.name} (${enquiry.phone})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Enquiry deleted successfully.',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
