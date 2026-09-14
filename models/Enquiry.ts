import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type EnquiryStatus = 'new' | 'contacted' | 'followup' | 'converted' | 'not_interested';

export interface IEnquiry extends Document {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  interestedDivision?: string;
  interestedClass?: string;
  interestedCourse?: string;
  branchId?: Types.ObjectId;
  message?: string;
  status: EnquiryStatus;
  lastContactedAt?: Date;
  notes?: string;
  assignedTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: String,
    email: { type: String, lowercase: true, trim: true },
    interestedDivision: String,
    interestedClass: String,
    interestedCourse: String,
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    message: String,
    status: {
      type: String,
      enum: ['new', 'contacted', 'followup', 'converted', 'not_interested'],
      default: 'new',
    },
    lastContactedAt: Date,
    notes: String,
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ phone: 1 });

const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', enquirySchema);

export default Enquiry;
