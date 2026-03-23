import { type Response } from 'express';

// Interface standar untuk semua API (mirip APIResponse struct di Go)
export interface APIResponse {
  status: boolean;
  message: string;
  data?: any;
  error?: any;
}

/**
 * SendError: Mengirim respon error standar
 * Sesuai dengan: SendError(c *gin.Context, statusCode int, message string, err interface{})
 */
export const sendError = (res: Response, statusCode: number, message: string, err: any): void => {
  let detail: any;

  // Cek apakah yang dikirim adalah tipe error asli (seperti error di Go)
  if (err instanceof Error) {
    detail = err.message;
  } else {
    detail = err;
  }

  const response: APIResponse = {
    status: false,
    message: message,
    error: detail,
  };

  res.status(statusCode).json(response);
};

/**
 * SendSuccess: Mengirim respon sukses standar
 * Sesuai dengan: SendSuccess(c *gin.Context, statusCode int, message string, data interface{})
 */
export const sendSuccess = (res: Response, statusCode: number, message: string, data?: any): void => {
  const response: APIResponse = {
    status: true,
    message: message,
  };

  // Di Go ada omitempty, di sini kita tambahkan field data hanya jika ada isinya
  if (data !== undefined && data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};