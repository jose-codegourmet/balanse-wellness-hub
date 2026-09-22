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
    return errorResponse(error);
  }
}
