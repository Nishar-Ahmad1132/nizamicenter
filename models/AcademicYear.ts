import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAcademicYear extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const academicYearSchema = new Schema<IAcademicYear>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    isCurrent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const AcademicYear: Model<IAcademicYear> =
  mongoose.models.AcademicYear || mongoose.model<IAcademicYear>('AcademicYear', academicYearSchema);

export default AcademicYear;
