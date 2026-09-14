import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ITimetable extends Document {
  branchId: Types.ObjectId;
  divisionId: Types.ObjectId;
  classId?: Types.ObjectId;
  courseId?: Types.ObjectId;
  subjectId?: Types.ObjectId;
  teacherId: Types.ObjectId;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
  status: 'active' | 'inactive';
  academicYearId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timetableSchema = new Schema<ITimetable>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    divisionId: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

timetableSchema.index({ branchId: 1, day: 1 });
timetableSchema.index({ teacherId: 1, day: 1 });
timetableSchema.index({ classId: 1, day: 1 });
timetableSchema.index({ academicYearId: 1 });

const Timetable: Model<ITimetable> =
  mongoose.models.Timetable || mongoose.model<ITimetable>('Timetable', timetableSchema);

export default Timetable;
