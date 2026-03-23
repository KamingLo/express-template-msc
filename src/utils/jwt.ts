import * as jose from 'jose';

export const generateToken = async (userID: string, email: string): Promise<string> => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
  
  const isExpires = process.env.JWT_EXPIRES;
  const expiresInStr = process.env.JWT_EXPIRES_IN;

  const jwt = new jose.SignJWT({ user_id: userID, email: email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt();

  if (isExpires === "enable") {
    let hours = 2;
    
    if (expiresInStr) {
      const parsed = parseInt(expiresInStr, 10);
      if (!isNaN(parsed)) hours = parsed;
    }

    jwt.setExpirationTime(`${hours}h`);
  }

  return await jwt.sign(secret);
};

export const validateToken = async (tokenString: string, secretStr: string): Promise<any> => {
  try {
    const secret = new TextEncoder().encode(secretStr);

    const { payload } = await jose.jwtVerify(tokenString, secret, {
      algorithms: ['HS256'],
    });

    return payload;
  } catch (err) {
    throw new Error('Invalid token');
  }
};