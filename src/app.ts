import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import setupRouter from './routes.js';
import { initOAuth } from './config/oauth.js';
import cluster from 'node:cluster'; // Tambahkan ini
import { availableParallelism } from 'node:os'; // Tambahkan ini
import process from 'node:process';

dotenv.config();

const PORT = process.env.PORT || 3000;
const numCPUs = availableParallelism(); // Mendapatkan jumlah core CPU

if (cluster.isPrimary) {
  // --- BAGIAN MASTER ---
  console.log(`[Master] Primary process ${process.pid} is running`);

  // Fork workers sesuai jumlah CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`[Master] Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  // --- BAGIAN WORKER (Aplikasi Express kamu) ---
  const app = express();

  app.use(cookieParser());
  
  // Database dan OAuth perlu diinisialisasi di setiap worker
  connectDB();
  initOAuth(app);

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      // Menambahkan PID ke log agar kamu tahu worker mana yang menjawab
      console.log(`[Worker ${process.pid}] ${req.method.padEnd(7)} ${req.originalUrl} | ${res.statusCode} | ${duration}ms`);
    });
    next();
  });

  app.use(express.json());
  app.use('', setupRouter());

  app.listen(PORT, () => {
    console.log(`[Worker ${process.pid}] Running on http://localhost:${PORT}`);
  });
}