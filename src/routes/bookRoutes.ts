import { Router } from 'express';
import * as bookController from '../controllers/bookController.js';
import { authMiddleware } from './allMiddleware.js';

const router = Router();

// Public: Lihat semua buku
router.get('/', bookController.getBooks);

// Protected: Operasi tulis/hapus (Gunakan middleware di sini)
router.post('/', authMiddleware, bookController.createBook);
router.patch('/:id', authMiddleware, bookController.updateBook);
router.delete('/:id', authMiddleware, bookController.deleteBook);

export default router;