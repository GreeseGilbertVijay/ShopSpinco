import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type UserRole = 'superAdmin' | 'admin' | 'customer';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  otpCode?: string;
  otpExpiresAt?: Date;
  resetCode?: string;
  resetExpiresAt?: Date;
  resetAttempts?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['superAdmin', 'admin', 'customer'], required: true, default: 'customer' },
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
    resetCode: { type: String },
    resetExpiresAt: { type: Date },
    resetAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Stored in "shopusers", not "users": the shared spinco-dashboard database's "users" collection
// belongs to the dashboard app and has a unique employeeId index our documents don't populate,
// so every signup after the first would fail with a duplicate-key error.
export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema, 'shopusers');
