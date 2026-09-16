import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type IssueCategory =
  | 'classroom_facility'
  | 'student_behavior'
  | 'curriculum_books'
  | 'schedule_timing'
  | 'leave_request'
  | 'other';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type IssueStatus = 'pending' | 'in_review' | 'resolved' | 'rejected';

export interface ITeacherIssue extends Document {
  teacherId: Types.ObjectId;
  branchId?: Types.ObjectId;
  category: IssueCategory;
  priority: IssuePriority;
  title: string;
  description: string;
  status: IssueStatus;
  adminResponse?: string;
  respondedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const teacherIssueSchema = new Schema<ITeacherIssue>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    category: {
      type: String,
      enum: [
        'classroom_facility',
        'student_behavior',
        'curriculum_books',
        'schedule_timing',
        'leave_request',
        'other',
      ],
      default: 'other',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'resolved', 'rejected'],
      default: 'pending',
    },
    adminResponse: { type: String, trim: true },
    respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true }
);

teacherIssueSchema.index({ teacherId: 1, createdAt: -1 });
teacherIssueSchema.index({ status: 1, priority: -1 });

const TeacherIssue: Model<ITeacherIssue> =
  mongoose.models.TeacherIssue ||
  mongoose.model<ITeacherIssue>('TeacherIssue', teacherIssueSchema);

export default TeacherIssue;
