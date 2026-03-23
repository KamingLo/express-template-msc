import bcrypt from 'bcrypt';
import { User, type UserLogin, type UserRegister } from '../models/user.js';
import { OTP } from '../models/otp.js';
import { generateToken } from '../utils/jwt.js'; 
import { sendRegistrationOTP } from './mailService.js'; 

export const requestOTP = async (email: string): Promise<void> => {
  // 1. Cek apakah email sudah punya akun
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // Pesan error disamakan dengan Go
    throw new Error('Email sudah terdaftar, silakan langsung login');
  }

  // 2. Generate 6 digit kode random
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 3. Persiapkan data OTP
  const expiredAt = new Date(Date.now() + 5 * 60 * 1000);

  // 4. Hapus OTP lama buat email ini (biar gak numpuk di DB)
  await OTP.deleteMany({ email });

  // 5. Simpan ke database
  const otp = new OTP({ email, code, expiredAt });
  try {
    await otp.save();
  } catch (err) {
    throw new Error('Gagal membuat sesi verifikasi');
  }

  // 6. EKSEKUSI KIRIM EMAIL
  try {
    await sendRegistrationOTP(email, code);
  } catch (err) {
    // Jika email gagal, hapus lagi OTP-nya biar konsisten (seperti di Go)
    await OTP.deleteOne({ _id: otp._id });
    throw new Error('Gagal mengirim email, pastikan alamat email benar');
  }
};

export const registerWithOTP = async (input: UserRegister, otpCode: string): Promise<void> => {
  const otp = await OTP.findOne({ email: input.email, code: otpCode });

  // Validasi expiry dan keberadaan OTP
  if (!otp || new Date() > otp.expiredAt) {
    throw new Error('Kode OTP salah atau kedaluwarsa');
  }

  // Hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(input.password, salt);
  input.password = hashedPassword;

  // Di Go kamu bilang: GORM otomatis jalankan BeforeCreate (GenerateCustomID)
  // Di Mongoose, pastikan kamu sudah pasang middleware `pre('save')` di schema User jika ingin hal yang sama
  try {
    await User.create(input);
  } catch (err) {
    throw new Error('Gagal menyimpan akun');
  }

  // Hapus OTP setelah berhasil register
  await OTP.deleteOne({ _id: otp._id });
};

export const loginUser = async (input: UserLogin): Promise<string> => {
  const user = await User.findOne({ email: input.email });
  
  // Mengikuti Go: Error spesifik "Email salah"
  if (!user) {
    throw new Error('Email tidak ditemukan');
  }

  // Mengikuti Go: Error spesifik "Password salah"
  const isMatch = await bcrypt.compare(input.password, user.password!);
  if (!isMatch) {
    throw new Error('Password salah');
  }

  return generateToken(user._id.toString(), user.email);
};

export const handleGoogleLogin = async (email: string): Promise<string> => {
  const user = await User.findOne({ email });

  // Mengikuti Go: Jika tidak ditemukan, return error agar controller tahu
  if (!user) {
    throw new Error('User tidak ditemukan'); 
  }

  return generateToken(user._id.toString(), user.email);
};