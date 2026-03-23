import { type Request, type Response, type NextFunction } from 'express';
import * as authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { type UserRegister, type UserLogin } from '../models/user.js';
import passport from 'passport';

export const googleLogin = (req: Request, res: Response) => {
  const platform = (req.query.platform as string) || 'web';

  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&scope=email%20profile&state=${platform}`;

  return sendSuccess(res, 200, "URL Auth berhasil dibuat", { url: targetUrl });
};

export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, async (err: any, user: any) => {
    if (err || !user) {
      const loginURL = `${process.env.OAUTH_FRONTEND_URL}?error=google_auth_failed`;
      return res.redirect(loginURL);
    }

    try {
      const platform = (req.query.state as string) || 'web';
      
      const token = await authService.handleGoogleLogin(user.email);

      if (platform === "mobile") {
        return res.redirect(`myapp://auth?token=${token}`);
      }

      return res.redirect(`${process.env.SUCCESS_FRONTEND_URL}?token=${token}`);

    } catch (err: any) {
      const errorMessage = "user_not_registered";
      const platform = (req.query.state as string) || 'web';
      
      if (platform === "mobile") {
        return res.redirect(`myapp://login?error=${errorMessage}`);
      }

      const loginURL = `${process.env.OAUTH_FRONTEND_URL}?error=${errorMessage}&email=${user.email}`;
      return res.redirect(loginURL);
    }
  })(req, res, next);
};

export const requestOTP = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) return sendError(res, 400, "Format email salah", "Email required");

  try {
    await authService.requestOTP(email);
    return sendSuccess(res, 200, "Kode OTP telah dikirim ke email kamu");
  } catch (err: any) {
    return sendError(res, 400, "Gagal mengirim OTP", err.message);
  }
};

export const register = async (req: Request, res: Response) => {
  const { otp_code, ...userData } = req.body;

  if (!otp_code) return sendError(res, 400, "Data tidak lengkap", "OTP code required");

  try {
    await authService.registerWithOTP(userData as UserRegister, otp_code);
    return sendSuccess(res, 201, "Registrasi berhasil, silakan login");
  } catch (err: any) {
    return sendError(res, 400, "Gagal registrasi", err.message);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const input: UserLogin = req.body;
    const token = await authService.loginUser(input);
    
    return sendSuccess(res, 200, "Login berhasil", { token });
  } catch (err: any) {
    return sendError(res, 401, "Email atau password salah", err.message);
  }
};

export const logout = (_req: Request, res: Response) => {
  return sendSuccess(res, 200, "Berhasil keluar");
};

export const getMe = (_req: Request, res: Response) => {
  const id = res.locals.userId;
  const email = res.locals.userEmail;

  return sendSuccess(res, 200, "Data profil berhasil diambil", { id, email });
};