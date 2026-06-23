/**
 * JWT 认证工具 — 基于 jose（Web Crypto API，Workers 兼容）
 * 替代 Express 中的 jsonwebtoken
 */
import { SignJWT, jwtVerify } from 'jose';

export async function signJWT(
  payload: { userId: string; email: string },
  secret: string,
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(key);
}

export async function verifyJWT(
  token: string,
  secret: string,
): Promise<{ userId: string; email: string }> {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key, {
    algorithms: ['HS256'],
  });
  return payload as unknown as { userId: string; email: string };
}
