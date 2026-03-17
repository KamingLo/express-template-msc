import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import setupRouter from './routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Hubungkan ke Database
connectDB();

// 2. Middleware Dasar
app.use(express.json());

// 3. Pasang Router
app.use('', setupRouter());

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});