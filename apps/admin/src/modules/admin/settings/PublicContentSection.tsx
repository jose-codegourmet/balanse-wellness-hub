"use client";

import { type AdminSettings, FIELD_CONSTRAINTS } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { useFieldArray } from "react-hook-form";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { useUpdateAdminSettings } from "@/lib/query/mutations";
import { notify } from "@/modules/notifications/notify";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "../forms/AdminForm";
import { RichTextBinding, TextBinding } from "../forms/bindings";
import { publicContentFormDefaultValues } from "../forms/settings/settings-form.defaults";
import {
  type PublicContentFormValues,
  publicContentFormSchema,
} from "../forms/settings/settings-form.schema";
import { DirtyBridge } from "./DirtyBridge";

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

function FaqListEditor() {
  const { control } = useAdminFormContext<PublicContentFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "faqs",
    keyName: "fieldKey",
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg">FAQs</h3>
        <Button
          type="button"
          variant="outline"
          disabled={fields.length >= FIELD_CONSTRAINTS.settings.faq.maxItems}
          onClick={() =>
            append({
              id: `faq-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
              question: "",
              answer: "",
            })
          }
        >
          Add FAQ
        </Button>
      </div>
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No FAQs yet. Add one to publish it on the site.
        </p>
      ) : (
        <ol className="grid gap-4">
          {fields.map((field, index) => (
            <li key={field.fieldKey} className="grid gap-3 rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">FAQ {index + 1}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    Move up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    Move down
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
          await update.mutateAsync({
            about: values.about,
            contact: {
              ...settings.contact,
              email: values.contact.email,
            },
            faqs: values.faqs,
          });
          notify.admin("settings.saved");
          onSaved?.();
        } catch (error) {
          notify.admin("settings.save-failed");
          throw error;
        }
      }}
    >
      <DirtyBridge onDirtyChange={onDirtyChange} />
      <FormSection
        title={
          page === "all"
            ? "Public content"
            : page === "about"
              ? "About page"
              : page === "contact"
                ? "Contact details"
                : "FAQs"
        }
        description="Copy that appears on the public site. Saving here does not rewrite payment or business fields."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {page === "all" || page === "about" ? (
            <FormField name="about" label="About" wireAria>
              {(field) => (
                <RichTextBinding {...field} maxLength={FIELD_CONSTRAINTS.settings.about.max} />
              )}
            </FormField>
          ) : null}
          {page === "all" || page === "contact" ? (
            <FormField
              name="contact.email"
              label="Public contact email"
              description="Shown on the public site. Distinct from the operational studio phone."
            >
              {(field) => <TextBinding {...field} type="email" />}
            </FormField>
          ) : null}
        </div>
        {page === "all" || page === "faqs" ? <FaqListEditor /> : null}
      </FormSection>
      <FormActions submitLabel="Save public content" />
    </AdminForm>
  );
}
