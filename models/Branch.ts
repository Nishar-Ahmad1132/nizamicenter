import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IOpeningHour {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface IBranch extends Document {
  name: string;
  slug: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  openingHours: IOpeningHour[];
  description: { en?: string; hi?: string; ur?: string };
  images: string[];
  logo?: string;
  facilities: string[];
  isActive: boolean;
  displayOrder: number;
  seo: { title?: string; description?: string; keywords?: string };
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String, required: true },
    area: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    googleMapsUrl: { type: String },
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    description: {
      en: String,
      hi: String,
      ur: String,
    },
    images: [{ type: String }],
    logo: { type: String },
    facilities: [{ type: String }],
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
      keywords: String,
    },
  },
  { timestamps: true }
);

branchSchema.index({ isActive: 1 });
branchSchema.index({ displayOrder: 1 });

const Branch: Model<IBranch> =
  mongoose.models.Branch || mongoose.model<IBranch>('Branch', branchSchema);

export default Branch;
