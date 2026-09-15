import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IClass extends Document {
  name: { en: string; hi?: string; ur?: string };
  slug: string;
  numericValue?: number;
  divisionId: Types.ObjectId;
  description?: string;
  fee?: number;
  status: 'active' | 'inactive';
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      en: { type: String, required: true },
      hi: String,
      ur: String,
    },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    numericValue: Number,
    divisionId: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
    description: String,
    fee: Number,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

classSchema.index({ divisionId: 1 });
classSchema.index({ displayOrder: 1 });

const Class: Model<IClass> =
  mongoose.models.Class || mongoose.model<IClass>('Class', classSchema);

export default Class;
