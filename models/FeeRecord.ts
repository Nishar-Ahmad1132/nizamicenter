import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type FeeStatus = 'paid' | 'partial' | 'pending' | 'waived';

export interface IFeeRecord extends Document {
  studentId: Types.ObjectId;
  enrollmentId: Types.ObjectId;
  feePlanId: Types.ObjectId;
  month: string; // YYYY-MM format
  dueAmount: number;
  paidAmount: number;
  status: FeeStatus;
  dueDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const feeRecordSchema = new Schema<IFeeRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    feePlanId: { type: Schema.Types.ObjectId, ref: 'FeePlan', required: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    dueAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['paid', 'partial', 'pending', 'waived'], default: 'pending' },
    dueDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

feeRecordSchema.index({ studentId: 1, month: 1 });
feeRecordSchema.index({ enrollmentId: 1, month: 1 });
feeRecordSchema.index({ status: 1 });
feeRecordSchema.index({ dueDate: 1 });

const FeeRecord: Model<IFeeRecord> =
  mongoose.models.FeeRecord || mongoose.model<IFeeRecord>('FeeRecord', feeRecordSchema);

export default FeeRecord;
