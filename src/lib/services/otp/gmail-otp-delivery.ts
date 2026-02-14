import nodemailer from 'nodemailer';
import type { OtpDelivery } from './otp-delivery.interface';

export function createGmailOtpDelivery(): OtpDelivery | null {
  const user = process.env.OTP_EMAIL_USER;
  const appPassword = process.env.OTP_EMAIL_APP_PASSWORD;

  if (!user?.trim() || !appPassword?.trim()) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: user.trim(),
      pass: appPassword.trim(),
    },
  });

  const fromName = process.env.OTP_EMAIL_FROM_NAME?.trim() || 'Nervaya';

  return {
    async sendOtp(email: string, code: string): Promise<void> {
      await transporter.sendMail({
        from: `"${fromName}" <${user}>`,
        to: email,
        subject: 'Your verification code',
        text: `Your verification code is: ${code}. It expires in 10 minutes.`,
        html: `<p>Your verification code is: <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
      });
    },
  };
}
