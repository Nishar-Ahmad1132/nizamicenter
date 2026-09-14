import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description?: string;
  subjectId?: Types.ObjectId;
  classId?: Types.ObjectId;
  courseId?: Types.ObjectId;
  branchId: Types.ObjectId;
  dueDate: Date;
  attachments: string[];
  createdBy: Types.ObjectId;
  status: 'active' | 'closed';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    dueDate: { type: Date, required: true },
    attachments: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

assignmentSchema.index({ branchId: 1, dueDate: 1 });
assignmentSchema.index({ classId: 1 });

const Assignment: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', assignmentSchema);

export default Assignment;
