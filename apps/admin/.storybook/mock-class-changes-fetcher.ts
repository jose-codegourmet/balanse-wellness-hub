import type { ApiFetcher } from "@balanse/api-client";
import type { CreateClassChangeRequestInput } from "@balanse/domain";
import { bindMockPrincipal, DEFAULT_MOCK_PRINCIPAL, getMockAdapter } from "@balanse/mock";
import { getPreviewStaffActor } from "../src/app/(dashboard)/staff/_lib/mock-staff-fetcher.stories-data";

/** Storybook-only transport; the production client calls the database-backed API. */
export const mockClassChangesFetcher: ApiFetcher = async (path, init) => {
  const actor = getPreviewStaffActor();
  if (!actor) throw new Error("No staff session in this preview.");
  bindMockPrincipal({ ...DEFAULT_MOCK_PRINCIPAL, role: "admin", staffId: actor.staffId });
  const adapter = getMockAdapter();
  const method = (init?.method ?? "GET").toUpperCase();
  if (path === "/api/admin/class-change-requests" && method === "GET") {
    return { items: await adapter.getClassChangeRequests() } as never;
  }
  const sessionPath = /^\/api\/admin\/sessions\/([^/]+)\/(substitute-coaches|class-change-requests)$/.exec(path);
  if (sessionPath) {
    const sessionId = decodeURIComponent(sessionPath[1]);
    if (method === "GET" && sessionPath[2] === "substitute-coaches") {
      return { items: await adapter.getSubstituteCoachOptions(sessionId) } as never;
    }
    if (method === "POST" && sessionPath[2] === "class-change-requests") {
      const body = init?.body as CreateClassChangeRequestInput;
      return { request: await adapter.createClassChangeRequest({ ...body, sessionId }) } as never;
    }
  }
  const actionPath = /^\/api\/admin\/class-change-requests\/([^/]+)\/(withdraw|approve|deny)$/.exec(path);
  if (method === "POST" && actionPath) {
    const id = decodeURIComponent(actionPath[1]);
    const note = (init?.body as { note?: string | null } | undefined)?.note;
    if (actionPath[2] === "withdraw") {
      return { request: await adapter.withdrawClassChangeRequest(id) } as never;
    }
    if (actionPath[2] === "approve") {
      return { request: await adapter.approveClassChangeRequest(id, note) } as never;
    }
    return { request: await adapter.denyClassChangeRequest(id, note ?? "") } as never;
  }
  throw new Error(`mockClassChangesFetcher: unhandled ${method} ${path}`);
};
