"use client";

import { type AdminCoachResponse, ApiError, type ApiFetcher } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import {
  type AdminSession,
  COACH_DEFAULT_RATE_NOTE,
  COACH_RATE_TYPES,
  coachRateTypeLabel,
  FIELD_CONSTRAINTS,
  formatPeso,
  formatSessionDate,
  formatSessionTime,
  sessionDisplayName,
} from "@balanse/domain";
import { Button, CardListSkeleton, CoachPhoto, FormPageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Camera, LockKeyhole, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { CoachStaffLink } from "@/components/balanse/coach/coach-staff-link/CoachStaffLink";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/admin-page-tabs/AdminPageTabs";
import { useTabParam } from "@/components/balanse/page/useTabParam";
import { StaffInviteDialog } from "@/components/balanse/staff-invite-dialog/StaffInviteDialog";
import { adminNowIso } from "@/lib/clock";
import { useDeleteAdminCoach, useInviteCoach, useUpsertAdminCoach } from "@/lib/query/mutations";
import {
  adminCoachesQuery,
  adminSessionsQuery,
  adminStaffQuery,
  adminStaffRolesQuery,
} from "@/lib/query/queries";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import {
  BooleanBinding,
  ChoiceBinding,
  RichTextBinding,
  TagListBinding,
  TextBinding,
} from "@/modules/admin/forms/bindings";
import {
  coachFormDefaultValues,
  coachPublicFormDefaultValues,
  coachStaffSourceDefaultValues,
} from "@/modules/admin/forms/coach/coach-form.defaults";
import {
  type CoachFormValues,
  type CoachPublicFormValues,
  type CoachStaffSourceValues,
  coachFormSchema,
  coachNewFormSchema,
  coachNewPublicFormSchema,
  coachPublicFormSchema,
} from "@/modules/admin/forms/coach/coach-form.schema";
import {
  useCanAdminAction,
  useCanAdminRoute,
  useHasPermission,
  useStaffActor,
} from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import type { CoachFormPageProps, CoachFormTabId } from "./CoachFormPage.meta";
import { CoachLinkStaff } from "./coach-link-staff/CoachLinkStaff";
import { CoachPhotoField } from "./coach-photo-field/CoachPhotoField";
import { CoachStaffSource } from "./coach-staff-source/CoachStaffSource";
import "./coach-form-page.css";

export type { CoachFormPageProps, CoachFormTabId } from "./CoachFormPage.meta";

const TAB_LABELS: Record<CoachFormTabId, string> = {
  photo: "Profile photo",
  profile: "Public profile",
  financials: "Internal financials",
  sessions: "Upcoming sessions",
};

const TAB_FIELDS: Record<CoachFormTabId, readonly string[]> = {
  photo: ["photoKey"],
  profile: [
    "staffSource",
    "staffId",
    "inviteName",
    "inviteEmail",
    "inviteRoleId",
    "name",
    "specialties",
    "shortBio",
    "active",
  ],
  financials: ["defaultRatePhp", "rateType"],
  sessions: [],
};

function tabHasError(tab: CoachFormTabId, errors: FieldErrors): boolean {
  return TAB_FIELDS[tab].some((name) => Boolean(errors[name as keyof typeof errors]));
}

function firstTabWithError(
  errors: FieldErrors,
  tabs: readonly CoachFormTabId[],
): CoachFormTabId | null {
  for (const tab of tabs) {
    if (tabHasError(tab, errors)) return tab;
  }
  return null;
}

function valuesFromCoach(
  coach: AdminCoachResponse,
  canSeeRates: boolean,
): CoachFormValues | CoachPublicFormValues {
  const publicValues: CoachPublicFormValues = {
    name: coach.name,
    specialties: coach.specialties,
    shortBio: coach.shortBio,
    photoKey: coach.photoKey,
    active: coach.active,
  };
  if (!canSeeRates) return publicValues;
  return {
    ...publicValues,
    defaultRatePhp: coach.defaultRatePhp ?? 0,
    rateType: coach.rateType ?? "PER_SESSION",
  };
}

export function CoachFormPage({
  coachId,
  initialTab,
  fetcher = apiFetchBrowser,
}: CoachFormPageProps) {
  const router = useRouter();
  const isNew = coachId === "new";
  const actor = useStaffActor();
  const canSeeRates = useCanAdminAction("coach-rates-read");
  const canManageRates = useCanAdminAction("coach-rates-manage");
  const canManageCoaches = useCanAdminAction("coaches-manage");
  const canManageStaff = useHasPermission("staff.manage");
  const canInvite = canManageStaff && canManageCoaches;
  const canReadSchedule = useCanAdminRoute("/schedule");
  const canReadStaff = useCanAdminRoute("/staff");
  const canLinkStaff = canManageStaff && canReadStaff;
  const coachesQuery = useQuery(adminCoachesQuery(actor, fetcher));
  const staffQuery = useQuery({
    ...adminStaffQuery(actor, fetcher),
    enabled: canReadStaff,
  });
  const sessionsQuery = useQuery(adminSessionsQuery(actor, fetcher));
  const rolesQuery = useQuery({
    ...adminStaffRolesQuery(actor, fetcher),
    enabled: isNew && canInvite,
  });
  const inviteCoach = useInviteCoach();
  const [invitation, setInvitation] = useState<{
    staffName: string;
    inviteUrl: string | null;
    coachId: string | null;
  } | null>(null);
  const upsert = useUpsertAdminCoach(fetcher);
  const remove = useDeleteAdminCoach(fetcher);
  const existing = isNew ? undefined : coachesQuery.data?.find((row) => row.id === coachId);

  const tabIds = useMemo(() => {
    const ids: CoachFormTabId[] = ["profile", "photo"];
    if (canSeeRates) ids.push("financials");
    if (!isNew) ids.push("sessions");
    return ids;
  }, [canSeeRates, isNew]);

  const [tab, setTab] = useTabParam(
    "tab",
    tabIds,
    initialTab && tabIds.includes(initialTab) ? initialTab : "profile",
  );

  const upcoming = useMemo(() => {
    if (!sessionsQuery.data || isNew) return [];
    const nowIso = adminNowIso();
    return sessionsQuery.data
      .filter(
        (session) =>
          session.coaches.some((coach) => coach.id === coachId) && session.startsAt >= nowIso,
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }, [coachId, isNew, sessionsQuery.data]);

  if (!isNew && coachesQuery.isPending && !coachesQuery.data) {
    return (
      <AdminPageShell
        title="Edit Coach"
        breadcrumb={[{ label: "Coaches", href: "/coaches" }, { label: coachId }]}
      >
        <FormPageSkeleton label="Loading coach" sections={3} fields={4} tabs={4} />
      </AdminPageShell>
    );
  }

  if (!isNew && !existing) {
    return (
      <AdminPageShell
        title={coachesQuery.isError ? "Coach unavailable" : "Coach not found"}
        breadcrumb={[{ label: "Coaches", href: "/coaches" }]}
      >
        <div className="coach-editor-empty">
          <UserRound aria-hidden="true" />
          <p>
            {coachesQuery.isError
              ? "We couldn’t load this coach. Please try again."
              : "This coach profile could not be found."}
          </p>
          {coachesQuery.isError && (
            <Button variant="outline" onClick={() => void coachesQuery.refetch()}>
              Try again
            </Button>
          )}
          <Link href="/coaches" className="underline underline-offset-4">
            Back to coaches
          </Link>
        </div>
      </AdminPageShell>
    );
  }

  const defaultValues = existing
    ? valuesFromCoach(existing, canSeeRates)
    : {
        ...(canSeeRates ? coachFormDefaultValues : coachPublicFormDefaultValues),
        ...coachStaffSourceDefaultValues,
      };
  const schema = isNew
    ? canSeeRates
      ? coachNewFormSchema
      : coachNewPublicFormSchema
    : canSeeRates
      ? coachFormSchema
      : coachPublicFormSchema;

  return (
    <AdminPageShell
      title={isNew ? "Introduce a new coach" : (existing?.name ?? "Coach profile")}
      description="Shape their public profile, manage internal details, and see what’s coming up."
      eyebrow="Coach directory"
      className="coach-editor"
      breadcrumb={[
        { label: "Coaches", href: "/coaches" },
        { label: isNew ? "Add Coach" : (existing?.name ?? coachId) },
      ]}
    >
      <AdminForm
        key={`${existing?.id ?? (isNew ? "new" : `pending-${coachId}`)}:${canSeeRates ? "admin" : "public"}`}
        id="coach-form"
        className="coach-editor-form"
        schema={schema}
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          try {
            const publicValues = values as CoachPublicFormValues;
            // Rates are only sent by staff who may change them; the API rejects them otherwise.
            const rateValues = canManageRates
              ? {
                  defaultRatePhp: Number((values as CoachFormValues).defaultRatePhp) || 0,
                  rateType: (values as CoachFormValues).rateType,
                }
              : {};
            const profile = {
              name: publicValues.name,
              specialties: publicValues.specialties,
              shortBio: publicValues.shortBio ?? "",
              active: publicValues.active,
              ...rateValues,
            };
            if (isNew) {
              const source = values as unknown as CoachStaffSourceValues;
              if (source.staffSource === "invite") {
                // New person: staff account and coach profile are created together.
                const result = await inviteCoach.mutateAsync({
                  name: source.inviteName,
                  email: source.inviteEmail,
                  roleId: source.inviteRoleId,
                  coach: profile,
                });
                notify.admin("coach.saved");
                setInvitation({
                  staffName: result.staff.name,
                  inviteUrl: result.inviteUrl,
                  coachId: result.staff.coachId,
                });
                return;
              }
              const created = await upsert.mutateAsync({
                ...profile,
                staffId: source.staffId ?? undefined,
                photoKey: null,
              });
              notify.admin("coach.saved");
              // Photos need a saved coach, so continue on the new profile.
              router.push(`/coaches/${created.id}?tab=photo`);
              return;
            }
            await upsert.mutateAsync({
              id: coachId,
              ...profile,
              photoKey: publicValues.photoKey,
            });
            notify.admin("coach.saved");
            router.push("/coaches");
          } catch (error) {
            notify.admin("coach.save-failed");
            throw error;
          }
        }}
        onSubmitError={(error) => {
          if (!error || typeof error !== "object") return;
          const next = firstTabWithError(error as FieldErrors, tabIds);
          if (next) setTab(next);
        }}
      >
        <CoachFormFields
          tab={tab}
          setTab={setTab}
          tabIds={tabIds}
          canSeeRates={canSeeRates}
          isNew={isNew}
          coachId={coachId}
          fetcher={fetcher}
          upcoming={upcoming}
          sessionsPending={sessionsQuery.isPending && !sessionsQuery.data}
          sessionsError={sessionsQuery.isError}
          retrySessions={() => void sessionsQuery.refetch()}
          linkStaff={
            existing && !existing.staffId && canLinkStaff ? (
              <CoachLinkStaff
                coachId={existing.id}
                coachName={existing.name}
                staff={staffQuery.data ?? []}
              />
            ) : null
          }
          staffSource={
            isNew ? (
              <CoachStaffSource
                staff={staffQuery.data ?? []}
                roles={rolesQuery.data ?? []}
                canInvite={canInvite}
                canPickStaff={canReadStaff}
              />
            ) : null
          }
          canReadSchedule={canReadSchedule}
          linkedStaff={
            existing?.staffId
              ? (staffQuery.data?.find((row) => row.id === existing.staffId) ?? {
                  id: existing.staffId,
                  name: existing.staffId,
                })
              : null
          }
        />
        <FormActions
          submitLabel={isNew ? "Create coach" : "Save changes"}
          cancelHref="/coaches"
          className="coach-editor-actions"
        >
          <p>Changes across all sections are saved together.</p>
          {!isNew && existing && canManageCoaches ? (
            <ConfirmAction
              triggerLabel="Delete coach"
              title={`Delete ${existing.name}?`}
              description="Only coaches who were never scheduled and aren't linked to a staff account can be deleted. Otherwise, deactivate them so past sessions keep their coach."
              confirmLabel="Delete coach"
              variant="destructive"
              disabled={remove.isPending || upsert.isPending}
              onConfirm={async () => {
                try {
                  await remove.mutateAsync(existing.id);
                  notify.admin("coach.deleted");
                  router.push("/coaches");
                } catch (error) {
                  notify.admin(
                    error instanceof ApiError && error.code === "coach_in_use"
                      ? "coach.delete-blocked"
                      : "coach.delete-failed",
                  );
                }
              }}
            />
          ) : null}
        </FormActions>
      </AdminForm>
      {invitation ? (
        <StaffInviteDialog
          staffName={invitation.staffName}
          inviteUrl={invitation.inviteUrl}
          onClose={() => {
            const next = invitation.coachId
              ? `/coaches/${invitation.coachId}?tab=photo`
              : "/coaches";
            setInvitation(null);
            router.push(next);
          }}
        />
      ) : null}
    </AdminPageShell>
  );
}

