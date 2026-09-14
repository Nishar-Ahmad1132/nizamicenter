import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDivision extends Document {
  name: { en: string; hi?: string; ur?: string };
  slug: string;
  code: string;
  description: { en?: string; hi?: string; ur?: string };
  icon?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const divisionSchema = new Schema<IDivision>(
  {
    name: {
      en: { type: String, required: true },
      hi: String,
      ur: String,
    },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: {
      en: String,
      hi: String,
      ur: String,
    },
    icon: String,
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Division: Model<IDivision> =
  mongoose.models.Division || mongoose.model<IDivision>('Division', divisionSchema);

export default Division;
