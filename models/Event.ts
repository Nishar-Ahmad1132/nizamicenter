import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IEvent extends Document {
  title: { en: string; hi?: string; ur?: string };
  description: { en?: string; hi?: string; ur?: string };
  date: Date;
  time?: string;
  location?: string;
  branchId?: Types.ObjectId;
  image?: string;
  registrationUrl?: string;
  status: 'draft' | 'published' | 'cancelled';
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { en: { type: String, required: true }, hi: String, ur: String },
    description: { en: String, hi: String, ur: String },
    date: { type: Date, required: true },
    time: String,
    location: String,
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    image: String,
    registrationUrl: String,
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'draft' },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1, status: 1 });

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
