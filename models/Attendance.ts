import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface IAttendance extends Document {
  enrollmentId?: Types.ObjectId;
  studentId: Types.ObjectId;
  branchId: Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  markedBy: Types.ObjectId;
  notes?: string;
  isEdited: boolean;
  editedBy?: Types.ObjectId;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: 'Enrollment', sparse: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'leave'],
      required: true,
    },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String,
    isEdited: { type: Boolean, default: false },
    editedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    editedAt: Date,
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student on the same date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ enrollmentId: 1, date: 1 }, { sparse: true });
attendanceSchema.index({ branchId: 1, date: 1 });
attendanceSchema.index({ date: 1 });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;
