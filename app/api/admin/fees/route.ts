import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import FeeRecord from '@/models/FeeRecord';
import Payment from '@/models/Payment';
import { generateReceiptNumber } from '@/services/student.service';
import AuditLog from '@/models/AuditLog';

// GET fee records with filters
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();
    const { searchParams } = req.nextUrl;
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 20);
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };
    if (searchParams.get('status')) filter.status = searchParams.get('status');
    if (searchParams.get('studentId')) filter.studentId = searchParams.get('studentId');
    if (searchParams.get('month')) filter.month = searchParams.get('month');

    const [records, total] = await Promise.all([
      FeeRecord.find(filter)
        .populate('studentId', 'firstName lastName studentId')
        .populate('feePlanId', 'name monthlyFee')
        .sort({ dueDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeeRecord.countDocuments(filter),
    ]);

    return NextResponse.json({
      records: JSON.parse(JSON.stringify(records)),
      total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST — record a payment
export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    await dbConnect();
    const body = await req.json();
    const { feeRecordId, amount, method, reference, notes } = body;

    if (!feeRecordId || !amount || !method) {
      return NextResponse.json({ error: 'feeRecordId, amount, and method are required' }, { status: 400 });
    }

    const feeRecord = await FeeRecord.findById(feeRecordId);
    if (!feeRecord) return NextResponse.json({ error: 'Fee record not found' }, { status: 404 });

    const receiptNumber = await generateReceiptNumber();

    const payment = await Payment.create({
      studentId: feeRecord.studentId,
      feeRecordId,
      receiptNumber,
      amount,
      date: new Date(),
      month: feeRecord.month,
      method,
      reference,
      receivedBy: user.id,
      notes,
    });

    // Update fee record
    const newPaid = feeRecord.paidAmount + amount;
    const newStatus = newPaid >= feeRecord.dueAmount ? 'paid' : 'partial';
    await FeeRecord.findByIdAndUpdate(feeRecordId, {
      paidAmount: newPaid,
      status: newStatus,
    });

    await AuditLog.create({
      userId: user.id,
      userRole: user.role,
      action: 'CREATE',
      entity: 'Payment',
      entityId: payment._id.toString(),
      description: `Payment of ₹${amount} recorded for ${feeRecord.month} (Receipt: ${receiptNumber})`,
    });

    return NextResponse.json({
      payment: JSON.parse(JSON.stringify(payment)),
      receiptNumber,
      updatedStatus: newStatus,
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
