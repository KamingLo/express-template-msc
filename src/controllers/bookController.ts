import { type Request, type Response } from 'express';
import * as bookService from '../services/bookServices.js';

export const getBooks = async (_req: Request, res: Response) => {
  const books = await bookService.getAllBooks();
  res.status(200).json(books);
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const book = await bookService.createBook(req.body);
    res.status(201).json({ 
      message: "Buku berhasil disimpan", 
      data: book 
    });
  } catch (error: any) {
    res.status(409).json({ 
      error: "Gagal menyimpan data", 
      detail: error.message 
    });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const book = await bookService.updateBook(id, req.body);
    res.status(200).json({ 
      message: "Update berhasil", 
      data: book 
    });
  } catch (error: any) {
    res.status(404).json({ 
      message: "Data tidak ditemukan atau gagal update" 
    });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await bookService.deleteBook(id);
    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error: any) {
    res.status(404).json({ 
      message: "Data tidak ditemukan atau sudah dihapus" 
    });
  }
};