import { Book, type IBook } from '../models/book.js';

export const getAllBooks = async (): Promise<IBook[]> => {
  return await Book.find({ deletedAt: null });
};

export const createBook = async (bookData: Partial<IBook>): Promise<IBook> => {
  return await Book.create(bookData);
};

export const updateBook = async (id: string, input: Partial<IBook>): Promise<IBook | null> => {
  const updatedBook = await Book.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true } // Mengembalikan data setelah diupdate
  );
  
  if (!updatedBook) throw new Error("Data tidak ditemukan");
  return updatedBook;
};

export const deleteBook = async (id: string): Promise<void> => {
  const result = await Book.findByIdAndDelete(id);
  if (!result) {
    throw new Error("Data tidak ditemukan atau sudah dihapus");
  }
};