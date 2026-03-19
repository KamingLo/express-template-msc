import mongoose, { Schema, Document } from 'mongoose';
import { generateCustomID } from '../utils/random.js';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const UserSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: () => generateCustomID('us', 4),
    },
    username: { 
      type: String, 
      required: [true, 'Username is required'] 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true,
      lowercase: true 
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'] 
    },
    deletedAt: { 
      type: Date, 
      default: null 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);

// DTO untuk Login (setara dengan UserLogin struct di Go)
export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
    otp_code: string;
    email:string;
    password:string;
    username:string;
}