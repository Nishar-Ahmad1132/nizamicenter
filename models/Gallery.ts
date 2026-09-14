import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IGallery extends Document {
  url: string;
  thumbnailUrl?: string;
  altText: { en?: string; hi?: string; ur?: string };
  caption: { en?: string; hi?: string; ur?: string };
  category: 'classes' | 'events' | 'branches' | 'achievements' | 'activities' | 'other';
  branchId?: Types.ObjectId;
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    url: { type: String, required: true },
    thumbnailUrl: String,
    altText: { en: String, hi: String, ur: String },
    caption: { en: String, hi: String, ur: String },
    category: {
      type: String,
      enum: ['classes', 'events', 'branches', 'achievements', 'activities', 'other'],
      required: true,
    },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    isPublished: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

gallerySchema.index({ category: 1, isPublished: 1 });
gallerySchema.index({ displayOrder: 1 });

const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', gallerySchema);

export default Gallery;