function CoachFormFields({
  tab,
  setTab,
  tabIds,
  canSeeRates,
  isNew,
  coachId,
  fetcher,
  upcoming,
  sessionsPending,
  sessionsError,
  retrySessions,
  canReadSchedule,
  linkedStaff,
  staffSource,
  linkStaff,
}: {
  tab: CoachFormTabId;
  setTab: (next: CoachFormTabId) => void;
  tabIds: readonly CoachFormTabId[];
  canSeeRates: boolean;
  isNew: boolean;
  coachId: string;
  fetcher: ApiFetcher;
  upcoming: AdminSession[];
  sessionsPending: boolean;
  sessionsError: boolean;
  retrySessions: () => void;
  canReadSchedule: boolean;
  linkedStaff: { id: string; name: string } | null;
  /** New coaches only: the "Who is this coach?" section. */
  staffSource: ReactNode;
  /** Unlinked existing coaches: the "Link to staff" action, when allowed. */
  linkStaff: ReactNode;
}) {
  const { formState, watch } = useAdminFormContext<CoachFormValues>();
  const previewName = watch("name") || "Coach";
  const photoKey = watch("photoKey");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const specialties = watch("specialties") ?? [];
  const active = watch("active");
  const rate = watch("defaultRatePhp");
  const rateType = watch("rateType");

  const tabs = tabIds.map((id) => ({
    id,
    label: tabHasError(id, formState.errors) ? `${TAB_LABELS[id]} · errors` : TAB_LABELS[id],
    error: tabHasError(id, formState.errors),
  }));

  return (
    <>
      <AdminPageTabs
        tabs={tabs}
        value={tab}
        onValueChange={(next) => setTab(next as CoachFormTabId)}
        mobileBehavior="tabs"
        label="Coach profile"
        className="coach-editor-tabs"
      />

      <div className="coach-editor-layout">
        <div className="coach-editor-content">
          <section data-slot="coach-photo" className={tab === "photo" ? undefined : "hidden"}>
            <div className="coach-section-kicker">
              <Camera size={15} aria-hidden="true" /> First impressions
            </div>
            <FormSection
              title="A face to the name"
              description="Choose a welcoming portrait that helps members recognise their coach."
              surface="card"
            >
              <FormField name="photoKey" label="Profile photo" wireAria>
                {(field) => (
                  <CoachPhotoField
                    {...field}
                    coachId={isNew ? null : coachId}
                    fetcher={fetcher}
                    previewName={previewName}
                    onPreviewChange={setPhotoPreview}
                  />
                )}
              </FormField>
            </FormSection>
            <div className="coach-editor-note">
              <Camera size={18} aria-hidden="true" />
              <div>
                <strong>A simple portrait works best</strong>
                <p>
                  Keep the face centred with a little space around it. This photo appears on coach
                  cards and class schedules.
                </p>
              </div>
            </div>
          </section>

          <section data-slot="coach-profile" className={tab === "profile" ? undefined : "hidden"}>
            {staffSource}
            <div className="coach-section-kicker">
              <UserRound size={15} aria-hidden="true" /> Visible to members
            </div>
            <FormSection
              title="Meet the coach"
              description="The details that help members find their practice and the people behind it."
              surface="card"
            >
              <FormField name="name" label="Coach name" required>
                {(field) => <TextBinding {...field} />}
              </FormField>
              <FormField
                name="specialties"
                label="Specialty / Classes"
                description="Add each specialty as its own chip. Required when the coach is active."
                span="full"
              >
                {(field) => <TagListBinding {...field} />}
              </FormField>
              <FormField name="shortBio" label="Short bio" optional span="full">
                {(field) => (
                  <RichTextBinding {...field} maxLength={FIELD_CONSTRAINTS.coach.shortBio.max} />
                )}
              </FormField>
              <FormField
                name="active"
                label="Available for new sessions"
                description="Turn off to stop new assignments. Existing sessions stay unchanged."
                orientation="horizontal"
              >
                {(field) => <BooleanBinding {...field} as="switch" />}
              </FormField>
            </FormSection>
          </section>

          {canSeeRates ? (
            <section
              data-slot="internal-financials"
              className={tab === "financials" ? undefined : "hidden"}
            >
              <div className="coach-section-kicker">
                <LockKeyhole size={15} aria-hidden="true" /> Internal only
              </div>
              <FormSection
                title="Compensation defaults"
                description={COACH_DEFAULT_RATE_NOTE}
                columns={2}
                surface="card"
              >
                <FormField name="defaultRatePhp" label="Default rate">
                  {(field) => <TextBinding {...field} type="number" />}
                </FormField>
                <FormField name="rateType" label="Rate type">
                  {(field) => (
                    <ChoiceBinding
                      {...field}
                      options={COACH_RATE_TYPES.map((type) => ({
                        value: type,
                        label: coachRateTypeLabel(type),
                      }))}
                    />
                  )}
                </FormField>
              </FormSection>
              <div className="coach-editor-note">
                <LockKeyhole size={18} aria-hidden="true" />
                <div>
                  <strong>Private to authorised staff</strong>
                  <p>
                    These rates never appear on public profiles. Updating the default does not
                    change rates already saved on sessions.
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {!isNew ? (
            <section
              data-slot="coach-sessions"
              className={tab === "sessions" ? undefined : "hidden"}
            >
              <div className="coach-section-kicker">
                <CalendarDays size={15} aria-hidden="true" /> On the calendar
              </div>
              <div className="coach-sessions-panel">
                <div className="coach-sessions-heading">
                  <div>
                    <h2>Upcoming sessions</h2>
                    <p>The coach’s assigned classes, in date order.</p>
                  </div>
                  {!sessionsPending && !sessionsError && <span>{upcoming.length} scheduled</span>}
                </div>
                {sessionsPending ? (
                  <CardListSkeleton label="Loading assigned sessions" items={2} />
                ) : sessionsError ? (
                  <div className="coach-editor-empty">
                    <CalendarDays aria-hidden="true" />
                    <h3>Sessions couldn’t load</h3>
                    <p>Please try again to see the latest assignments.</p>
                    <Button type="button" variant="outline" onClick={retrySessions}>
                      Try again
                    </Button>
                  </div>
                ) : upcoming.length === 0 ? (
                  <div className="coach-editor-empty">
                    <CalendarDays aria-hidden="true" />
                    <h3>A little room in the calendar</h3>
                    <p>No upcoming sessions are assigned to this coach yet.</p>
                    {canReadSchedule && (
                      <Link href="/schedule" className="coach-editor-text-link">
                        Explore the schedule →
                      </Link>
                    )}
                  </div>
                ) : (
                  <ul className="coach-session-list">
                    {upcoming.map((session) => (
                      <li key={session.id}>
                        <span className="coach-session-icon">
                          <CalendarDays size={21} aria-hidden="true" />
                        </span>
                        <div>
                          <h3>{sessionDisplayName(session)}</h3>
                          <p>{formatSessionDate(session.startsAt)}</p>
                          <span>
                            {formatSessionTime(session.startsAt)}–
                            {formatSessionTime(session.endsAt)} · Philippine time
                          </span>
                        </div>
                        {canReadSchedule && (
                          <Link
                            href={`/schedule/${session.id}`}
                            aria-label={`View ${sessionDisplayName(session)} on ${formatSessionDate(session.startsAt)}`}
                            className="coach-editor-text-link"
                          >
                            View session →
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="coach-sessions-footnote">
                Assignments are managed in Schedule. Changes to this profile won’t alter the
                timetable.
              </p>
            </section>
          ) : null}
        </div>
        <aside className="coach-preview" aria-label="Coach profile preview">
          <div className="coach-preview-heading">
            <Sparkles size={14} aria-hidden="true" /> Profile preview{" "}
            <span>{formState.isDirty ? "Unsaved edits" : "Current profile"}</span>
          </div>
          <div className="coach-preview-portrait">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt={`Selected portrait of ${previewName}`} />
            ) : (
              <CoachPhoto photoKey={photoKey} name={previewName} ratio="4:5" />
            )}
            <span className="coach-preview-state">{active ? "Active coach" : "Inactive"}</span>
          </div>
          <div className="coach-preview-body">
            <h2>{previewName}</h2>
            <div className="coach-preview-specialties">
              {specialties.length ? (
                specialties.map((specialty) => <span key={specialty}>{specialty}</span>)
              ) : (
                <p>Add a specialty to introduce their practice.</p>
              )}
            </div>
            {canSeeRates && tab === "financials" && (
              <div className="coach-preview-rate">
                <p>
                  <LockKeyhole size={12} aria-hidden="true" /> Internal default
                </p>
                <strong>{formatPeso(Number(rate) || 0)}</strong>
                <span>{rateType ? coachRateTypeLabel(rateType) : "Choose a rate type"}</span>
              </div>
            )}
            {!isNew && (
              <div className="coach-preview-account">
                <p>Staff access</p>
                {linkedStaff ? (
                  <CoachStaffLink staff={linkedStaff} />
                ) : (
                  <>
                    <span>
                      No staff account linked. This coach can still be assigned to sessions.
                    </span>
                    {linkStaff}
                  </>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
