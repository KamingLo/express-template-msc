import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from './allMiddleware.js';

const router = Router();


router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

router.post('/login', authController.login);
router.post('/otp',  authController.requestOTP);
router.post('/register', authController.register);

// --- Private Routes (Butuh Login) ---
// Middleware diaplikasikan secara spesifik pada route di bawah ini
router.get('/me', authMiddleware , authController.getMe);
router.post('/logout',  authMiddleware, authController.logout);

export default router;