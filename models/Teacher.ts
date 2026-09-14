import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ITeacher extends Document {
  userId: Types.ObjectId;
  name: string;
  photo?: string;
  qualification?: string;
  experience?: string;
  bio?: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  branchIds: Types.ObjectId[];
  subjectIds: Types.ObjectId[];
  courseIds: Types.ObjectId[];
  availability?: string;
  status: 'active' | 'inactive';
  isPublic: boolean;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    photo: String,
    qualification: String,
    experience: String,
    bio: String,
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    whatsapp: String,
    branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
    subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    courseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    availability: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    deletedAt: Date,
  },
  { timestamps: true }
);

teacherSchema.index({ branchIds: 1 });
teacherSchema.index({ isActive: 1, status: 1 });

const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', teacherSchema);

export default Teacher;
