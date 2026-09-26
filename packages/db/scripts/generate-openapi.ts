import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BOOKING_STATUSES,
  BUNDLE_ACQUISITION_KINDS,
  BUNDLE_ACQUISITION_STATUSES,
  BUNDLE_APPLICABILITY_MODES,
  BUNDLE_REDEMPTION_STATUSES,
  BUNDLE_STATUSES,
  COACH_RATE_TYPES,
  CUSTOMER_BUNDLE_STATUSES,
  EVENT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  REFUND_STATUSES,
  SESSION_STATUSES,
  STAFF_ROLES,
  VALIDATION_ERROR_CODES,
} from "@balanse/domain";
import { API_CONTRACT_ROUTES } from "../contracts/routes";

const exampleBooking = {
  id: "cbookingexample01",
  customerId: "00000000-0000-0000-0000-0000000000aa",
  sessionId: "sess_2026-09-14_0800_class_calisthenics",
  status: "HELD_AWAITING_PAYMENT",
  statusLabel: "Reserved — Payment Needed",
  paymentMethod: "GCASH",
  paymentStatus: "NONE",
  refundStatus: "NOT_APPLICABLE",
  holdExpiresAt: "2026-09-14T08:00:00.000+08:00",
  bookingReference: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
};

const QUEUE_PATHS = new Set([
  "/api/admin/bookings",
  "/api/admin/payments",
  "/api/admin/cancellation-requests",
  "/api/admin/reschedule-requests",
]);

const paths: Record<string, Record<string, object>> = {};

