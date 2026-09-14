import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IStudyMaterial extends Document {
  title: string;
  description?: string;
  type: 'pdf' | 'doc' | 'image' | 'link' | 'video';
  url: string;
  divisionId?: Types.ObjectId;
  classId?: Types.ObjectId;
  courseId?: Types.ObjectId;
  subjectId?: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const studyMaterialSchema = new Schema<IStudyMaterial>(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    type: { type: String, enum: ['pdf', 'doc', 'image', 'link', 'video'], required: true },
    url: { type: String, required: true },
    divisionId: { type: Schema.Types.ObjectId, ref: 'Division' },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studyMaterialSchema.index({ classId: 1, subjectId: 1 });
studyMaterialSchema.index({ courseId: 1 });
studyMaterialSchema.index({ divisionId: 1 });

const StudyMaterial: Model<IStudyMaterial> =
  mongoose.models.StudyMaterial || mongoose.model<IStudyMaterial>('StudyMaterial', studyMaterialSchema);

export default StudyMaterial;
