import { Router } from 'express';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import { corsMiddleware, rateLimitMiddleware } from './routes/allMiddleware.js';

const setupRouter = (): Router => {
  const router = Router();

  // Global Middleware
  router.use(corsMiddleware);
//   router.use(rateLimitMiddleware);

  // Route Groups
  router.use('/auth', authRoutes);
  router.use('/books', bookRoutes);

  return router;
};

export default setupRouter;