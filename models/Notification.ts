import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  title: { en: string; hi?: string; ur?: string };
  message: { en: string; hi?: string; ur?: string };
  type: 'general' | 'branch' | 'class' | 'course' | 'student' | 'parent';
  targetBranchIds: Types.ObjectId[];
  targetClassIds: Types.ObjectId[];
  targetCourseIds: Types.ObjectId[];
  targetStudentIds: Types.ObjectId[];
  targetParentIds: Types.ObjectId[];
  publishDate?: Date;
  expiryDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'expired';
  readBy: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { en: { type: String, required: true }, hi: String, ur: String },
    message: { en: { type: String, required: true }, hi: String, ur: String },
    type: {
      type: String,
      enum: ['general', 'branch', 'class', 'course', 'student', 'parent'],
      required: true,
    },
    targetBranchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
    targetClassIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    targetCourseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    targetStudentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    targetParentIds: [{ type: Schema.Types.ObjectId, ref: 'Parent' }],
    publishDate: Date,
    expiryDate: Date,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['draft', 'published', 'expired'], default: 'draft' },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

notificationSchema.index({ status: 1, publishDate: 1 });
notificationSchema.index({ targetBranchIds: 1 });
notificationSchema.index({ targetStudentIds: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
