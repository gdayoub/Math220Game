import { COOKIE_NAME } from "@/proxy";

/**
 * Reads the anonymous uid cookie set by middleware. Falls back to "local-dev"
 * during local development if the middleware hasn't fired yet (e.g. first
 * request on a fresh browser before the cookie round-trips).
 */
export function getUid(req: Request): string {
  const cookieHeader = req.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE_NAME && rest.length > 0) return rest.join("=");
  }
  return "local-dev";
}
