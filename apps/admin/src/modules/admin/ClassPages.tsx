"use client";

import { Button } from "@balanse/ui";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { useUpsertAdminClass } from "@/lib/query/mutations";
import { adminClassesQuery, adminCoachesQuery } from "@/lib/query/queries";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { AdminForm, FormActions, FormField } from "./forms/AdminForm";
import { BooleanBinding, CheckboxGroupBinding, TextBinding } from "./forms/bindings";
import { classFormDefaultValues } from "./forms/class/class-form.defaults";
import { classFormSchema } from "./forms/class/class-form.schema";

export function ClassListPage({ empty }: { empty?: boolean }) {
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminClassesQuery(principal.role));
  const rows = empty ? [] : query.data;

  return (
    <AdminPageShell
      title="Classes"
      actions={
        <Button nativeButton={false} render={<Link href="/classes/new" />}>
          Add Class
        </Button>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No classes yet.</p>
      ) : (
        <ul className="space-y-2">
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
    </AdminPageShell>
  );
}

export function ClassFormPage({ classId }: { classId: string }) {
  const router = useRouter();
  const isNew = classId === "new";
  const { principal } = useMockPrincipal();
  const classesQuery = useQuery(adminClassesQuery(principal.role));
  const coachesQuery = useQuery(adminCoachesQuery(principal.role));
  const coaches = coachesQuery.data ?? [];
  const existing = isNew ? undefined : classesQuery.data?.find((row) => row.id === classId);
  const upsert = useUpsertAdminClass();

  const defaultValues = existing
    ? {
        name: existing.name,
        shortDescription: existing.shortDescription,
        defaultDurationMinutes: existing.defaultDurationMinutes,
        defaultPricePhp: existing.defaultPricePhp,
        active: existing.active,
        associatedCoachIds: existing.associatedCoachIds,
      }
    : classFormDefaultValues;

  return (
    <AdminPageShell
      className="max-w-xl"
      title={isNew ? "Add Class" : "Edit Class"}
      breadcrumb={[
        { label: "Classes", href: "/classes" },
        {
          label: isNew
            ? "Add Class"
            : (classesQuery.data?.find((row) => row.id === classId)?.name ?? classId),
        },
      ]}
    >
      <p className="text-sm text-muted-foreground">
        Session values override class defaults. Do not store coach compensation as class
        information.
      </p>
      <AdminForm
        key={existing?.id ?? (isNew ? "new" : `pending-${classId}`)}
        className="mt-6"
        schema={classFormSchema}
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          try {
            await upsert.mutateAsync({
              id: isNew ? undefined : classId,
              ...values,
            });
            notify.admin("class.saved");
            router.push("/classes");
          } catch (error) {
            notify.admin("class.save-failed");
            throw error;
          }
        }}
      >
        <FormField name="name" label="Name">
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField name="shortDescription" label="Short description">
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField name="defaultDurationMinutes" label="Default duration (optional)">
          {(field) => <TextBinding {...field} type="number" />}
        </FormField>
        <FormField name="defaultPricePhp" label="Default price (optional)">
          {(field) => <TextBinding {...field} type="number" />}
        </FormField>
        <FormField name="active" label="Active" orientation="horizontal">
          {(field) => <BooleanBinding {...field} as="switch" />}
        </FormField>
        <FormField name="associatedCoachIds" label="Associated coaches (optional)">
          {(field) => (
            <CheckboxGroupBinding
              {...field}
              options={coaches.map((coach) => ({ value: coach.id, label: coach.name }))}
            />
          )}
        </FormField>
        <FormActions submitLabel="Save" />
      </AdminForm>
    </AdminPageShell>
  );
}
