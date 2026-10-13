import { FIELD_CONSTRAINTS } from "@balanse/domain";
import type { AdminApiActor } from "./deps";
import { ApiError } from "./errors";
import { asString } from "./http";
import { canManageRates } from "./sensitive";
import { fieldError, moneyValue, optionalString, throwFields } from "./validation";

/**
 * Coach profile parsing shared by `POST /api/admin/coaches` and staff provisioning
 * (`POST /api/admin/staff` with `newCoach`). A coach is always one staff member.
 */

/** True when the body carries any rate field (`defaultRatePhp` from the admin client, legacy `defaultRate`). */
export function sendsRate(body: Record<string, unknown>): boolean {
  return body.defaultRatePhp != null || body.defaultRate != null || body.rateType != null;
}

/** Reads the coach default rate, preferring the client's `defaultRatePhp` over legacy `defaultRate`. */
export function coachRateValue(body: Record<string, unknown>): string | null | undefined {
  return "defaultRatePhp" in body
    ? moneyValue(body, "defaultRatePhp", false)
    : moneyValue(body, "defaultRate", false);
}

export function parseSpecialties(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  if (value.length > FIELD_CONSTRAINTS.coach.specialties.maxItems) {
    throwFields(
      fieldError(
        "specialties",
        "too_long",
        `At most ${FIELD_CONSTRAINTS.coach.specialties.maxItems} specialties.`,
      ),
    );
  }
  return value.map((item, index) => {
    if (typeof item !== "string" || !item.trim()) {
      throwFields(
        fieldError(`specialties.${index}`, "invalid_type", "Each specialty must be text."),
      );
    }
    const trimmed = item.trim();
    if (trimmed.length > FIELD_CONSTRAINTS.coach.specialties.itemMax) {
      throwFields(
        fieldError(
          `specialties.${index}`,
          "too_long",
          `Specialty must be at most ${FIELD_CONSTRAINTS.coach.specialties.itemMax} characters.`,
        ),
      );
    }
    return trimmed;
  });
}

/** Validated data for a new coach profile. `fallbackName` is the staff member's name. */
export function parseNewCoachProfile(
  actor: AdminApiActor,
  body: Record<string, unknown>,
  fallbackName: string,
) {
  const name =
    optionalString(body, "name", FIELD_CONSTRAINTS.coach.name.max)?.trim() || fallbackName;
  // The bio is optional in the editor; store an empty string rather than reject the coach.
  const shortBio = optionalString(body, "shortBio", FIELD_CONSTRAINTS.coach.shortBio.max) ?? "";
  const mayManageRates = canManageRates(actor);
  if (!mayManageRates && sendsRate(body)) {
    throw new ApiError(403, "forbidden", "Missing permission.", {
      details: { permission: "coach_rates.manage" },
    });
  }
  const defaultRate = mayManageRates ? (coachRateValue(body) ?? "0") : "0";
  const rateType = mayManageRates ? (asString(body.rateType) ?? "PER_SESSION") : "PER_SESSION";
  if (rateType !== "PER_SESSION" && rateType !== "PER_HOUR") {
    throwFields(
      fieldError("rateType", "invalid_enum", "rateType must be PER_SESSION or PER_HOUR."),
    );
  }
  return {
    name,
    specialties: parseSpecialties(body.specialties),
    shortBio,
    defaultRate,
    rateType,
    active: body.active !== false,
  } as const;
}

/** A staff member can take a new coach profile only when active, real, and not yet a coach. */
export function assertStaffCanCoach(
  staff: { id: string; isSystem: boolean; status: string; coach: { id: string } | null } | null,
): asserts staff is { id: string; isSystem: boolean; status: string; coach: null } {
  if (!staff || staff.isSystem) {
    throwFields(fieldError("staffId", "inactive_reference", "Choose an existing staff member."));
  }
  if (staff.status === "DISABLED") {
    throwFields(
      fieldError("staffId", "inactive_reference", "Disabled staff cannot become coaches."),
    );
  }
  if (staff.coach) {
    throwFields(
      fieldError("staffId", "already_linked", "This staff member already has a coach profile."),
    );
  }
}
