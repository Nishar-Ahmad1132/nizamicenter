import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type PaymentMethod = 'cash' | 'upi' | 'bank' | 'online' | 'other';

export interface IPayment extends Document {
  studentId: Types.ObjectId;
  feeRecordId: Types.ObjectId;
  receiptNumber: string;
  amount: number;
  date: Date;
  month: string;
  method: PaymentMethod;
  reference?: string;
  receivedBy: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    feeRecordId: { type: Schema.Types.ObjectId, ref: 'FeeRecord', required: true },
    receiptNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    month: { type: String, required: true },
    method: { type: String, enum: ['cash', 'upi', 'bank', 'online', 'other'], required: true },
    reference: String,
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String,
  },
  { timestamps: true }
);

paymentSchema.index({ studentId: 1, date: -1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ month: 1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
