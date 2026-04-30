import { NextResponse, type NextRequest } from "next/server";

export const COOKIE_NAME = "m220_uid";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Anonymous identity: every visitor gets a UUID stored in an httpOnly cookie.
 * No login screen, no signup. Each browser / device = an isolated profile.
 * Runs only on /api/* (matcher below) so static asset requests are untouched.
 */
export function proxy(req: NextRequest) {
  const existing = req.cookies.get(COOKIE_NAME)?.value;
  if (existing) return NextResponse.next();

  const uid = crypto.randomUUID();
  const res = NextResponse.next({
    request: {
      // Forward to the route as if the cookie was set on this request,
      // so `getUid` sees it on the very first response.
      headers: (() => {
        const h = new Headers(req.headers);
        const prior = h.get("cookie");
        const next = `${COOKIE_NAME}=${uid}`;
        h.set("cookie", prior ? `${prior}; ${next}` : next);
        return h;
      })(),
    },
  });
  res.cookies.set(COOKIE_NAME, uid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
