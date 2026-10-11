import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/admin/auth";
import { serverEnv } from "@/lib/admin/env";

/**
 * Host-based separation between the storefront and the dashboard.
 *
 * The dashboard is served from a different origin than the shop:
 *
 *   local development   http://localhost:3000        → storefront
 *                       http://admin.localhost:3000  → dashboard
 *   production          https://www.example.com      → storefront
 *                       https://admin.example.com    → dashboard
 *
 * Set `ADMIN_HOST=admin.example.com` in production. By default any host that
 * begins with `admin.` serves the dashboard and every other host serves the
 * shop; `/admin` is never reachable on the shop's origin, so the customer site
 * and the back office cannot share a URL (ARCHITECTURE.md §10).
 */

const DASHBOARD_ROOT = "/admin";
const LOGIN_PATH = "/admin/login";
const PUBLIC_DASHBOARD_PATHS = new Set([LOGIN_PATH]);

function isAdminHost(host: string): boolean {
  const configured = serverEnv("ADMIN_HOST")?.trim();
  if (configured) return host === configured;

  // Local development: `admin.localhost` (and any `admin.*` host).
  return host.startsWith("admin.");
}

/**
 * Tokens are verified here as well as in the layout and in every API route, so
 * a mistake in one layer cannot expose the dashboard.
 */
async function hasSession(request: NextRequest): Promise<boolean> {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // Never interfere with Next's own assets or the image optimiser.
  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const onAdminHost = isAdminHost(host);

  if (onAdminHost) {
    const dashboardPath = pathname === "/" ? DASHBOARD_ROOT : pathname;
    const needsSession =
      dashboardPath.startsWith(DASHBOARD_ROOT) && !PUBLIC_DASHBOARD_PATHS.has(dashboardPath);

    if (needsSession && !(await hasSession(request))) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = DASHBOARD_ROOT;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // Storefront origin: the dashboard is not addressable here at all.
  if (pathname === DASHBOARD_ROOT || pathname.startsWith(`${DASHBOARD_ROOT}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = "/not-a-page";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
