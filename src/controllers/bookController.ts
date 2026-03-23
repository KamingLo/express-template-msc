import { type Request, type Response } from 'express';
import * as bookService from '../services/bookServices.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getBooks = async (_req: Request, res: Response) => {
  try {
    const books = await bookService.getAllBooks();
    return sendSuccess(res, 200, "Berhasil mengambil semua data buku", books);
  } catch (err: any) {
    return sendError(res, 500, "Gagal mengambil data buku", err.message);
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const book = await bookService.createBook(req.body);
    return sendSuccess(res, 201, "Buku berhasil disimpan", book);
  } catch (err: any) {
    return sendError(res, 409, "Gagal menyimpan data", err.message);
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const id = req.params.id as string; 
  
  try {
    const updatedBook = await bookService.updateBook(id, req.body);
    return sendSuccess(res, 200, "Update berhasil", updatedBook);
  } catch (err: any) {
    return sendError(res, 404, "Data tidak ditemukan atau gagal update", err.message);
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    await bookService.deleteBook(id);
    return sendSuccess(res, 200, "Berhasil dihapus");
  } catch (err: any) {
    return sendError(res, 404, "Data tidak ditemukan atau sudah dihapus", err.message);
  }
};