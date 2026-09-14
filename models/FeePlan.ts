import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IOtherCharge {
  label: string;
  amount: number;
}

export interface IFeePlan extends Document {
  name: string;
  divisionId?: Types.ObjectId;
  courseId?: Types.ObjectId;
  classId?: Types.ObjectId;
  branchId?: Types.ObjectId;
  academicYearId: Types.ObjectId;
  monthlyFee: number;
  admissionFee: number;
  otherCharges: IOtherCharge[];
  discount: number;
  effectiveDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const feePlanSchema = new Schema<IFeePlan>(
  {
    name: { type: String, required: true, trim: true },
    divisionId: { type: Schema.Types.ObjectId, ref: 'Division' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    monthlyFee: { type: Number, required: true, min: 0 },
    admissionFee: { type: Number, default: 0, min: 0 },
    otherCharges: [{ label: String, amount: Number }],
    discount: { type: Number, default: 0, min: 0 },
    effectiveDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

feePlanSchema.index({ academicYearId: 1 });
feePlanSchema.index({ branchId: 1 });

const FeePlan: Model<IFeePlan> =
  mongoose.models.FeePlan || mongoose.model<IFeePlan>('FeePlan', feePlanSchema);

export default FeePlan;
