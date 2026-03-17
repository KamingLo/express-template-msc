import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/template_db';

    const conn = await mongoose.connect(mongoURI);

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[Error] Database connection failed: ${error.message}`);
    // Keluar dari proses jika gagal koneksi ke DB
    process.exit(1);
  }
};

// Menangani event saat koneksi terputus
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected');
});

export default connectDB;