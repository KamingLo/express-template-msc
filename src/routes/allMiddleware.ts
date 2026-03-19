import type { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';

// 1. Interface untuk Request yang terautentikasi (Type-Safe)
declare global {
  namespace Express {
    interface user {
        id: string;
        email: string;
      }
    }
  }
  
// --- Auth Middleware ---
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let tokenString = '';

  // A. Cek Cookie (Web) - Membutuhkan cookie-parser di app.ts
  if (req.cookies && req.cookies.auth_token) {
    tokenString = req.cookies.auth_token;
  } 
  // B. Cek Header (Mobile/Flutter)
  else {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      tokenString = authHeader.split(' ')[1];
    }
  }

  if (!tokenString) {
    return res.status(401).json({ error: "Sesi berakhir, silakan login kembali" });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    const { payload } = await jose.jwtVerify(tokenString, secret);

    // Simpan ke request agar bisa dipakai di controller (Setara c.Set di Gin)
    req.user = {
      id: payload.user_id as string,
      email: payload.email as string,
    };
    
    next();
  } catch (err) {
    res.status(401).json({ error: "Token tidak valid atau kedaluwarsa" });
  }
};

// --- Rate Limit Middleware (Custom Lockout Logic) ---
interface Client {
  hits: number;
  lastSeen: number;
  lockedUntil: number;
}

const clients = new Map<string, Client>();

// Cleanup Memory (Penting agar tidak memory leak seperti init() di Go)
setInterval(() => {
  const now = Date.now();
  for (const [key, client] of clients.entries()) {
    if (now - client.lastSeen > 300000) { // 5 menit tidak aktif
      clients.delete(key);
    }
  }
}, 120000); // Cek setiap 2 menit

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const identifier = `${ip}:${req.path}`; 
    const now = Date.now();
    let client = clients.get(identifier);

    if (!client) {
        client = { hits: 0, lastSeen: now, lockedUntil: 0 };
        clients.set(identifier, client);
    }

    if (now - client.lastSeen > 30000) {
        client.hits = 0;
    }

    if (now < client.lockedUntil || client.hits >= 5) {
        if (now >= client.lockedUntil) {
            client.lockedUntil = now + 30000;
        }

        const remaining = Math.ceil((client.lockedUntil - now) / 1000);
        return res.status(429).json({
            message: `Batas 5 kali percobaan per 30 detik tercapai. Coba lagi dalam ${remaining} detik`
        });
    }

    client.hits++;
    client.lastSeen = now;
    next();
};

// --- CORS Middleware ---
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");
  const origin = req.headers.origin as string;

  let isAllowed = !origin; 
  if (origin && allowedOrigins.some(o => o.trim() === origin)) {
    isAllowed = true;
  }

  if (!isAllowed) {
    return res.status(403).json({ message: "Akses ditolak oleh kebijakan CORS" });
  }

  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};