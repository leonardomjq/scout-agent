import { SESSION_COOKIE } from "@/lib/appwrite/collections";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const IS_PROD = process.env.NODE_ENV === "production";

/** Serialize a raw Set-Cookie header string for the session. */
export function serializeSessionCookie(secret: string): string {
  const parts = [
    `${SESSION_COOKIE}=${secret}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE}`,
  ];
  if (IS_PROD) parts.push("Secure");
  return parts.join("; ");
}

/** Serialize a Set-Cookie header that clears the session. */
export function clearSessionCookie(): string {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (IS_PROD) parts.push("Secure");
  return parts.join("; ");
}
