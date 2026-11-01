import { SignJWT, jwtVerify } from 'jose';

export const STAFF_SESSION_COOKIE = 'rcc_staff_session';
const SESSION_ISSUER = 'rcc-restaurant';
const SESSION_AUDIENCE = 'rcc-staff-admin';
export const STAFF_SESSION_SECONDS = 8 * 60 * 60;

export type StaffConfiguration = {
  STAFF_USERNAME?: string;
  STAFF_PASSWORD?: string;
  STAFF_SESSION_SECRET?: string;
};

export function staffAuthConfigured(configuration: StaffConfiguration) {
  return typeof configuration.STAFF_USERNAME === 'string'
    && configuration.STAFF_USERNAME.length >= 3
    && configuration.STAFF_USERNAME.length <= 128
    && typeof configuration.STAFF_PASSWORD === 'string'
    && configuration.STAFF_PASSWORD.length >= 12
    && configuration.STAFF_PASSWORD.length <= 1024
    && typeof configuration.STAFF_SESSION_SECRET === 'string'
    && configuration.STAFF_SESSION_SECRET.length >= 32;
}

async function fingerprint(value: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

async function constantTimeEqual(left: string, right: string) {
  const [a, b] = await Promise.all([fingerprint(left), fingerprint(right)]);
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index];
  return difference === 0;
}

export async function verifyStaffCredentials(username: unknown, password: unknown, configuration: StaffConfiguration) {
  if (!staffAuthConfigured(configuration) || typeof username !== 'string' || typeof password !== 'string') return false;
  if (username.length > 128 || password.length > 1024) return false;
  const [usernameMatches, passwordMatches] = await Promise.all([
    constantTimeEqual(username, configuration.STAFF_USERNAME!),
    constantTimeEqual(password, configuration.STAFF_PASSWORD!),
  ]);
  return usernameMatches && passwordMatches;
}

async function signingKey(configuration: StaffConfiguration) {
  if (!staffAuthConfigured(configuration)) return null;
  // Password rotation invalidates active sessions without storing password data in the token.
  return fingerprint(`${configuration.STAFF_SESSION_SECRET}\0${configuration.STAFF_PASSWORD}`);
}

export async function createStaffSession(username: string, configuration: StaffConfiguration) {
  const key = await signingKey(configuration);
  if (!key) throw new Error('Staff sign-in is not configured.');
  return new SignJWT({ role: 'staff' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${STAFF_SESSION_SECONDS}s`)
    .sign(key);
}

export async function authenticateStaff(request: Request, configuration: StaffConfiguration): Promise<string | null> {
  const key = await signingKey(configuration);
  if (!key) return null;
  const cookie = request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(`${STAFF_SESSION_COOKIE}=`));
  const token = cookie?.slice(STAFF_SESSION_COOKIE.length + 1);
  if (!token || token.length > 4096) return null;
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
      requiredClaims: ['exp', 'iat', 'sub'],
    });
    return payload.role === 'staff' && typeof payload.sub === 'string' && payload.sub === configuration.STAFF_USERNAME ? payload.sub : null;
  } catch {
    return null;
  }
}

export function staffSessionCookie(token: string) {
  return `${STAFF_SESSION_COOKIE}=${token}; Path=/; Max-Age=${STAFF_SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearStaffSessionCookie() {
  return `${STAFF_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}
