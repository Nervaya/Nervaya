import type { OtpDelivery } from './otp-delivery.interface';

/**
 * Development implementation: logs OTP to server console.
 * For production, use an email provider (Resend, SendGrid, etc.) implementing OtpDelivery.
 */
export class ConsoleOtpDelivery implements OtpDelivery {
  async sendOtp(email: string, code: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[OTP] Email: ${email} | Code: ${code} (valid for 10 minutes)`);
  }
}
