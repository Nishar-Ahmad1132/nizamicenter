import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IParent extends Document {
  userId: Types.ObjectId;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  childrenIds: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const parentSchema = new Schema<IParent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: String,
    email: { type: String, lowercase: true, trim: true },
    address: String,
    childrenIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

parentSchema.index({ phone: 1 });
parentSchema.index({ childrenIds: 1 });

const Parent: Model<IParent> =
  mongoose.models.Parent || mongoose.model<IParent>('Parent', parentSchema);

export default Parent;
