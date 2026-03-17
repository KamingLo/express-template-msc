import * as jose from 'jose';

export const generateToken = async (userID: string, email: string): Promise<string> => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
  
  const isExpires = process.env.JWT_EXPIRES;
  const expiresInStr = process.env.JWT_EXPIRES_IN;

  const jwt = new jose.SignJWT({ user_id: userID, email: email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt();

  if (isExpires === "enable") {
    let hours = 2; // Default 2 jam
    
    if (expiresInStr) {
      const parsed = parseInt(expiresInStr, 10);
      if (!isNaN(parsed)) hours = parsed;
    }

    jwt.setExpirationTime(`${hours}h`);
  }

  return await jwt.sign(secret);
};