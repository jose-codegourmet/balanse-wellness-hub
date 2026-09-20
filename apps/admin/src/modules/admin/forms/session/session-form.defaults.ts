import { SESSION_SLOTS_MANILA } from "@balanse/domain";
import type { SessionFormValues } from "./session-form.schema";
import { toSessionIso } from "./session-form.schema";

export const sessionFormDefaultValues: SessionFormValues = {
  classId: "",
  coachId: "",
  startsAt: "",
  endsAt: "",
  pricePhp: 0,
  capacity: 1,
  bookable: true,
  status: "DRAFT",
  coachRatePhp: 0,
  coachRateType: "PER_SESSION",
};

const DEFAULT_START = SESSION_SLOTS_MANILA[0];
const DEFAULT_END = SESSION_SLOTS_MANILA[1];

export function sessionFormValuesFromSession(
  session: Pick<
    SessionFormValues,
    | "classId"
    | "coachId"
    | "startsAt"
    | "endsAt"
    | "pricePhp"
    | "capacity"
    | "bookable"
    | "status"
    | "coachRatePhp"
    | "coachRateType"
  >,
): SessionFormValues {
  return {
    classId: session.classId,
    coachId: session.coachId,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    pricePhp: session.pricePhp,
    capacity: session.capacity,
    bookable: session.bookable,
    status: session.status,
    coachRatePhp: session.coachRatePhp,
    coachRateType: session.coachRateType,
  };
}

export function sessionFormValuesForDate(ymd: string): SessionFormValues {
  return {
    ...sessionFormDefaultValues,
    startsAt: toSessionIso(ymd, DEFAULT_START),
    endsAt: toSessionIso(ymd, DEFAULT_END),
    status: "PUBLISHED",
    bookable: true,
  };
}
