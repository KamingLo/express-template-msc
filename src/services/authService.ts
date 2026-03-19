import bcrypt from 'bcrypt';
import { User, type UserLogin, type UserRegister } from '../models/user.js';
import { OTP } from '../models/otp.js';
import { generateToken } from '../utils/jwt.js'; 
import { sendRegistrationOTP } from './mailService.js'; 

export const requestOTP = async (email: string): Promise<void> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('email sudah terdaftar, silakan langsung login');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiredAt = new Date(Date.now() + 5 * 60 * 1000);

  await OTP.deleteMany({ email });

  const otp = new OTP({ email, code, expiredAt });
  try {
    await otp.save();
  } catch (err) {
    throw new Error('gagal membuat sesi verifikasi');
  }

  try {
    await sendRegistrationOTP(email, code);
  } catch (err) {
    await OTP.deleteOne({ _id: otp._id });
    throw new Error('gagal mengirim email, pastikan alamat email benar');
  }
};

export const registerWithOTP = async (input: UserRegister , otpCode: string): Promise<void> => {
  const otp = await OTP.findOne({ email: input.email, code: otpCode });

  if (!otp || new Date() > otp.expiredAt) {
    throw new Error('kode OTP salah atau kedaluwarsa');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(input.password, salt);
  input.password = hashedPassword;

  try {
    await User.create(input);
  } catch (err) {
    throw new Error('gagal menyimpan akun');
  }

  await OTP.deleteOne({ _id: otp._id });
};

export const loginUser = async (input: UserLogin): Promise<string> => {
  const user = await User.findOne({ email: input.email });
  
  // Pastikan user ada DAN memiliki password (kasus user Google Login tidak punya password)
  if (!user || !user.password) {
    throw new Error('email atau password salah');
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    throw new Error('email atau password salah');
  }

  // Gunakan .toString() untuk mengubah ObjectId menjadi string
  return generateToken(user._id.toString(), user.email);
};

export const handleGoogleLogin = async (email: string): Promise<string | null> => {
  // Hanya cari user, jangan buat dulu
  const user = await User.findOne({ email });

  if (!user) {
    // Kembalikan null agar controller tahu user harus register
    return null;
  }

  // Jika ada, buatkan token
  return generateToken(user._id.toString(), user.email);
};