import { authorizeAdminRequest } from "./auth";
import { type ApiDeps, createDefaultDeps } from "./deps";
import { ApiError } from "./errors";
import { errorResponse, json } from "./http";
import { matchRoute } from "./router";

export async function dispatch(
  req: Request,
  deps: ApiDeps = createDefaultDeps(),
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const matched = matchRoute(req.method, url.pathname);
    if (!matched) {
      if (url.pathname.startsWith("/api/")) {
        if (req.method !== "GET" && url.pathname.includes("/api/public/")) {
          throw new ApiError(405, "method_not_allowed", "Public catalogue is read-only.");
        }
        return json(404, { code: "not_found", message: "No API route matches this path." });
      }
      return json(404, { code: "not_found", message: "Not found." });
    }
    if (matched.route.path.startsWith("/api/admin")) {
      await authorizeAdminRequest(deps, req, url.pathname);
    }
    return await matched.route.handler(deps, req, matched.params);
  } catch (error) {
    const response = errorResponse(error);
    if (response.status >= 500) {
      const path = new URL(req.url).pathname;
      const failure = error as {
        name?: unknown;
        code?: unknown;
        statusCode?: unknown;
        stack?: unknown;
      } | null;
      const isUploadRequest = path === "/api/me/avatar" || path.endsWith("/payment-proof");
      console.error("[balanse/api] Unhandled request failure", {
        method: req.method,
        path,
        name: typeof failure?.name === "string" ? failure.name : typeof error,
        code: typeof failure?.code === "string" ? failure.code : undefined,
        statusCode:
          typeof failure?.statusCode === "number" || typeof failure?.statusCode === "string"
            ? failure.statusCode
            : undefined,
        frame:
          typeof failure?.stack === "string"
            ? failure.stack.split("\n").slice(1, 2)[0]?.trim()
            : undefined,
        message:
          isUploadRequest && error instanceof Error && !error.name.startsWith("Prisma")
            ? error.message
                .replace(/https?:\/\/\S+/g, "[url]")
                .replace(/\b(?:eyJ|sb_secret_|sb_publishable_)[A-Za-z0-9._-]+\b/g, "[credential]")
                .slice(0, 180)
            : undefined,
      });
    }
    return response;
  }
}
