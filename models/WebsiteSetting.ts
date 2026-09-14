import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IWebsiteSetting extends Document {
  key: string;
  value: string;
  type: 'string' | 'json' | 'boolean' | 'number';
  label: string;
  group: string;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const websiteSettingSchema = new Schema<IWebsiteSetting>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: String, default: '' },
    type: { type: String, enum: ['string', 'json', 'boolean', 'number'], default: 'string' },
    label: { type: String, required: true },
    group: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

websiteSettingSchema.index({ group: 1 });

const WebsiteSetting: Model<IWebsiteSetting> =
  mongoose.models.WebsiteSetting ||
  mongoose.model<IWebsiteSetting>('WebsiteSetting', websiteSettingSchema);

export default WebsiteSetting;
