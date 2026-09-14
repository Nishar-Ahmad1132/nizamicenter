import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IPerformanceRecord extends Document {
  studentId: Types.ObjectId;
  enrollmentId: Types.ObjectId;
  type: 'test' | 'assignment' | 'exam' | 'progress';
  subjectId?: Types.ObjectId;
  courseId?: Types.ObjectId;
  title: string;
  score?: number;
  maxScore?: number;
  grade?: string;
  remarks?: string;
  date: Date;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const performanceRecordSchema = new Schema<IPerformanceRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    type: { type: String, enum: ['test', 'assignment', 'exam', 'progress'], required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    title: { type: String, required: true },
    score: Number,
    maxScore: Number,
    grade: String,
    remarks: String,
    date: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

performanceRecordSchema.index({ studentId: 1, date: -1 });
performanceRecordSchema.index({ enrollmentId: 1 });

const PerformanceRecord: Model<IPerformanceRecord> =
  mongoose.models.PerformanceRecord ||
  mongoose.model<IPerformanceRecord>('PerformanceRecord', performanceRecordSchema);

export default PerformanceRecord;
