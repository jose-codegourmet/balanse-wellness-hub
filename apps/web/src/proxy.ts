import { SHARE_ATTRIBUTION_COOKIE } from "@balanse/domain";
import { type NextRequest, NextResponse } from "next/server";
import {
  serializeShareAttribution,
  shareAttributionCookieOptions,
  shareAttributionFromSearchParams,
} from "@/modules/share/attribution";

/**
 * Share attribution capture (#351). A public page opened with valid `ref`,
 * `src` or `via` params stores them in the first-party attribution cookie
 * (last touch wins, 30 days). Invalid values are dropped silently. The
 * request is never redirected and the query string is left intact, so pages
 * can still read the params.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const touch = shareAttributionFromSearchParams(request.nextUrl.searchParams);
  if (touch) {
    response.cookies.set(
      SHARE_ATTRIBUTION_COOKIE,
      serializeShareAttribution(touch),
      shareAttributionCookieOptions(),
    );
  }
  return response;
}

// Public pages only: never the portal, API, share image renderers, dev tools
// or static files. Each entry runs only when its share param is present.
// Matcher values must be literals so Next can analyse them at build time.
export const config = {
  matcher: [
    {
      source: "/((?!api|portal|share|dev|_next/static|_next/image|favicon.ico|.*\\..*).*)",
      has: [{ type: "query", key: "ref" }],
    },
    {
      source: "/((?!api|portal|share|dev|_next/static|_next/image|favicon.ico|.*\\..*).*)",
      has: [{ type: "query", key: "src" }],
    },
    {
      source: "/((?!api|portal|share|dev|_next/static|_next/image|favicon.ico|.*\\..*).*)",
      has: [{ type: "query", key: "via" }],
    },
  ],
};
