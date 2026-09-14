import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ISubject extends Document {
  name: { en: string; hi?: string; ur?: string };
  code?: string;
  divisionId: Types.ObjectId;
  classIds: Types.ObjectId[];
  description?: string;
  icon?: string;
  status: 'active' | 'inactive';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      en: { type: String, required: true },
      hi: String,
      ur: String,
    },
    code: { type: String, uppercase: true, trim: true },
    divisionId: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
    classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    description: String,
    icon: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subjectSchema.index({ divisionId: 1 });
subjectSchema.index({ classIds: 1 });

const Subject: Model<ISubject> =
  mongoose.models.Subject || mongoose.model<ISubject>('Subject', subjectSchema);

export default Subject;