for (const route of API_CONTRACT_ROUTES) {
  paths[route.path] ??= {};
  const isQueue = route.method === "get" && QUEUE_PATHS.has(route.path);
  const isWrite =
    route.method === "post" ||
    route.method === "patch" ||
    route.method === "put" ||
    route.method === "delete";
  paths[route.path][route.method] = {
    tags: [route.ticket],
    operationId: `${route.ticket}_${route.method}_${route.path.replace(/[^a-zA-Z0-9]+/g, "_")}`,
    summary: `${route.ticket} ${route.method.toUpperCase()} ${route.path}`,
    ...(isQueue
      ? {
          parameters: [
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
            },
            {
              name: "cursor",
              in: "query",
              description: "Opaque unsigned base64url cursor. Malformed values return 400.",
              schema: { type: "string" },
            },
            ...(route.path === "/api/admin/payments"
              ? [
                  {
                    name: "tab",
                    in: "query",
                    schema: { type: "string", enum: ["gcash", "counter", "refunds"] },
                  },
                ]
              : []),
          ],
        }
      : {}),
    ...((route.path === "/api/admin/sessions" && route.method === "post") ||
    (route.path === "/api/admin/sessions/{id}" && route.method === "patch")
      ? {
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  ...(route.method === "post"
                    ? {
                        required: [
                          "classId",
                          "coachIds",
                          "startsAt",
                          "endsAt",
                          "capacity",
                          "customerPrice",
                        ],
                      }
                    : {}),
                  properties: {
                    classId: { type: "string" },
                    coachIds: {
                      type: "array",
                      minItems: 1,
                      uniqueItems: true,
                      items: { type: "string", minLength: 1, maxLength: 64 },
                      description:
                        "At least one coach. New assignments snapshot the active coach’s current rate; retained assignments keep their saved rates.",
                    },
                    startsAt: { type: "string", format: "date-time" },
                    endsAt: { type: "string", format: "date-time" },
                    capacity: { type: "integer", minimum: 1, maximum: 200 },
                    customerPrice: { type: "string", pattern: "^[0-9]+$" },
                    status: { type: "string", enum: ["DRAFT", "PUBLISHED"] },
                  },
                  additionalProperties: false,
                },
              },
            },
          },
        }
      : {}),
    responses: {
      "200": {
        description: "Success",
        content: {
          "application/json": {
            schema: isQueue
              ? { $ref: "#/components/schemas/CursorPage" }
              : { $ref: "#/components/schemas/GenericSuccess" },
            example: exampleBooking,
          },
        },
      },
      "400": {
        description: "Malformed cursor or request",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
      },
      ...(isWrite
        ? {
            "422": {
              description: "Field validation failed",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ValidationFailed" } },
              },
            },
            "409": {
              description: "Conflict (unique name, capacity race)",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ApiError" } },
              },
            },
          }
        : {}),
      "401": { description: "Unauthenticated" },
      "403": { description: "Forbidden (RLS/route equivalent)" },
    },
  };
}

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Balanse Wellness Hub API (BE-024 contract pack)",
    version: "0.4.0",
    description:
      "Machine-readable contract for the wiring phase (BE-024 plus BE-050–BE-058 and #292 staff-role APIs). Hold duration and cutoff are absent from admin settings. Money is whole pesos as decimal strings. Admin lists use CursorPage. Validation failures use ValidationFailed (422). Session bundles are session credits, not wallets. Admin routes require explicit staff permissions.",
  },
  paths,
  components: {
    schemas: {
      BookingStatus: { type: "string", enum: [...BOOKING_STATUSES] },
      PaymentMethod: { type: "string", enum: [...PAYMENT_METHODS] },
      PaymentStatus: { type: "string", enum: [...PAYMENT_STATUSES] },
      RefundStatus: { type: "string", enum: [...REFUND_STATUSES] },
      SessionStatus: { type: "string", enum: [...SESSION_STATUSES] },
      EventStatus: { type: "string", enum: [...EVENT_STATUSES] },
      CoachRateType: { type: "string", enum: [...COACH_RATE_TYPES] },
      StaffRole: { type: "string", enum: [...STAFF_ROLES] },
      BundleStatus: { type: "string", enum: [...BUNDLE_STATUSES] },
      BundleApplicabilityMode: { type: "string", enum: [...BUNDLE_APPLICABILITY_MODES] },
      BundleAcquisitionKind: { type: "string", enum: [...BUNDLE_ACQUISITION_KINDS] },
      BundleAcquisitionStatus: { type: "string", enum: [...BUNDLE_ACQUISITION_STATUSES] },
      CustomerBundleStatus: { type: "string", enum: [...CUSTOMER_BUNDLE_STATUSES] },
      BundleRedemptionStatus: { type: "string", enum: [...BUNDLE_REDEMPTION_STATUSES] },
      GenericSuccess: { type: "object", additionalProperties: true },
      CursorPage: {
        type: "object",
        required: ["items", "nextCursor", "totalCount"],
        properties: {
          items: { type: "array", items: { type: "object", additionalProperties: true } },
          nextCursor: { type: ["string", "null"] },
          totalCount: {
            type: "integer",
            description: "Exact filtered count. Cheap at MVP scale; may become optional later.",
          },
          tab: { type: "string" },
          sort: { type: "string" },
        },
      },
      ValidationErrorCode: { type: "string", enum: [...VALIDATION_ERROR_CODES] },
      ValidationFailed: {
        type: "object",
        required: ["error", "fieldErrors", "formErrors"],
        properties: {
          error: { type: "string", const: "validation_failed" },
          fieldErrors: {
            type: "array",
            items: {
              type: "object",
              required: ["path", "code", "message"],
              properties: {
                path: {
                  type: "string",
                  description: "Dotted FE field path, e.g. contact.phone or faqs.2.question",
                },
                code: { $ref: "#/components/schemas/ValidationErrorCode" },
                message: { type: "string" },
              },
            },
          },
          formErrors: {
            type: "array",
            items: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: { $ref: "#/components/schemas/ValidationErrorCode" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      SignedUploadIntent: {
        type: "object",
        required: ["upload", "objectKey", "bucket", "maxBytes", "contentTypes"],
        properties: {
          upload: {
            type: "object",
            properties: {
              signedUrl: { type: "string" },
              token: { type: "string" },
              path: { type: "string" },
              expiresIn: { type: "integer" },
            },
          },
          objectKey: { type: "string" },
          bucket: { type: "string", enum: ["coach-photos", "marketing-assets"] },
          maxBytes: { type: "integer" },
          contentTypes: { type: "array", items: { type: "string" } },
        },
      },
      MetricSeries: {
        type: "object",
        required: ["metric", "grain", "timezone", "windowDays", "points"],
        properties: {
          metric: {
            type: "string",
            enum: ["gross_sales", "occupancy", "session_count", "coach_cost"],
          },
          grain: { type: "string", enum: ["day"] },
          timezone: { type: "string", enum: ["Asia/Manila"] },
          windowDays: { type: "integer" },
          points: {
            type: "array",
            items: {
              type: "object",
              required: ["date", "value"],
              properties: {
                date: { type: "string", description: "YYYY-MM-DD in Asia/Manila" },
                value: { type: "number" },
              },
            },
          },
        },
      },
      ApiError: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: {
            type: "string",
            enum: [
              "booking_cutoff_reached",
              "duplicate_active_reservation",
              "missing_required_policy_acceptance",
              "session_not_reservable",
              "capacity_exceeded",
              "target_session_full",
              "check_in_requires_confirmed",
              "completed_blocked_oq10",
              "illegal_booking_transition",
              "invalid_cursor",
              "validation_failed",
              "below_confirmed_count",
              "conflict",
              "event_not_found",
              "event_session_taken",
              "event_on_cancelled_session",
              "event_publish_requires_published_session",
            ],
          },
          message: { type: "string" },
        },
      },
    },
  },
};

const out = resolve(import.meta.dirname, "../contracts/openapi.json");
writeFileSync(out, `${JSON.stringify(spec, null, 2)}\n`);
console.log(`wrote ${out} (${API_CONTRACT_ROUTES.length} operations)`);
