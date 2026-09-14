import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  role?: string;
  message: { en: string; hi?: string; ur?: string };
  rating: number;
  photo?: string;
  branchId?: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    role: String,
    message: { en: { type: String, required: true }, hi: String, ur: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    photo: String,
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isPublished: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testimonialSchema.index({ status: 1, isPublished: 1 });

const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', testimonialSchema);

export default Testimonial;
