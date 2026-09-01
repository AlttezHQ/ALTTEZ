import { type NextRequest, NextResponse } from "next/server";

const ACTIVE_ROUTE_PREFIXES = ["/auth", "/torneos", "/t"];
const ACTIVE_STANDALONE_ROUTES = new Set(["/", "/privacidad", "/offline.html"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isActiveRoute = ACTIVE_STANDALONE_ROUTES.has(pathname) || ACTIVE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return isActiveRoute ? NextResponse.next() : NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|manifest.json|icons|branding).*)"],
};
