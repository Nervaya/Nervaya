/** Contract for sending OTP to the user (e.g. email). */

export interface OtpDelivery {
  sendOtp(email: string, code: string): Promise<void>;
}
