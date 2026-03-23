import { Book, type IBook } from '../models/book.js';

export const getAllBooks = async (): Promise<IBook[]> => {
  return await Book.find();
};

export const createBook = async (bookData: Partial<IBook>): Promise<void> => {
  try {
    await Book.create(bookData);
  } catch (err) {
    throw new Error("Gagal membuat data buku");
  }
};

export const updateBook = async (id: string, input: Partial<IBook>): Promise<IBook> => {
  const book = await Book.findById(id);

  if (!book) {
    throw new Error("Buku tidak ditemukan");
  }

  Object.assign(book, input);

  const updatedBook = await book.save();

  return updatedBook;
};

export const deleteBook = async (id: string): Promise<void> => {
  const result = await Book.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    throw new Error("Data tidak ditemukan atau sudah dihapus");
  }
};