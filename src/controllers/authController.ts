import { type Request, type Response } from 'express';
import passport from 'passport';
import * as authService from '../services/authService.js';
import { type UserLogin, type UserRegister, type IUser } from '../models/user.js';

// --- Global & Module Augmentation ---
// 1. Untuk req.user (Passport)
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }
  }
}

// 2. Untuk req.session (express-session)
// Harus menggunakan 'declare module' agar menimpa interface SessionData yang asli
declare module 'express-session' {
  interface SessionData {
    platform?: string;
  }
}

/**
 * GOOGLE LOGIN
 */
export const googleLogin = (req: Request, res: Response): void => {
  // 1. Ambil platform dari query (default: "web")
  const platform = (req.query.platform as string) || 'web';

  // 2. Simpan platform di session (Setara sess.Values["platform"] di Go)
  // Membutuhkan middleware 'express-session' terpasang di app.ts
  req.session.platform = platform;

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  const options = {
    redirect_uri: process.env.GOOGLE_CALLBACK_URL as string,
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    // 'state' sering digunakan untuk meneruskan data antar request OAuth
    state: platform, 
  };

  const qs = new URLSearchParams(options);
  const url = `${rootUrl}?${qs.toString()}`;

  // 4. Kirim URL ke frontend dalam bentuk JSON
  // Frontend akan melakukan: window.location.href = res.data.url
  res.status(200).json({ url });
};

/**
 * GOOGLE CALLBACK
 */
export const googleCallback = (req: Request, res: Response): void => {
  passport.authenticate('google', { session: false }, async (err: Error | null, profile: any) => {
    if (err || !profile) {
      return res.redirect(`${process.env.OAUTH_FRONTEND_URL}?error=failed_to_complete_auth`);
    }

    try {
      const email = profile.emails && profile.emails[0].value;
      if (!email) throw new Error("Email not found");

      // 1. Coba login
      const token = await authService.handleGoogleLogin(email);
      const platform = req.session.platform || 'web';

      // 2. Jika token NULL, berarti user belum terdaftar
      if (!token) {
        
        if (platform === 'mobile') {
          // Arahkan ke deep link register di aplikasi mobile
          return res.redirect(`myapp://register`);
        }

        // Arahkan ke halaman register di web
        return res.redirect(`${process.env.OAUTH_FRONTEND_URL}/register`);
      }

      // 3. Jika user ADA (Login Berhasil)
      if (platform === 'mobile') {
        return res.redirect(`myapp://auth?token=${token}`);
      }
      return res.redirect(`${process.env.SUCCESS_FRONTEND_URL}?token=${token}`);

    } catch (error) {
      console.error("===== OAUTH ERROR =====", error);
      return res.redirect(`${process.env.OAUTH_FRONTEND_URL}?error=server_error`);
    }
  })(req, res);
};

/**
 * REQUEST OTP
 */
export const requestOTP = async (req: Request<{}, {}, { email: string }>, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Format email salah' });
    return;
  }
  try {
    await authService.requestOTP(email);
    res.status(200).json({ message: 'Kode OTP telah dikirim ke email kamu' });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

/**
 * REGISTER
 */
export const register = async (req: Request<{}, {}, UserRegister>, res: Response): Promise<void> => {
    
    const { otp_code } = req.body;

  if (!otp_code || !req.body.email) {
    res.status(400).json({ error: 'Data tidak lengkap' });
    return;
  }

  try {
    await authService.registerWithOTP(req.body, otp_code);
    res.status(201).json({ message: 'Registrasi berhasil, silakan login' });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

/**
 * LOGIN
 */
export const login = async (req: Request<{}, {}, UserLogin>, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Input tidak valid' });
    return;
  }
  try {
    const token = await authService.loginUser({ email, password });
    res.status(200).json({ message: 'Login berhasil', token });
  } catch (err) {
    const error = err as Error;
    res.status(401).json({ error: error.message });
  }
};

/**
 * LOGOUT
 */
export const logout = (_req: Request, res: Response): void => {
  res.status(200).json({ message: 'Berhasil keluar' });
};

/**
 * GET ME
 */
export const getMe = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.status(200).json({
    id: req.user.id,
    email: req.user.email,
  });
};