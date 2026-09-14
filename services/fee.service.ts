import dbConnect from '@/lib/db/mongoose';
import FeeRecord from '@/models/FeeRecord';
import Payment from '@/models/Payment';
import FeePlan from '@/models/FeePlan';
import AuditLog from '@/models/AuditLog';
import { generateReceiptNumber } from '@/services/student.service';
import type { SessionUser } from '@/lib/auth/session';
import type { PaymentMethod } from '@/models/Payment';

/**
 * Generate monthly fee records for an enrollment.
 */
export async function generateMonthlyFeeRecord(params: {
  studentId: string;
  enrollmentId: string;
  feePlanId: string;
  month: string; // YYYY-MM
  dueDate: Date;
}) {
  await dbConnect();

  const feePlan = await FeePlan.findById(params.feePlanId).lean();
  if (!feePlan) throw new Error('Fee plan not found');

  const totalFee = feePlan.monthlyFee - (feePlan.discount ?? 0);

  // Check if already exists
  const existing = await FeeRecord.findOne({
    enrollmentId: params.enrollmentId,
    month: params.month,
  });
  if (existing) return existing;

  return FeeRecord.create({
    studentId: params.studentId,
    enrollmentId: params.enrollmentId,
    feePlanId: params.feePlanId,
    month: params.month,
    dueAmount: totalFee,
    paidAmount: 0,
    status: 'pending',
    dueDate: params.dueDate,
  });
}

/**
 * Record a payment against a fee record.
 */
export async function recordPayment(
  params: {
    studentId: string;
    feeRecordId: string;
    amount: number;
    date: Date;
    month: string;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
  },
  actingUser: SessionUser
) {
  await dbConnect();

  const feeRecord = await FeeRecord.findById(params.feeRecordId);
  if (!feeRecord) throw new Error('Fee record not found');

  const receiptNumber = await generateReceiptNumber();

  const payment = await Payment.create({
    studentId: params.studentId,
    feeRecordId: params.feeRecordId,
    receiptNumber,
    amount: params.amount,
    date: params.date,
    month: params.month,
    method: params.method,
    reference: params.reference,
    receivedBy: actingUser.id,
    notes: params.notes,
  });

  // Update fee record
  const newPaidAmount = feeRecord.paidAmount + params.amount;
  const status = newPaidAmount >= feeRecord.dueAmount ? 'paid' : 'partial';

  await FeeRecord.findByIdAndUpdate(params.feeRecordId, {
    paidAmount: newPaidAmount,
    status,
  });

  await AuditLog.create({
    userId: actingUser.id,
    userRole: actingUser.role,
    action: 'PAYMENT',
    entity: 'Payment',
    entityId: payment._id.toString(),
    description: `Recorded payment ₹${params.amount} for student ${params.studentId} (${params.month}). Receipt: ${receiptNumber}`,
  });

  return { payment, receiptNumber };
}

/**
 * Get fee summary for a student.
 */
export async function getStudentFeeSummary(studentId: string) {
  await dbConnect();

  const records = await FeeRecord.find({ studentId, isActive: true })
    .sort({ month: -1 })
    .lean();

  const totalDue = records.reduce((sum, r) => sum + r.dueAmount, 0);
  const totalPaid = records.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalPending = totalDue - totalPaid;

  return { records, totalDue, totalPaid, totalPending };
}
