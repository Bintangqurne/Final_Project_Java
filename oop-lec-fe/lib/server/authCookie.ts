import crypto from "crypto";

const COOKIE_NAME = "oop_lec_auth";

function base64UrlEncode(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(str: string) {
  const pad = str.length % 4;
  const padded = str + (pad ? "=".repeat(4 - pad) : "");
  const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}

function keyFromSecret(secret: string) {
  const raw = Buffer.from(secret, "utf8");
  if (raw.length === 32) return raw;
  return crypto.createHash("sha256").update(raw).digest();
}

function getSecretKey() {
  const secret = process.env.AUTH_COOKIE_SECRET ?? "dev-only-change-me";
  return keyFromSecret(secret);
}

export function getCookieName() {
  return COOKIE_NAME;
}

export function encryptToken(token: string) {
  const key = getSecretKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return base64UrlEncode(Buffer.concat([iv, tag, ciphertext]));
}

export function decryptToken(payload: string) {
  const key = getSecretKey();
  const data = base64UrlDecode(payload);
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const ciphertext = data.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

export function cookieOptions() {
  const maxAge = Number(process.env.AUTH_COOKIE_MAX_AGE_SECONDS ?? "86400");
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
