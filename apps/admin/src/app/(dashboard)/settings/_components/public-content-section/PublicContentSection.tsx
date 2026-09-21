"use client";

import { type AdminSettings, FIELD_CONSTRAINTS } from "@balanse/domain";
import { Button } from "@balanse/ui";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CircleHelp,
  ExternalLink,
  FileText,
  Globe2,
  GripVertical,
  Mail,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useFieldArray } from "react-hook-form";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { useUpdateAdminSettings } from "@/lib/query/mutations";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import { RichTextBinding, TextBinding } from "@/modules/admin/forms/bindings";
import { publicContentFormDefaultValues } from "@/modules/admin/forms/settings/settings-form.defaults";
import {
  type PublicContentFormValues,
  publicContentFormSchema,
} from "@/modules/admin/forms/settings/settings-form.schema";
import { notify } from "@/modules/notifications/notify";
import { DirtyBridge } from "../dirty-bridge/DirtyBridge";

export function valuesFromPublicSettings(
  settings: AdminSettings,
  faqsOverride?: AdminSettings["faqs"],
): PublicContentFormValues {
  return {
    about: settings.about,
    contact: { email: settings.contact.email },
    faqs: (faqsOverride ?? settings.faqs).map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
    })),
  };
}

const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL ?? "http://localhost:9000";

