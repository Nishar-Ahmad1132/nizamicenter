import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IAchievement extends Document {
  title: { en: string; hi?: string; ur?: string };
  description: { en?: string; hi?: string; ur?: string };
  studentName?: string;
  image?: string;
  date: Date;
  category: string;
  branchId?: Types.ObjectId;
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    title: { en: { type: String, required: true }, hi: String, ur: String },
    description: { en: String, hi: String, ur: String },
    studentName: String,
    image: String,
    date: { type: Date, required: true },
    category: { type: String, required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    isPublished: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

achievementSchema.index({ isPublished: 1, date: -1 });

const Achievement: Model<IAchievement> =
  mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', achievementSchema);

export default Achievement;
