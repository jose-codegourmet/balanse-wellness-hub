import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BOOKING_STATUSES,
  COACH_RATE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  REFUND_STATUSES,
  SESSION_STATUSES,
  STAFF_ROLES,
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

const paths: Record<string, Record<string, object>> = {};

for (const route of API_CONTRACT_ROUTES) {
  paths[route.path] ??= {};
  paths[route.path][route.method] = {
    tags: [route.ticket],
    operationId: `${route.ticket}_${route.method}_${route.path.replace(/[^a-zA-Z0-9]+/g, "_")}`,
    summary: `${route.ticket} ${route.method.toUpperCase()} ${route.path}`,
    responses: {
      "200": {
        description: "Success",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/GenericSuccess" },
            example: exampleBooking,
          },
        },
      },
      "400": {
        description: "Validation or rule error",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
      },
      "401": { description: "Unauthenticated" },
      "403": { description: "Forbidden (RLS/route equivalent)" },
    },
  };
}

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Balanse Wellness Hub API (BE-024 contract pack)",
    version: "0.1.0",
    description:
      "Machine-readable contract for the wiring phase. HTTP routes are not implemented in this PR; names match BE-001 enums exactly. Hold duration and cutoff are absent from admin settings.",
  },
  paths,
  components: {
    schemas: {
      BookingStatus: { type: "string", enum: [...BOOKING_STATUSES] },
      PaymentMethod: { type: "string", enum: [...PAYMENT_METHODS] },
      PaymentStatus: { type: "string", enum: [...PAYMENT_STATUSES] },
      RefundStatus: { type: "string", enum: [...REFUND_STATUSES] },
      SessionStatus: { type: "string", enum: [...SESSION_STATUSES] },
      CoachRateType: { type: "string", enum: [...COACH_RATE_TYPES] },
      StaffRole: { type: "string", enum: [...STAFF_ROLES] },
      GenericSuccess: { type: "object", additionalProperties: true },
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
