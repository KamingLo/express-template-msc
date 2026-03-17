import type { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';

// --- Auth Middleware ---
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Token dibutuhkan" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    await jose.jwtVerify(token, secret);
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

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const identifier = `${ip}:${req.path}`; 
    const now = Date.now();
    let client = clients.get(identifier);

    if (!client) {
        client = { hits: 0, lastSeen: now, lockedUntil: 0 };
        clients.set(identifier, client);
    }

    // 1. Reset hits jika sudah lewat masa jendela (30 detik)
    if (now - client.lastSeen > 30000) {
        client.hits = 0;
    }

    // 2. Gabungkan Cek Lock dan Cek Limit
    // Kita cek apakah sekarang masih dalam masa lock OR hits sudah melebihi batas
    if (now < client.lockedUntil || client.hits >= 5) {
        
        // Jika baru saja mencapai limit (belum ada lockedUntil), pasang kuncinya
        if (now >= client.lockedUntil) {
            client.lockedUntil = now + 30000; // Kunci 30 detik
            console.log(`[RateLimit] LIMIT TRIGGERED: ${identifier}`);
        }

        const remaining = Math.ceil((client.lockedUntil - now) / 1000);
        
        console.log(`[RateLimit] REJECTED: ${identifier} | Retry in ${remaining}s`);

        return res.status(429).json({
            message: `Batas 5 kali percobaan per 30 detik tercapai. Coba lagi dalam ${remaining} detik`
        });
    }

    // 3. Update data jika lolos pengecekan
    client.hits++;
    client.lastSeen = now;

    next();
};

// --- CORS Middleware ---
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");
  const origin = req.headers.origin as string;

  let isAllowed = !origin; // Izinkan jika non-browser (Postman)
  if (origin && allowedOrigins.includes(origin.trim())) {
    isAllowed = true;
  }

  if (!isAllowed) {
    return res.status(403).json({ message: "Akses ditolak oleh kebijakan CORS" });
  }

  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};