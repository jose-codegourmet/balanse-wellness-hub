import {
  COACH_RATE_TYPES,
  canApproveReschedule,
  FIELD_CONSTRAINTS,
  manilaYmd,
  type PublicSession,
  SESSION_RATE_SNAPSHOT_NOTE,
  SESSION_STATUSES,
  validateSessionCapacity,
} from "@balanse/domain";
import { z } from "zod";

export { SESSION_RATE_SNAPSHOT_NOTE };

export function toSessionIso(ymd: string, hhmm: string): string {
  return `${ymd}T${hhmm}:00+08:00`;
}

export function fromSessionIso(iso: string): { ymd: string; hhmm: string } {
  const ymd = manilaYmd(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return { ymd, hhmm: `${hour}:${minute}` };
}

/**
 * Reschedule approval is about a *target* session, not this form's values.
 * #220 should call this at the reschedule action — do not fold it into a refine.
 */
export function checkCanApproveReschedule(target: PublicSession) {
  return canApproveReschedule(target);
}

const sessionFields = {
  classId: z.string().min(1),
  coachId: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  /** Mock field name. Integer pesos — not `customerPrice` / `php_decimal`. */
  pricePhp: z.coerce.number().int().min(FIELD_CONSTRAINTS.session.customerPrice.min),
  capacity: z.coerce
    .number()
    .int()
    .min(FIELD_CONSTRAINTS.session.capacity.min)
    .max(FIELD_CONSTRAINTS.session.capacity.max),
  bookable: z.boolean(),
  status: z.enum(SESSION_STATUSES),
  /**
   * Admin-only snapshot. Changing a coach's default rate later must not rewrite
   * existing sessions (`SESSION_RATE_SNAPSHOT_NOTE`).
   */
  coachRatePhp: z.coerce.number().int().min(0),
  coachRateType: z.enum(COACH_RATE_TYPES),
};

function refineSession(
  values: {
    startsAt: string;
    endsAt: string;
    capacity: number;
  },
  ctx: z.RefinementCtx,
  consumed: number,
) {
  const start = Date.parse(values.startsAt);
  const end = Date.parse(values.endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "End must be after start.",
      params: { validationCode: "ends_before_start" },
    });
    return;
  }
  const hours = (end - start) / 36e5;
  if (hours > FIELD_CONSTRAINTS.session.maxDurationHours) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: `Session cannot exceed ${FIELD_CONSTRAINTS.session.maxDurationHours} hours.`,
      params: { validationCode: "duration_too_long" },
    });
  }
  const capacity = validateSessionCapacity(values.capacity, consumed);
  if (!capacity.ok) {
    ctx.addIssue({
      code: "custom",
      path: ["capacity"],
      message: capacity.error,
      params: { validationCode: "below_confirmed_count" },
    });
  }
}

export function makeSessionFormSchema({ consumed }: { consumed: number }) {
  return z.object(sessionFields).superRefine((values, ctx) => refineSession(values, ctx, consumed));
}

export const sessionFormSchema = makeSessionFormSchema({ consumed: 0 });

export type SessionFormValues = z.infer<typeof sessionFormSchema>;
