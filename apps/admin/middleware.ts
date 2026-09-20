import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const principal = parseMockPrincipal(request.cookies.get(MOCK_HARNESS_COOKIE)?.value);
  const isLogin = request.nextUrl.pathname.startsWith("/login");
  const isDev = request.nextUrl.pathname.startsWith("/dev");

  if (principal.role !== "admin" && !isLogin && !isDev) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (principal.role === "admin" && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
