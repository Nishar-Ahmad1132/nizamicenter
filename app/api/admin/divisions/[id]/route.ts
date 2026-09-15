import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Division from '@/models/Division';
import AuditLog from '@/models/AuditLog';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = await params;

    const division = await Division.findById(id).lean();
    if (!division) {
      return NextResponse.json({ error: 'Division not found' }, { status: 404 });
    }

    return NextResponse.json({ division: JSON.parse(JSON.stringify(division)) });
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
    const {
      name,
      headTitle,
      description,
      features,
      gradientFrom,
      gradientTo,
      buttonText,
      buttonUrl,
      icon,
      isActive,
      displayOrder,
    } = body;

    const division = await Division.findById(id);
    if (!division) {
      return NextResponse.json({ error: 'Division not found' }, { status: 404 });
    }

    if (name) {
      if (name.en !== undefined) division.name.en = name.en.trim();
      if (name.ur !== undefined) division.name.ur = name.ur.trim();
      if (name.hi !== undefined) division.name.hi = name.hi.trim();
    }

    if (headTitle !== undefined) division.headTitle = headTitle.trim();

    if (description) {
      if (description.en !== undefined) {
        if (!division.description) division.description = {};
        division.description.en = description.en.trim();
      }
      if (description.ur !== undefined) {
        if (!division.description) division.description = {};
        division.description.ur = description.ur.trim();
      }
      if (description.hi !== undefined) {
        if (!division.description) division.description = {};
        division.description.hi = description.hi.trim();
      }
    }

    if (Array.isArray(features)) {
      division.features = features.map((f: string) => f.trim()).filter(Boolean);
    }

    if (gradientFrom !== undefined) division.gradientFrom = gradientFrom.trim();
    if (gradientTo !== undefined) division.gradientTo = gradientTo.trim();
    if (buttonText !== undefined) division.buttonText = buttonText.trim();
    if (buttonUrl !== undefined) division.buttonUrl = buttonUrl.trim();
    if (icon !== undefined) division.icon = icon.trim();
    if (typeof isActive === 'boolean') division.isActive = isActive;
    if (typeof displayOrder === 'number') division.displayOrder = displayOrder;

    await division.save();

    // Audit log
    await AuditLog.create({
      userId: actingUser.id,
      userRole: actingUser.role,
      action: 'UPDATE',
      entity: 'Division',
      entityId: division._id.toString(),
      description: `Administrator ${actingUser.username || actingUser.id} updated division ${division.name.en} (${division.code})`,
    });

    // Revalidate paths for real-time reflection across public site & admin
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/admin/divisions');
    } catch {
      // Revalidation in non-cache contexts
    }

    return NextResponse.json({
      success: true,
      message: 'Division updated successfully!',
      division: JSON.parse(JSON.stringify(division)),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
