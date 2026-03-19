import mongoose, { Schema, Document } from 'mongoose';
import { generateCustomID } from '../utils/random.js';

export interface IOTP extends Document {
  email: string;
  code: string;
  expiredAt: Date;
}

const OTPSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: () => generateCustomID('otp', 4),
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      index: true 
    },
    code: { 
      type: String, 
      required: [true, 'Code is required'] 
    },
    expiredAt: { 
      type: Date, 
      required: [true, 'Expired at is required'] 
    },
  },
  {
    versionKey: false,
  }
);

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);