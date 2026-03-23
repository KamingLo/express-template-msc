import { type Request, type  Response, type NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { validateToken } from '../utils/jwt.js';

interface Client {
  count: number;
  lastSeen: Date;
  isLockedUntil: Date;
  firstRequestAt: Date;
}

const clients = new Map<string, Client>();

setInterval(() => {
  const now = new Date();
  for (const [ip, data] of clients.entries()) {
    if (now.getTime() - data.lastSeen.getTime() > 5 * 60 * 1000) {
      clients.delete(ip);
    }
  }
}, 2 * 60 * 1000); 

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, "Sesi berakhir, silakan login kembali", null);
  }

  const tokenString = authHeader.split(' ')[1];

  try {
    const claims = await validateToken(tokenString, process.env.JWT_SECRET!);
    
    res.locals.userId = claims.user_id;
    res.locals.userEmail = claims.email;

    next();
  } catch (err: any) {
    return sendError(res, 401, "Token tidak valid atau kadaluarsa", err.message);
  }
};
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const path = req.path;
  const identifier = `${ip}:${path}`;
  const now = new Date();

  let client = clients.get(identifier);

  if (!client) {
    client = {
      count: 0,
      lastSeen: now,
      isLockedUntil: new Date(0),
      firstRequestAt: now,
    };
    clients.set(identifier, client);
    console.log(`[RateLimit] New Registration: ${identifier}`);
  }

  client.lastSeen = now;

  if (now < client.isLockedUntil) {
    const remaining = Math.ceil((client.isLockedUntil.getTime() - now.getTime()) / 1000);
    console.log(`[RateLimit] REJECTED: ${identifier} | Locked for ${remaining}s`);
    return res.status(429).json({
      message: `Batas 5 kali percobaan per 30 detik tercapai. Coba lagi dalam ${remaining} detik`
    });
  }

  if (now.getTime() - client.firstRequestAt.getTime() > 30 * 1000) {
    client.count = 0;
    client.firstRequestAt = now;
  }

  client.count++;

  if (client.count > 5) {
    client.isLockedUntil = new Date(now.getTime() + 30 * 1000);
    console.log(`[RateLimit] LIMIT TRIGGERED: ${identifier} | Locked for 30s`);
    
    return res.status(429).json({
      message: `Batas 5 kali percobaan per 30 detik tercapai. Coba lagi dalam 30 detik`
    });
  }

  return next();
};

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const origin = req.headers.origin as string;

  let isAllowed = false;
  if (!origin) {
    isAllowed = true;
  } else {
    isAllowed = allowedOrigins.some(o => o.trim() === origin);
  }

  if (!isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    return res.status(403).json({
      message: "Akses ditolak, Origin tidak diizinkan oleh kebijakan CORS"
    });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET, PATCH, DELETE');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
};