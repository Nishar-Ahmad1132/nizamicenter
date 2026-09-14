import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type StudentStatus = 'active' | 'inactive' | 'transferred' | 'graduated' | 'dropped';

export interface IStudent extends Document {
  userId?: Types.ObjectId;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  photo?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address: {
    line1?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianPhone?: string;
  primaryBranchId: Types.ObjectId;
  admissionDate: Date;
  academicYearId: Types.ObjectId;
  status: StudentStatus;
  notes?: string;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    photo: String,
    phone: String,
    whatsapp: String,
    email: { type: String, lowercase: true, trim: true },
    address: {
      line1: String,
      area: String,
      city: String,
      state: String,
      pincode: String,
    },
    fatherName: String,
    motherName: String,
    guardianName: String,
    guardianPhone: String,
    primaryBranchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    admissionDate: { type: Date, required: true, default: Date.now },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'transferred', 'graduated', 'dropped'],
      default: 'active',
    },
    notes: String,
    isActive: { type: Boolean, default: true },
    deletedAt: Date,
  },
  { timestamps: true }
);

studentSchema.index({ primaryBranchId: 1 });
studentSchema.index({ academicYearId: 1 });
studentSchema.index({ status: 1, isActive: 1 });
studentSchema.index({ phone: 1 }, { sparse: true });
studentSchema.index({ guardianPhone: 1 }, { sparse: true });
studentSchema.index(
  { firstName: 'text', lastName: 'text', studentId: 'text' },
  { name: 'student_text_search' }
);

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);

export default Student;
