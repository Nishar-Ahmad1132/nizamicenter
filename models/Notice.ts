import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface INotice extends Document {
  title: { en: string; hi?: string; ur?: string };
  content: { en: string; hi?: string; ur?: string };
  category: 'admission' | 'holiday' | 'batch' | 'timing' | 'event' | 'announcement' | 'other';
  publishDate: Date;
  expiryDate?: Date;
  branchIds: Types.ObjectId[];
  status: 'draft' | 'published' | 'archived';
  priority: 'low' | 'medium' | 'high';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noticeSchema = new Schema<INotice>(
  {
    title: { en: { type: String, required: true }, hi: String, ur: String },
    content: { en: { type: String, required: true }, hi: String, ur: String },
    category: {
      type: String,
      enum: ['admission', 'holiday', 'batch', 'timing', 'event', 'announcement', 'other'],
      required: true,
    },
    publishDate: { type: Date, required: true },
    expiryDate: Date,
    branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

noticeSchema.index({ status: 1, publishDate: -1 });
noticeSchema.index({ branchIds: 1 });

const Notice: Model<INotice> =
  mongoose.models.Notice || mongoose.model<INotice>('Notice', noticeSchema);

export default Notice;