function FaqListEditor() {
  const { control } = useAdminFormContext<PublicContentFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "faqs",
    keyName: "fieldKey",
  });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Question library
          </p>
          <h3 className="mt-1 font-display text-2xl">{fields.length} public FAQs</h3>
        </div>
        <Button
          type="button"
          disabled={fields.length >= FIELD_CONSTRAINTS.settings.faq.maxItems}
          onClick={() =>
            append({
              id: `faq-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
              question: "",
              answer: "",
            })
          }
        >
          <Plus className="size-4" aria-hidden />
          Add FAQ
        </Button>
      </div>
      {fields.length === 0 ? (
        <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-muted/25 p-8 text-center">
          <div>
            <CircleHelp className="mx-auto size-8 text-primary/70" aria-hidden />
            <p className="mt-3 font-medium">No questions published yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the first answer customers need before booking.
            </p>
          </div>
        </div>
      ) : (
        <ol className="grid gap-3">
          {fields.map((field, index) => (
            <li
              key={field.fieldKey}
              className="group grid gap-4 rounded-2xl border border-border/70 bg-background p-4 shadow-[0_12px_28px_-26px_color-mix(in_oklab,var(--foreground)_45%,transparent)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_38px_-28px_color-mix(in_oklab,var(--primary)_55%,transparent)] md:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="size-4 text-muted-foreground/60" aria-hidden />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Question {String(index + 1).padStart(2, "0")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label={`Move question ${index + 1} up`}
                  >
                    <ArrowUp className="size-4" aria-hidden />
                    <span className="sr-only sm:not-sr-only">Move up</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label={`Move question ${index + 1} down`}
                  >
                    <ArrowDown className="size-4" aria-hidden />
                    <span className="sr-only sm:not-sr-only">Move down</span>
                  </Button>
                  <ConfirmAction
                    triggerLabel="Remove"
                    title="Remove this FAQ?"
                    description="This question is public site content. Removing it here marks the list dirty until you save public content."
                    confirmLabel="Remove FAQ"
                    variant="destructive"
                    onConfirm={() => remove(index)}
                  />
                </div>
              </div>
              <FormField name={`faqs.${index}.question`} label="Question">
                {(props) => <TextBinding {...props} />}
              </FormField>
              <FormField name={`faqs.${index}.answer`} label="Answer" wireAria>
                {(props) => (
                  <RichTextBinding
                    {...props}
                    maxLength={FIELD_CONSTRAINTS.settings.faq.answer.max}
                  />
                )}
              </FormField>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ContentOverview({ settings }: { settings: AdminSettings }) {
  const pages = [
    {
      title: "About page",
      description: "Tell the studio story, set the tone, and explain the Balansé approach.",
      metric: `${settings.about.length.toLocaleString()} characters`,
      href: "/settings/content/about-page",
      liveHref: `${marketingUrl}/about`,
      icon: FileText,
      className: "md:col-span-2",
    },
    {
      title: "Contact details",
      description: "Keep the public support path clear and easy to find.",
      metric: settings.contact.email,
      href: "/settings/content/contact",
      liveHref: `${marketingUrl}/contact`,
      icon: Mail,
      className: "",
    },
    {
      title: "Frequently asked questions",
      description:
        "Answer booking, payment, waitlist, and studio questions before they become messages.",
      metric: `${settings.faqs.length} published answers`,
      href: "/settings/content/faqs",
      liveHref: `${marketingUrl}/faqs`,
      icon: CircleHelp,
      className: "md:col-span-3",
    },
  ];

  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-primary px-6 py-7 text-primary-foreground shadow-[0_28px_70px_-46px_color-mix(in_oklab,var(--primary)_90%,black)] md:px-8 md:py-9">
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-primary-foreground/10" />
        <div className="pointer-events-none absolute -right-5 -top-8 size-40 rounded-full bg-primary-foreground/[0.04]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/65">
              <Globe2 className="size-4" aria-hidden />
              Public website
            </div>
            <h2 className="mt-4 max-w-xl text-balance font-display text-3xl leading-tight md:text-4xl">
              Keep every customer-facing detail in one calm, considered place.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/70 md:text-base">
              Choose a page below to edit. Each page saves independently, so unfinished copy never
              gets in the way of another update.
            </p>
          </div>
          <a
            href={marketingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
          >
            View public site
            <ExternalLink className="size-4" aria-hidden />
          </a>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <article
              key={page.title}
              className={`${page.className} group relative flex min-h-56 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-[0_16px_40px_-34px_color-mix(in_oklab,var(--foreground)_50%,transparent)] transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_54px_-36px_color-mix(in_oklab,var(--primary)_55%,transparent)] md:p-6`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <a
                  href={page.liveHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Live page
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </div>
              <div className="mt-6 max-w-xl">
                <h3 className="font-display text-2xl">{page.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{page.description}</p>
              </div>
              <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
                <p className="max-w-[70%] truncate text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                  {page.metric}
                </p>
                <Link
                  href={page.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Edit page
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function EditorIntro({
  page,
  title,
  description,
  href,
}: {
  page: "about" | "contact" | "faqs";
  title: string;
  description: string;
  href: string;
}) {
  const Icon = page === "about" ? FileText : page === "contact" ? Mail : CircleHelp;
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border/70 bg-card px-5 py-6 md:px-7">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_100%_0%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_70%)]" />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex max-w-2xl gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Public page editor
            </p>
            <h2 className="mt-1 font-display text-2xl md:text-3xl">{title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View live page
          <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>
    </header>
  );
}

export function PublicContentSection({
  settings,
  empty = false,
  faqsOverride,
  onDirtyChange,
  onSaved,
  page = "all",
}: {
  settings: AdminSettings;
  empty?: boolean;
  faqsOverride?: AdminSettings["faqs"];
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
  page?: "all" | "about" | "contact" | "faqs";
}) {
  const update = useUpdateAdminSettings();
  if (page === "all") return <ContentOverview settings={settings} />;

  const defaultValues = empty
    ? publicContentFormDefaultValues
    : valuesFromPublicSettings(settings, faqsOverride);

  return (
    <AdminForm
      id="settings-content-form"
      schema={publicContentFormSchema}
      defaultValues={defaultValues}
      onSubmit={async (values) => {
        try {
          const patch: Partial<AdminSettings> =
            page === "about"
              ? { about: values.about }
              : page === "contact"
                ? {
                    contact: {
                      ...settings.contact,
                      email: values.contact.email,
                    },
                  }
                : { faqs: values.faqs };
          await update.mutateAsync(patch);
          notify.admin("settings.saved");
          onSaved?.();
        } catch (error) {
          notify.admin("settings.save-failed");
          throw error;
        }
      }}
    >
      <DirtyBridge onDirtyChange={onDirtyChange} />
      <div className="grid gap-5">
        <EditorIntro
          page={page}
          title={
            page === "about"
              ? "About page"
              : page === "contact"
                ? "Contact details"
                : "Frequently asked questions"
          }
          description={
            page === "about"
              ? "Write the story that introduces Balansé before a customer ever walks through the door."
              : page === "contact"
                ? "Give customers one dependable route for questions about classes, bookings, and visits."
                : "Keep answers useful, concise, and ordered by what customers ask most often."
          }
          href={`${marketingUrl}/${page === "faqs" ? "faqs" : page}`}
        />

        {page === "about" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <FormSection
              title="Studio story"
              description="This copy is rendered as rich text on the public About page."
              surface="card"
            >
              <FormField name="about" label="About Balansé" wireAria>
                {(field) => (
                  <RichTextBinding {...field} maxLength={FIELD_CONSTRAINTS.settings.about.max} />
                )}
              </FormField>
            </FormSection>
            <aside className="rounded-2xl bg-primary/[0.055] p-5 lg:sticky lg:top-20">
              <Sparkles className="size-5 text-primary" aria-hidden />
              <h3 className="mt-4 font-display text-xl">A useful story has rhythm</h3>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
                <li>Begin with what customers can expect to feel here.</li>
                <li>Explain the mix of movement, recovery, and education.</li>
                <li>End with a clear invitation, not a hard sell.</li>
              </ul>
            </aside>
          </div>
        ) : null}

        {page === "contact" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <FormSection
              title="Public inbox"
              description="Use an address the studio team checks consistently."
              surface="card"
            >
              <FormField
                name="contact.email"
                label="Public contact email"
                description="Shown on the public site. Distinct from the operational studio phone."
              >
                {(field) => <TextBinding {...field} type="email" />}
              </FormField>
            </FormSection>
            <aside className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <div className="bg-primary px-5 py-6 text-primary-foreground">
                <Mail className="size-5" aria-hidden />
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/60">
                  Customer view
                </p>
                <h3 className="mt-1 font-display text-2xl">Let’s talk.</h3>
              </div>
              <div className="p-5 text-sm leading-6 text-muted-foreground">
                Customers use this address when they need help before or after a booking. Keep it
                monitored during studio hours.
              </div>
            </aside>
          </div>
        ) : null}

        {page === "faqs" ? (
          <section className="rounded-2xl border border-border/70 bg-card p-4 md:p-6">
            <FaqListEditor />
          </section>
        ) : null}

        <FormActions submitLabel={page === "faqs" ? "Save FAQs" : `Save ${page} page`} />
      </div>
    </AdminForm>
  );
}
