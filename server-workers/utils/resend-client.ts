/**
 * Resend SDK 客户端工厂
 */
import { Resend } from 'resend';

interface ResendEnv {
  RESEND_API_KEY: string;
}

export function createResendClient(env: ResendEnv): Resend {
  return new Resend(env.RESEND_API_KEY);
}
