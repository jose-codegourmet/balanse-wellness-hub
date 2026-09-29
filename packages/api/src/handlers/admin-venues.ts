import type { Prisma, Venue } from "@balanse/db";
import { type AdminVenue, FIELD_CONSTRAINTS, VENUE_KINDS, type VenueKind } from "@balanse/domain";
import { requireAdmin, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { ok, readJson, searchParams } from "../http";
import { fieldError, optionalString, requireString, throwFields } from "../validation";

const LIMITS = FIELD_CONSTRAINTS.venue;

/**
 * Venues are branches and off-site partner venues. Sessions reference one; events show
 * their session's venue. Route permissions come from ADMIN_API_ACCESS (read: classes,
 * schedule, or events readers; write: classes.manage). Venues are deactivated, never deleted.
 */
export function presentAdminVenue(row: Venue): AdminVenue {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    kind: row.kind,
    active: row.active,
    notes: row.notes,
  };
}

function readKind(body: Record<string, unknown>, required: boolean): VenueKind | undefined {
  if (!("kind" in body) || body.kind == null) {
    if (required) throwFields(fieldError("kind", "required", "kind is required."));
    return undefined;
  }
  if (!VENUE_KINDS.includes(body.kind as VenueKind)) {
    throwFields(fieldError("kind", "invalid_enum", "kind must be BRANCH or OFFSITE."));
  }
  return body.kind as VenueKind;
}

function readActive(body: Record<string, unknown>): boolean | undefined {
  if (!("active" in body) || body.active == null) return undefined;
  if (typeof body.active !== "boolean") {
    throwFields(fieldError("active", "invalid_type", "active must be true or false."));
  }
  return body.active;
}

/** Omitted or null leaves the field alone; send "" to clear it. */
function readText(
  body: Record<string, unknown>,
  path: "address" | "notes",
  max: number,
): string | undefined {
  return optionalString(body, path, max)?.trim();
}

/** Case-insensitive name check so "Shangri-La" and "shangri-la" cannot both exist. */
async function assertNameAvailable(
  tx: Prisma.TransactionClient,
  name: string,
  exceptId?: string,
): Promise<void> {
  const clash = await tx.venue.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    select: { id: true },
  });
  if (clash) {
    throw new ApiError(409, "conflict", "A venue with this name already exists.", {
      fieldErrors: [
        { path: "name", code: "duplicate_value", message: "This name is already used." },
      ],
      details: { venueId: clash.id },
    });
  }
}

export async function getAdminVenues(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const params = searchParams(req);
  const active = params.get("active");
  const kind = params.get("kind");
  if (kind && !VENUE_KINDS.includes(kind as VenueKind)) {
    throwFields(fieldError("kind", "invalid_enum", "kind must be BRANCH or OFFSITE."));
  }
  const items = await deps.prisma.venue.findMany({
    where: {
      ...(active === "true" ? { active: true } : active === "false" ? { active: false } : {}),
      ...(kind ? { kind: kind as VenueKind } : {}),
    },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return ok({ items: items.map(presentAdminVenue) });
}

export async function postAdminVenue(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = requireString(body, "name", LIMITS.name.max);
  const kind = readKind(body, true) as VenueKind;
  const address = readText(body, "address", LIMITS.address.max) ?? "";
  const notes = readText(body, "notes", LIMITS.notes.max) ?? "";
  const active = readActive(body) ?? true;
  const created = await deps.prisma.$transaction(async (tx) => {
    await assertNameAvailable(tx, name);
    return tx.venue.create({ data: { name, kind, address, notes, active } });
  });
  await writeAudit(deps, {
    entityType: "venue",
    entityId: created.id,
    action: "venue.create",
    actor,
    metadata: { kind: created.kind },
  });
  return ok({ venue: presentAdminVenue(created) });
}

export async function patchAdminVenue(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const name = "name" in body ? requireString(body, "name", LIMITS.name.max) : undefined;
  const kind = readKind(body, false);
  const address = readText(body, "address", LIMITS.address.max);
  const notes = readText(body, "notes", LIMITS.notes.max);
  const active = readActive(body);
  const updated = await deps.prisma.$transaction(async (tx) => {
    const existing = await tx.venue.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new ApiError(404, "venue_not_found", "Venue not found.");
    if (name !== undefined) await assertNameAvailable(tx, name, id);
    return tx.venue.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(kind !== undefined ? { kind } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(active !== undefined ? { active } : {}),
      },
    });
  });
  await writeAudit(deps, {
    entityType: "venue",
    entityId: id,
    action: "venue.update",
    actor,
    metadata: { fields: Object.keys(body) },
  });
  return ok({ venue: presentAdminVenue(updated) });
}
