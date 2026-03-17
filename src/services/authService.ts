import { User, type IUser, type UserLogin } from '../models/user.js';
import { hashPassword, checkPasswordHash } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async (userData: Partial<IUser>): Promise<void> => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("email ini sudah terpakai");
  }

  if (userData.password) {
    userData.password = await hashPassword(userData.password);
  }

  await User.create(userData);
};

export const loginUser = async (input: UserLogin): Promise<string> => {
  const user = await User.findOne({ email: input.email });
  if (!user) {
    throw new Error("data tidak ditemukan");
  }

  const isPasswordValid = await checkPasswordHash(input.password, user.password!);
  if (!isPasswordValid) {
    throw new Error("password yang kamu masukkan salah");
  }

  return await generateToken(user._id.toString(), user.email);
};