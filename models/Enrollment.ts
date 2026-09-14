import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled' | 'transferred' | 'onHold';

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  divisionId: Types.ObjectId;
  branchId: Types.ObjectId;
  academicYearId: Types.ObjectId;
  courseId?: Types.ObjectId;
  classId?: Types.ObjectId;
  subjectIds: Types.ObjectId[];
  enrollmentDate: Date;
  startDate: Date;
  endDate?: Date;
  status: EnrollmentStatus;
  feePlanId?: Types.ObjectId;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    divisionId: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    enrollmentDate: { type: Date, required: true, default: Date.now },
    startDate: { type: Date, required: true },
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'transferred', 'onHold'],
      default: 'active',
    },
    feePlanId: { type: Schema.Types.ObjectId, ref: 'FeePlan' },
    notes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

enrollmentSchema.index({ studentId: 1 });
enrollmentSchema.index({ branchId: 1 });
enrollmentSchema.index({ classId: 1 });
enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ academicYearId: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ studentId: 1, divisionId: 1, academicYearId: 1 });

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);

export default Enrollment;
