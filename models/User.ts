import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserRole =
  | 'super_admin'
  | 'branch_admin'
  | 'teacher'
  | 'accountant'
  | 'content_manager'
  | 'student'
  | 'parent';

export interface IUser extends Document {
  email?: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, sparse: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'branch_admin', 'teacher', 'accountant', 'content_manager', 'student', 'parent'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    lastLogin: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
