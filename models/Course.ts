import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ICourse extends Document {
  name: { en: string; hi?: string; ur?: string };
  slug: string;
  divisionId: Types.ObjectId;
  category?: string;
  description: { en?: string; hi?: string; ur?: string };
  shortDescription: { en?: string; hi?: string; ur?: string };
  image?: string;
  duration?: string;
  fee?: number;
  ageEligibility?: string;
  classEligibility: Types.ObjectId[];
  branchIds: Types.ObjectId[];
  teacherIds: Types.ObjectId[];
  status: 'active' | 'inactive' | 'archived';
  featured: boolean;
  displayOrder: number;
  seo: { title?: string; description?: string; keywords?: string };
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    name: {
      en: { type: String, required: true },
      hi: String,
      ur: String,
    },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    divisionId: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
    category: String,
    description: { en: String, hi: String, ur: String },
    shortDescription: { en: String, hi: String, ur: String },
    image: String,
    duration: String,
    fee: Number,
    ageEligibility: String,
    classEligibility: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
    teacherIds: [{ type: Schema.Types.ObjectId, ref: 'Teacher' }],
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    seo: { title: String, description: String, keywords: String },
    isActive: { type: Boolean, default: true },
    deletedAt: Date,
  },
  { timestamps: true }
);

courseSchema.index({ divisionId: 1 });
courseSchema.index({ status: 1, featured: 1 });
courseSchema.index({ branchIds: 1 });

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);

export default Course;
