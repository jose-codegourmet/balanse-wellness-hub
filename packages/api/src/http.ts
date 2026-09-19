import { ApiError, mapUnknownError } from "./errors";

export type JsonBody = Record<string, unknown> | unknown[] | string | number | boolean | null;

export function json(status: number, body: JsonBody, headers?: HeadersInit): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers: responseHeaders });
}

export function ok(body: JsonBody, headers?: HeadersInit): Response {
  return json(200, body, headers);
}

export function errorResponse(error: unknown): Response {
  const mapped = mapUnknownError(error);
  return json(mapped.status, {
    code: mapped.code,
    message: mapped.message,
    ...(mapped.fields ? { fields: mapped.fields } : {}),
    ...(mapped.details ? { details: mapped.details } : {}),
  });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (!text.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new ApiError(400, "invalid_json", "Request body must be a JSON object.");
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "invalid_json", "Request body must be valid JSON.");
  }
}

export function searchParams(req: Request): URLSearchParams {
  return new URL(req.url).searchParams;
}

export function requiredDateRange(params: URLSearchParams): { from: Date; to: Date } {
  const fromRaw = params.get("from") ?? params.get("dateFrom");
  const toRaw = params.get("to") ?? params.get("dateTo");
  const fields: Record<string, string> = {};
  if (!fromRaw) fields.from = "Date range start is required.";
  if (!toRaw) fields.to = "Date range end is required.";
  if (Object.keys(fields).length > 0) {
    throw new ApiError(400, "date_range_required", "from and to are required.", { fields });
  }
  const from = new Date(fromRaw as string);
  const to = new Date(toRaw as string);
  if (Number.isNaN(from.getTime())) {
    throw new ApiError(400, "invalid_date_range", "from is not a valid datetime.", {
      fields: { from: "Invalid datetime." },
    });
  }
  if (Number.isNaN(to.getTime())) {
    throw new ApiError(400, "invalid_date_range", "to is not a valid datetime.", {
      fields: { to: "Invalid datetime." },
    });
  }
  if (from >= to) {
    throw new ApiError(400, "invalid_date_range", "from must be earlier than to.", {
      fields: { from: "Must be earlier than to." },
    });
  }
  const maxMs = 366 * 24 * 60 * 60 * 1000;
  if (to.getTime() - from.getTime() > maxMs) {
    throw new ApiError(400, "date_range_too_large", "Date range cannot exceed 366 days.", {
      details: { performanceBudget: "366 days; session lists are paginated." },
    });
  }
  return { from, to };
}

export function pagination(params: URLSearchParams): {
  page: number;
  pageSize: number;
  skip: number;
} {
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") ?? 20) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function forbidForeignAttendee(body: Record<string, unknown>): void {
  for (const key of ["customerId", "customer_id", "attendeeId", "attendee_id", "profileId"]) {
    if (key in body) {
      throw new ApiError(
        400,
        "attendee_must_be_authenticated_user",
        "A customer can only book for themselves. Attendee fields are rejected.",
        { fields: { [key]: "Do not send an attendee or customer id." } },
      );
    }
  }
}
