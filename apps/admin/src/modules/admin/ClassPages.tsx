"use client";

import type { AdminClass, AdminCoach } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, Input, Label, LocalizedSkeleton } from "@balanse/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "./shared";

export function ClassListPage({ empty }: { empty?: boolean }) {
  const [rows, setRows] = useState<AdminClass[] | null>(null);

  useEffect(() => {
    void getMockAdapter()
      .getAdminClasses()
      .then((list) => setRows(empty ? [] : list));
  }, [empty]);

  if (!rows) return <LocalizedSkeleton lines={5} label="Loading classes" />;

  return (
    <section>
      <PageHeader title="Classes">
        <Link
          href="/classes/new"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
        >
          Add Class
        </Link>
      </PageHeader>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No classes yet.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
            >
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-sm text-muted-foreground">
                  {row.active ? "Active" : "Inactive"}
                </p>
              </div>
              <Link className="underline underline-offset-4" href={`/classes/${row.id}`}>
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ClassFormPage({ classId }: { classId: string }) {
  const router = useRouter();
  const isNew = classId === "new";
  const [coaches, setCoaches] = useState<AdminCoach[]>([]);
  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    defaultDurationMinutes: "",
    defaultPricePhp: "",
    active: true,
    associatedCoachIds: [] as string[],
  });

  useEffect(() => {
    void Promise.all([getMockAdapter().getAdminClasses(), getMockAdapter().getAdminCoaches()]).then(
      ([classes, coachRows]) => {
        setCoaches(coachRows);
        if (!isNew) {
          const existing = classes.find((row) => row.id === classId);
          if (existing) {
            setForm({
              name: existing.name,
              shortDescription: existing.shortDescription,
              defaultDurationMinutes: existing.defaultDurationMinutes
                ? String(existing.defaultDurationMinutes)
                : "",
              defaultPricePhp: existing.defaultPricePhp ? String(existing.defaultPricePhp) : "",
              active: existing.active,
              associatedCoachIds: existing.associatedCoachIds,
            });
          }
        }
      },
    );
  }, [classId, isNew]);

  return (
    <section className="max-w-xl">
      <PageHeader title={isNew ? "Add Class" : "Edit Class"} />
      <p className="mt-3 text-sm text-muted-foreground">
        Session values override class defaults. Do not store coach compensation as class
        information.
      </p>
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void getMockAdapter()
            .upsertAdminClass({
              id: isNew ? undefined : classId,
              name: form.name,
              shortDescription: form.shortDescription,
              defaultDurationMinutes: form.defaultDurationMinutes
                ? Number(form.defaultDurationMinutes)
                : null,
              defaultPricePhp: form.defaultPricePhp ? Number(form.defaultPricePhp) : null,
              active: form.active,
              associatedCoachIds: form.associatedCoachIds,
            })
            .then(() => router.push("/classes"));
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="class-name">Name</Label>
          <Input
            id="class-name"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="class-desc">Short description</Label>
          <Input
            id="class-desc"
            required
            value={form.shortDescription}
            onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="class-duration">Default duration (optional)</Label>
          <Input
            id="class-duration"
            type="number"
            value={form.defaultDurationMinutes}
            onChange={(event) => setForm({ ...form, defaultDurationMinutes: event.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="class-price">Default price (optional)</Label>
          <Input
            id="class-price"
            type="number"
            value={form.defaultPricePhp}
            onChange={(event) => setForm({ ...form, defaultPricePhp: event.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm({ ...form, active: event.target.checked })}
          />
          Active
        </label>
        <fieldset>
          <legend className="text-sm font-medium">Associated coaches (optional)</legend>
          <div className="mt-2 grid gap-2">
            {coaches.map((coach) => (
              <label key={coach.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.associatedCoachIds.includes(coach.id)}
                  onChange={(event) => {
                    setForm({
                      ...form,
                      associatedCoachIds: event.target.checked
                        ? [...form.associatedCoachIds, coach.id]
                        : form.associatedCoachIds.filter((id) => id !== coach.id),
                    });
                  }}
                />
                {coach.name}
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit">Save</Button>
      </form>
    </section>
  );
}
