import nodemailer from 'nodemailer';
import { getOTPTemplate } from '../templates/otp.js';

export const sendEmail = async (toEmail: string, subject: string, body: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: toEmail,
    subject: subject,
    html: body,
  };

  await transporter.sendMail(mailOptions);
};

export const sendRegistrationOTP = async (toEmail: string, otp: string): Promise<void> => {
  const subject = 'Verifikasi Akun - Kode OTP';

  try {
    // Langsung panggil fungsi template
    const htmlContent = getOTPTemplate(otp);

    // Kirim asinkron (Background process)
    sendEmail(toEmail, subject, htmlContent).catch((err) => {
      console.error(`[Error Background] Gagal kirim email ke ${toEmail}:`, err);
    });
    
  } catch (err) {
    const error = err as Error;
    throw new Error(`gagal memproses email: ${error.message}`);
  }
};