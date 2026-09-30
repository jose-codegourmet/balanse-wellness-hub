import type { ClassChangeRequestKind } from "@balanse/domain";
import type { ClassChangeFormValues } from "./class-change-form.schema";

export const classChangeFormDefaultValues: ClassChangeFormValues = {
  kind: "RESCHEDULE",
  reason: "",
  proposedDate: "",
  proposedTime: "",
  substituteCoachId: "",
};

/** Start on the path the coach picked from the schedule panel. */
export function classChangeFormValuesFor(kind: ClassChangeRequestKind): ClassChangeFormValues {
  return { ...classChangeFormDefaultValues, kind };
}
