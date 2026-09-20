"use client";

import {
  type AdminCoach,
  type AdminSession,
  COACH_DEFAULT_RATE_NOTE,
  coachRateTypeLabel,
  formatSessionDate,
  formatSessionTime,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, CardListSkeleton, CoachPhoto, Input, Label, NativeSelect } from "@balanse/ui";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageUpload } from "@/components/balanse/ImageUpload";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { adminCoachesQuery, adminSessionsQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function CoachListPage() {
  const { principal } = useMockPrincipal();
  const { data: rows } = useSuspenseQuery(adminCoachesQuery(principal.role));

  return (
    <AdminPageShell
      title="Coaches"
      actions={
        <Button nativeButton={false} render={<Link href="/coaches/new" />}>
          Add Coach
        </Button>
      }
    >
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
          >
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                {row.specialties.join(" / ")} · {row.active ? "Active" : "Inactive"}
              </p>
            </div>
            <Link className="underline underline-offset-4" href={`/coaches/${row.id}`}>
              View
            </Link>
          </li>
        ))}
      </ul>
    </AdminPageShell>
  );
}

export function CoachFormPage({ coachId }: { coachId: string }) {
  const router = useRouter();
  const isNew = coachId === "new";
  const { principal } = useMockPrincipal();
  const coachesQuery = useQuery(adminCoachesQuery(principal.role));
  const sessionsQuery = useQuery(adminSessionsQuery(principal.role));
  const [form, setForm] = useState<AdminCoach>({
    id: "",
    name: "",
    specialties: [],
    shortBio: "",
    photoKey: null,
    active: true,
    defaultRatePhp: 650,
    rateType: "PER_SESSION",
  });
  const [upcoming, setUpcoming] = useState<AdminSession[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState("");

  useEffect(() => {
    const coaches = coachesQuery.data;
    if (!coaches || isNew) return;
    const existing = coaches.find((row) => row.id === coachId);
    if (existing) {
      setForm(existing);
      setSpecialtyInput(existing.specialties.join(", "));
    }
  }, [coachId, coachesQuery.data, isNew]);

  useEffect(() => {
    const sessions = sessionsQuery.data;
    if (!sessions || isNew) return;
    setUpcoming(
      sessions.filter((session) => session.coachId === coachId && session.startsAt >= "2026-09-16"),
    );
  }, [coachId, isNew, sessionsQuery.data]);

  return (
    <AdminPageShell
      className="max-w-xl"
      title={isNew ? "Add Coach" : "Edit Coach"}
      breadcrumb={[
        { label: "Coaches", href: "/coaches" },
        { label: isNew ? "Add Coach" : form.name || coachId },
      ]}
    >
      <form
        className="mt-6 grid gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          void getMockAdapter()
            .upsertAdminCoach({
              id: isNew ? undefined : form.id,
              name: form.name,
              specialties: specialtyInput
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              shortBio: form.shortBio,
              photoKey: form.photoKey,
              active: form.active,
              defaultRatePhp: form.defaultRatePhp,
              rateType: form.rateType,
            })
            .then(() => router.push("/coaches"));
        }}
      >
        <section>
          <h2 className="font-display text-2xl">Profile Photo</h2>
          <div className="mt-3 w-40">
            <CoachPhoto photoKey={form.photoKey} name={form.name || "Coach"} ratio="1:1" />
          </div>
          <ImageUpload
            className="mt-4"
            label="Upload/Replace"
            fallbackLabel="Fallback avatar when no photo is saved."
            submitLabel="Keep preview"
            onMockSubmit={async () => {
              setForm((current) => ({
                ...current,
                photoKey:
                  current.photoKey ??
                  `coach-photos/${current.name.toLowerCase().replace(/\s+/g, "-") || "new"}`,
              }));
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => setForm({ ...form, photoKey: null })}
          >
            Remove
          </Button>
        </section>

        <section>
          <h2 className="font-display text-2xl">Public Profile</h2>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="coach-name">Name</Label>
              <Input
                id="coach-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="coach-specialty">Specialty / Classes</Label>
              <Input
                id="coach-specialty"
                value={specialtyInput}
                onChange={(event) => setSpecialtyInput(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="coach-bio">Short Bio</Label>
              <Input
                id="coach-bio"
                value={form.shortBio}
                onChange={(event) => setForm({ ...form, shortBio: event.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
              />
              Status: Active
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
          <h2 className="font-display text-2xl">Internal Financials</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Admin-only. Never shown on public or customer surfaces.
          </p>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="coach-rate">Default Rate</Label>
              <Input
                id="coach-rate"
                type="number"
                value={form.defaultRatePhp}
                onChange={(event) =>
                  setForm({ ...form, defaultRatePhp: Number(event.target.value) })
                }
              />
              <p className="text-sm text-muted-foreground">{COACH_DEFAULT_RATE_NOTE}</p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="coach-rate-type">Rate Type</Label>
              <NativeSelect
                id="coach-rate-type"
                value={form.rateType}
                onChange={(event) =>
                  setForm({ ...form, rateType: event.target.value as AdminCoach["rateType"] })
                }
              >
                <option value="PER_SESSION">{coachRateTypeLabel("PER_SESSION")}</option>
                <option value="PER_HOUR">{coachRateTypeLabel("PER_HOUR")}</option>
              </NativeSelect>
            </div>
          </div>
        </section>

        <Button type="submit">Save Changes</Button>
      </form>

      {!isNew ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Upcoming Sessions</h2>
          {sessionsQuery.isPending && !sessionsQuery.data ? (
            <CardListSkeleton label="Loading coach" items={2} />
          ) : upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No upcoming assigned sessions.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcoming.map((session) => (
                <li key={session.id} className="rounded-xl border border-border p-3 text-sm">
                  {session.className} · {formatSessionDate(session.startsAt)} ·{" "}
                  {formatSessionTime(session.startsAt)}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </AdminPageShell>
  );
}
