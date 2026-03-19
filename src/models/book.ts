import mongoose, { Schema, Document } from 'mongoose';
import { generateCustomID } from '../utils/random.js';

export interface IBook extends Document {
  title: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const BookSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: () => generateCustomID('bk', 4),
    },
    title: { 
      type: String, 
      required: [true, 'Title is required'] 
    },
    author: { 
      type: String, 
      required: [true, 'Author is required'] 
    },
    deletedAt: { 
      type: Date, 
      default: null 
    },
  },
  {
    timestamps: true, // Menangani createdAt dan updatedAt otomatis
    versionKey: false,
  }
);

export const Book = mongoose.model<IBook>('Book', BookSchema);