import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'converted';

export interface IAdmissionApplication extends Document {
  applicantName: string;
  fatherName?: string;
  guardianPhone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  divisionId?: Types.ObjectId;
  classId?: Types.ObjectId;
  courseIds: Types.ObjectId[];
  preferredBranchId?: Types.ObjectId;
  preferredTiming?: string;
  message?: string;
  status: ApplicationStatus;
  notes?: string;
  assignedTo?: Types.ObjectId;
  convertedStudentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const admissionApplicationSchema = new Schema<IAdmissionApplication>(
  {
    applicantName: { type: String, required: true, trim: true },
    fatherName: String,
    guardianPhone: { type: String, required: true, trim: true },
    whatsapp: String,
    email: { type: String, lowercase: true, trim: true },
    address: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    divisionId: { type: Schema.Types.ObjectId, ref: 'Division' },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    courseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    preferredBranchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    preferredTiming: String,
    message: String,
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected', 'converted'],
      default: 'pending',
    },
    notes: String,
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    convertedStudentId: { type: Schema.Types.ObjectId, ref: 'Student' },
  },
  { timestamps: true }
);

admissionApplicationSchema.index({ status: 1, createdAt: -1 });
admissionApplicationSchema.index({ guardianPhone: 1 });

const AdmissionApplication: Model<IAdmissionApplication> =
  mongoose.models.AdmissionApplication ||
  mongoose.model<IAdmissionApplication>('AdmissionApplication', admissionApplicationSchema);

export default AdmissionApplication;
