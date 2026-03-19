import crypto from 'crypto';

/**
 * GenerateCustomID menghasilkan format: PREFIX-YYYYMMDD-RANDOM
 */
export const generateCustomID = (prefix: string, length: number): string => {
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  
  // Format Tanggal: YYYYMMDD
  const now = new Date();
  const datePart = now.getFullYear().toString() +
                   (now.getMonth() + 1).toString().padStart(2, '0') +
                   now.getDate().toString().padStart(2, '0');

  let randomPart = "";
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    // Menggunakan modulo untuk memetakan byte ke charset
    randomPart += charset[randomBytes[i] % charset.length];
  }

  return `${prefix}-${datePart}-${randomPart}`;
};