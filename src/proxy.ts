import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Optimistic redirect only.
 *
 * This runs on every matched request including prefetches, so it does nothing
 * but read the session cookie. It is a convenience, NOT the access control —
 * that lives in requireAdmin() (src/lib/admin/guard.ts), which every admin
 * page and Server Action calls.
 *
 * Named `proxy` and running on the Node runtime: Next 16 renamed `middleware`
 * to `proxy`, and the proxy runtime is nodejs and not configurable.
 */
export const proxy = auth((request) => {
  if (!request.auth?.user) {
    const url = new URL("/login", request.nextUrl.origin);
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
