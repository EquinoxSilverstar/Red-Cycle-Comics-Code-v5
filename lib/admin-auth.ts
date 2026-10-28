import { env } from "cloudflare:workers";

export const ADMIN_COOKIE = "redcycle_admin_session";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

type AdminEnvironment = {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

function adminEnvironment() {
  return env as unknown as AdminEnvironment;
}

function bytesEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

async function signature(expires: string) {
  const secret = adminEnvironment().ADMIN_SESSION_SECRET;
  if (!secret) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64Url(
    new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expires)),
    ),
  );
}

export async function verifyAdminPassword(candidate: string) {
  const configured = adminEnvironment().ADMIN_PASSWORD;
  if (!configured || !candidate) return false;
  const [candidateHash, configuredHash] = await Promise.all([
    digest(candidate),
    digest(configured),
  ]);
  return bytesEqual(candidateHash, configuredHash);
}

export async function createAdminSessionToken() {
  const expires = String(Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS);
  return `${expires}.${await signature(expires)}`;
}

export async function verifyAdminSessionToken(token?: string | null) {
  if (!token) return false;
  const [expires, suppliedSignature, extra] = token.split(".");
  if (extra || !expires || !suppliedSignature) return false;
  if (!/^\d+$/.test(expires) || Number(expires) <= Date.now() / 1000) return false;
  const expectedSignature = await signature(expires);
  if (!expectedSignature) return false;
  return bytesEqual(
    new TextEncoder().encode(suppliedSignature),
    new TextEncoder().encode(expectedSignature),
  );
}

export function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export async function hasAdminSession(cookieHeader: string | null) {
  return verifyAdminSessionToken(readCookie(cookieHeader, ADMIN_COOKIE));
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
