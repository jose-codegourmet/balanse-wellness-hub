import {
  calendarDayDistance,
  canApproveReschedule,
  FIELD_CONSTRAINTS,
  isManilaYmd,
  manilaYmd,
  type PublicSession,
  SESSION_RATE_SNAPSHOT_NOTE,
  SESSION_STATUSES,
  validateSessionCapacity,
  WEEKDAYS,
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
 * #215 (`/reschedules`) is the consumer — do not fold it into a refine.
 */
export function checkCanApproveReschedule(target: PublicSession) {
  return canApproveReschedule(target);
}

const WEEKDAY_VALUES = WEEKDAYS.map((day) => String(day.value)) as [string, ...string[]];
const MAX_SERIES_DAYS = 366;

const sessionFields = {
  name: z.string().trim().max(120, "Use 120 characters or fewer."),
  classId: z.string().min(1, "Choose a class."),
  /** Any venue, any time: sessions may overlap, even at the same venue. */
  venueId: z.string().min(1, "Choose a venue."),
  coachIds: z
    .array(z.string().min(1))
    .min(1, "Choose at least one coach.")
    .refine((ids) => new Set(ids).size === ids.length, "Choose each coach only once."),
  startsAt: z.string().min(1, "Set a start time."),
  endsAt: z.string().min(1, "Set an end time."),
  /** Mock field name. Integer pesos — not `customerPrice` / `php_decimal`. */
  pricePhp: z.coerce.number().int().min(FIELD_CONSTRAINTS.session.customerPrice.min),
  capacity: z.coerce
    .number()
    .int()
    .min(FIELD_CONSTRAINTS.session.capacity.min)
    .max(FIELD_CONSTRAINTS.session.capacity.max),
  bookable: z.boolean(),
  status: z.enum(SESSION_STATUSES),
  /** Create only. "weekly" turns the new session into the first of a weekly series. */
  repeat: z.enum(["none", "weekly"]),
  /** `Weekday` values as strings (0 = Sunday). */
  repeatWeekdays: z.array(z.enum(WEEKDAY_VALUES)),
  repeatEndsOn: z.string(),
};

function refineSession(
  values: {
    startsAt: string;
    endsAt: string;
    capacity: number;
    repeat: "none" | "weekly";
    repeatWeekdays: string[];
    repeatEndsOn: string;
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
  if (values.repeat === "weekly") refineRepeat(values, ctx);
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

function refineRepeat(
  values: { startsAt: string; repeatWeekdays: string[]; repeatEndsOn: string },
  ctx: z.RefinementCtx,
) {
  if (values.repeatWeekdays.length === 0) {
    ctx.addIssue({ code: "custom", path: ["repeatWeekdays"], message: "Choose at least one day." });
  }
  if (!isManilaYmd(values.repeatEndsOn)) {
    ctx.addIssue({
      code: "custom",
      path: ["repeatEndsOn"],
      message: "Choose when the series ends.",
    });
    return;
  }
  const firstYmd = manilaYmd(values.startsAt);
  const days = calendarDayDistance(firstYmd, values.repeatEndsOn);
  if (days < 0) {
    ctx.addIssue({
      code: "custom",
      path: ["repeatEndsOn"],
      message: "The series must end on or after the first session.",
    });
  } else if (days > MAX_SERIES_DAYS) {
    ctx.addIssue({
      code: "custom",
      path: ["repeatEndsOn"],
      message: "Create at most one year at a time.",
    });
  }
}

export function makeSessionFormSchema({ consumed }: { consumed: number }) {
  return z.object(sessionFields).superRefine((values, ctx) => refineSession(values, ctx, consumed));
}

export const sessionFormSchema = makeSessionFormSchema({ consumed: 0 });

export type SessionFormValues = z.infer<typeof sessionFormSchema>;
