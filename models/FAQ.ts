import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFAQ extends Document {
  question: { en: string; hi?: string; ur?: string };
  answer: { en: string; hi?: string; ur?: string };
  category?: string;
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>(
  {
    question: { en: { type: String, required: true }, hi: String, ur: String },
    answer: { en: { type: String, required: true }, hi: String, ur: String },
    category: String,
    isPublished: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

faqSchema.index({ isPublished: 1, displayOrder: 1 });

const FAQ: Model<IFAQ> =
  mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', faqSchema);

export default FAQ;
