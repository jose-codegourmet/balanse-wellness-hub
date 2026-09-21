"use client";
import { classPageHref, classPreviewHref, classSlug, type PublicCoach } from "@balanse/domain";
import { Button, FormPageSkeleton, Input } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClassImagesInput } from "@/components/balanse/class-images-input/ClassImagesInput";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/AdminForm";
import {
  BooleanBinding,
  CheckboxGroupBinding,
  RichTextBinding,
  TextareaBinding,
  TextBinding,
} from "@/modules/admin/forms/bindings";
import { classFormDefaultValues } from "@/modules/admin/forms/class/class-form.defaults";
import {
  type ClassFormValues,
  classFormSchema,
} from "@/modules/admin/forms/class/class-form.schema";
import { useUnsavedChangesGuard } from "@/modules/admin/forms/useUnsavedChangesGuard";
import { notify } from "@/modules/notifications/notify";
import { useClassCatalogue } from "../class-catalogue-provider/ClassCatalogueProvider";
import { ClassDatabaseAccess } from "../class-database-access/ClassDatabaseAccess";
import type { ClassFormPageProps } from "./ClassFormPage.schema";

export function ClassFormPage({ classId }: ClassFormPageProps) {
  const isNew = classId === "new";
  const catalogue = useClassCatalogue();
  const query = useQuery(catalogue.query);
  const router = useRouter();
  const existing = query.data?.classes.find((row) => row.id === classId);
  if (query.isLoading)
    return (
      <AdminPageShell title="Class editor">
        <FormPageSkeleton label="Loading class" sections={3} fields={6} />
      </AdminPageShell>
    );
  if (query.isError)
    return (
      <AdminPageShell title="Class unavailable">
        <p role="alert">Could not load the database catalogue.</p>
        <Button onClick={() => void query.refetch()}>Try again</Button>
      </AdminPageShell>
    );
  if (!isNew && !existing)
    return (
      <AdminPageShell title="Class not found">
        <Button onClick={() => router.push("/classes")}>Back to classes</Button>
      </AdminPageShell>
    );
  const defaults: ClassFormValues = existing
    ? {
        ...existing,
        pageMode: existing.customPageUrl ? "redirect" : "standard",
        customPageUrl: existing.customPageUrl ?? "",
        heroImage: existing.heroImage ?? "",
      }
    : classFormDefaultValues;
  const canSave = query.data?.canSave ?? false;
  return (
    <AdminPageShell title={isNew ? "Create a class" : (existing?.name ?? "Edit class")}>
      <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
        Shape the class page, choose its teaching team, and set the defaults for future sessions.
      </p>
      <div className="mb-6">
        <ClassDatabaseAccess
          canSave={canSave}
          connect={catalogue.connect}
          disconnect={catalogue.disconnect}
          onConnected={() => void query.refetch()}
        />
      </div>
      <AdminForm
        key={classId}
        id="class-editor"
        schema={classFormSchema}
        defaultValues={defaults}
        onSubmit={async (values) => {
          if (!canSave) throw new Error("Sign in with a verified administrator account to save.");
          const { pageMode, ...input } = values;
          await catalogue.mutation.mutateAsync({
            ...input,
            id: isNew ? undefined : classId,
            heroImage: values.heroImage || null,
            customPageUrl: pageMode === "redirect" ? values.customPageUrl : null,
          });
          notify.admin("class.saved");
          router.push("/classes");
          router.refresh();
        }}
      >
        <ClassFields
          classId={classId}
          isNew={isNew}
          coaches={query.data?.coaches ?? []}
          canSave={canSave}
        />
      </AdminForm>
    </AdminPageShell>
  );
}
function ClassFields({
  classId,
  isNew,
  coaches,
  canSave,
}: {
  classId: string;
  isNew: boolean;
  coaches: PublicCoach[];
  canSave: boolean;
}) {
  const form = useAdminFormContext<ClassFormValues>();
  const guard = useUnsavedChangesGuard(form.formState.isDirty);
  const [search, setSearch] = useState("");
  const values = form.watch();
  const site = process.env.NEXT_PUBLIC_MARKETING_URL ?? "http://localhost:9000";
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => guard.requestLeave("/classes")}>
          <ArrowLeft />
          All classes
        </Button>
        {values.slug ? (
          <a
            className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
            href={
              site +
              classPreviewHref({ id: classId, ...values, heroImage: values.heroImage || null })
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview standard layout
            <ExternalLink className="size-4" />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">
            Name your class to preview its page.
          </span>
        )}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <FormSection title="Class details" surface="card">
            <FormField name="name" label="Class name" required>
              {(field) => (
                <TextBinding
                  {...field}
                  placeholder="e.g. Mat Pilates"
                  onChange={(value) => {
                    field.onChange(value);
                    if (isNew && !form.formState.dirtyFields.slug)
                      form.setValue("slug", classSlug(String(value)));
                  }}
                />
              )}
            </FormField>
            <FormField
              name="shortDescription"
              label="Short introduction"
              required
              description="A sentence or two for the class directory."
              maxLength={500}
            >
              {(field) => <TextareaBinding {...field} rows={2} />}
            </FormField>
            <FormField
              name="description"
              label="About the class"
              description="Use formatted paragraphs, lists and links to explain what to expect."
            >
              {(field) => <RichTextBinding {...field} maxLength={4000} minRows={5} />}
            </FormField>
          </FormSection>
          <FormSection
            title="Images"
            surface="card"
            description="Choose from your generated Higgsfield artwork."
          >
            <FormField name="heroImage" label="Cover image" optional>
              {(field) => (
                <ClassImagesInput
                  {...field}
                  multiple={false}
                  value={field.value ? [String(field.value)] : []}
                  onChange={(images) => field.onChange(images[0] ?? "")}
                />
              )}
            </FormField>
            <FormField
              name="galleryImages"
              label="Class gallery"
              optional
              description="Visitors can browse these images full-screen and zoom in."
            >
              {(field) => <ClassImagesInput {...field} value={field.value as string[]} />}
            </FormField>
          </FormSection>
          <FormSection
            title="Assigned coaches"
            surface="card"
            description="The teaching team displayed on this class page. Session assignments remain separate."
          >
            <Input
              aria-label="Search coaches"
              placeholder="Search coaches…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              {values.coachIds.length} selected · Classes may have multiple coaches.
            </p>
            <div className="max-h-72 overflow-y-auto">
              <FormField name="coachIds" label="Teaching team" optional>
                {(field) => (
                  <CheckboxGroupBinding
                    {...field}
                    options={coaches
                      .filter(
                        (coach) =>
                          (coach.active || values.coachIds.includes(coach.id)) &&
                          coach.name.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((coach) => ({
                        value: coach.id,
                        label: coach.name,
                        description: coach.specialties.join(" · "),
                      }))}
                  />
                )}
              </FormField>
            </div>
          </FormSection>
        </div>
        <aside className="min-w-0 space-y-6">
          <FormSection title="Page address" surface="card">
            <FormField
              name="slug"
              label="URL slug"
              description="Generated from the class name. Keep it stable after publishing."
            >
              {(field) => <TextBinding {...field} placeholder="mat-pilates" />}
            </FormField>
            <p className="break-all text-xs text-muted-foreground">
              {site + classPageHref({ slug: values.slug || "your-class" })}
            </p>
            <FormField name="pageMode" label="Page design">
              {(field) => (
                <select
                  name={field.name}
                  value={String(field.value)}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  aria-label="Page design"
                >
                  <option value="standard">Standard class layout</option>
                  <option value="redirect">Redirect to a custom page</option>
                </select>
              )}
            </FormField>
            {values.pageMode === "redirect" ? (
              <FormField
                name="customPageUrl"
                label="Custom page URL"
                description="An HTTPS URL or local path. The normal class URL redirects here."
              >
                {(field) => <TextBinding {...field} placeholder="/experiences/pilates" />}
              </FormField>
            ) : (
              <p className="text-sm text-muted-foreground">
                Includes a hero, coaches, rich-text introduction, gallery, class rate and booking
                section.
              </p>
            )}
          </FormSection>
          <FormSection
            title="Session defaults"
            surface="card"
            description="Individual sessions can override these values."
          >
            <FormField name="defaultDurationMinutes" label="Duration (minutes)" optional>
              {(field) => <TextBinding {...field} type="number" />}
            </FormField>
            <FormField name="defaultPricePhp" label="Class price (PHP)" optional>
              {(field) => <TextBinding {...field} type="number" />}
            </FormField>
            <p className="text-xs text-muted-foreground">
              This is the customer class rate. Coach compensation is never displayed on the website.
            </p>
          </FormSection>
          <FormSection title="Visibility" surface="card">
            <FormField name="active" label="Published" orientation="horizontal">
              {(field) => <BooleanBinding {...field} as="switch" />}
            </FormField>
            <p className="text-sm text-muted-foreground">
              {values.active
                ? "Visible in the public class directory."
                : "Saved as a draft; hidden from the public directory."}
            </p>
          </FormSection>
        </aside>
      </div>
      <FormActions
        submitLabel={values.active ? "Save and publish" : "Save draft"}
        cancelHref="/classes"
        guard={guard}
        hideSubmit={!canSave}
      >
        {!canSave ? (
          <span className="text-sm text-muted-foreground">
            Sign in above to save to the database.
          </span>
        ) : null}
      </FormActions>
    </>
  );
}
