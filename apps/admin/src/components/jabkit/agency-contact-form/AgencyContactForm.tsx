"use client";

import { type FormEvent, useId, useRef, useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import { agencyBudgets, agencyProjectTypes } from "./AgencyContactForm.mocks";
import type {
  AgencyContactFormProps,
  AgencyContactFormValues,
} from "./AgencyContactForm.types";

const defaults = {
  nameLabel: "Name",
  emailLabel: "Email",
  projectTypeLabel: "Project type",
  budgetLabel: "Budget",
  briefLabel: "Brief",
  briefPlaceholder: "What are you working on?",
  requiredLabel: "Required",
  selectLabel: "Select",
  submitLabel: "Send message",
  sendingLabel: "Sending",
  successLabel: "Sent",
} as const;

type FieldKey = keyof AgencyContactFormValues;

const emptyValues: AgencyContactFormValues = {
  name: "",
  email: "",
  projectType: "",
  budget: "",
  brief: "",
};

function isValidEmail(value: string) {
  return value.includes("@") && value.split("@")[1]?.length > 0;
}

export function AgencyContactForm({
  className,
  nameLabel = defaults.nameLabel,
  emailLabel = defaults.emailLabel,
  projectTypeLabel = defaults.projectTypeLabel,
  budgetLabel = defaults.budgetLabel,
  briefLabel = defaults.briefLabel,
  briefPlaceholder = defaults.briefPlaceholder,
  requiredLabel = defaults.requiredLabel,
  selectLabel = defaults.selectLabel,
  submitLabel = defaults.submitLabel,
  sendingLabel = defaults.sendingLabel,
  successLabel = defaults.successLabel,
  projectTypes = [...agencyProjectTypes],
  budgets = [...agencyBudgets],
  defaultValues,
  onSubmit,
  onInvalidField,
  onFormSubmit,
  ...props
}: AgencyContactFormProps) {
  const formId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const projectRef = useRef<HTMLSelectElement>(null);
  const budgetRef = useRef<HTMLSelectElement>(null);
  const [values, setValues] = useState<AgencyContactFormValues>({
    ...emptyValues,
    ...defaultValues,
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );
  const [banner, setBanner] = useState<string | null>(null);

  const fieldClass = (key: FieldKey) =>
    cn(
      "w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors duration-200 placeholder:text-muted-foreground motion-reduce:transition-none",
      errors[key]
        ? "border-warning focus:border-warning"
        : "border-foreground focus:border-warning",
    );

  const validate = (next: AgencyContactFormValues) => {
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    if (!next.name.trim()) {
      nextErrors.name = "Please fill out this field.";
    }
    if (!next.email.trim()) {
      nextErrors.email = "Please fill out this field.";
    } else if (!isValidEmail(next.email.trim())) {
      nextErrors.email = `Please include an '@' in the email address. '${next.email}' is missing an '@'.`;
    }
    if (!next.projectType) {
      nextErrors.projectType = "Please fill out this field.";
    }
    if (!next.budget) {
      nextErrors.budget = "Please fill out this field.";
    }
    return nextErrors;
  };

  const focusFirst = (nextErrors: Partial<Record<FieldKey, string>>) => {
    const order = ["name", "email", "projectType", "budget"] as const;
    const first = order.find((key) => nextErrors[key]);
    if (!first) return;
    onInvalidField?.(first);
    const map = {
      name: nameRef,
      email: emailRef,
      projectType: projectRef,
      budget: budgetRef,
    } as const;
    map[first].current?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onFormSubmit?.(event);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setBanner(null);
    if (Object.keys(nextErrors).length) {
      setStatus("idle");
      focusFirst(nextErrors);
      return;
    }
    setStatus("sending");
    try {
      await onSubmit?.(values);
      setStatus("sent");
    } catch {
      setStatus("failed");
      setBanner("Failed to send. Try again or write us directly.");
    }
  };

  const fieldLabel = (
    index: string,
    text: string,
    hint: string,
    htmlFor: string,
  ) => (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-baseline justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
    >
      <span>
        <span className="text-foreground">[{index}]</span> {text}
      </span>
      <span>{hint}</span>
    </label>
  );

  return (
    <form
      data-slot="agency-contact-form"
      className={cn("bg-background text-foreground", className)}
      noValidate
      onSubmit={handleSubmit}
      {...props}
    >
      {banner ? (
        <p
          role="alert"
          className="mb-6 border border-destructive px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-destructive"
        >
          {banner}
        </p>
      ) : null}
      {status === "sent" ? (
        <p
          role="status"
          className="mb-6 border border-success px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-success"
        >
          {successLabel}
        </p>
      ) : null}
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {fieldLabel("01", nameLabel, requiredLabel, `${formId}-name`)}
          <input
            ref={nameRef}
            id={`${formId}-name`}
            name="name"
            autoComplete="name"
            value={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            className={fieldClass("name")}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
          />
          {errors.name ? (
            <p
              id={`${formId}-name-error`}
              className="mt-2 font-mono text-[11px] text-warning"
            >
              {errors.name}
            </p>
          ) : null}
        </div>
        <div>
          {fieldLabel("02", emailLabel, requiredLabel, `${formId}-email`)}
          <input
            ref={emailRef}
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? `${formId}-email-error` : undefined
            }
            className={fieldClass("email")}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />
          {errors.email ? (
            <p
              id={`${formId}-email-error`}
              className="mt-2 font-mono text-[11px] text-warning"
            >
              {errors.email}
            </p>
          ) : null}
        </div>
        <div>
          {fieldLabel(
            "03",
            projectTypeLabel,
            `${requiredLabel} / ${selectLabel}`,
            `${formId}-project`,
          )}
          <select
            ref={projectRef}
            id={`${formId}-project`}
            name="projectType"
            value={values.projectType}
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={
              errors.projectType ? `${formId}-project-error` : undefined
            }
            className={cn(fieldClass("projectType"), "appearance-none")}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                projectType: event.target.value,
              }))
            }
          >
            {projectTypes.map((option) => (
              <option
                key={`${option.value}-${option.label}`}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
          {errors.projectType ? (
            <p
              id={`${formId}-project-error`}
              className="mt-2 font-mono text-[11px] text-warning"
            >
              {errors.projectType}
            </p>
          ) : null}
        </div>
        <div>
          {fieldLabel(
            "04",
            budgetLabel,
            `${requiredLabel} / ${selectLabel}`,
            `${formId}-budget`,
          )}
          <select
            ref={budgetRef}
            id={`${formId}-budget`}
            name="budget"
            value={values.budget}
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={
              errors.budget ? `${formId}-budget-error` : undefined
            }
            className={cn(fieldClass("budget"), "appearance-none")}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                budget: event.target.value,
              }))
            }
          >
            {budgets.map((option) => (
              <option
                key={`${option.value}-${option.label}`}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
          {errors.budget ? (
            <p
              id={`${formId}-budget-error`}
              className="mt-2 font-mono text-[11px] text-warning"
            >
              {errors.budget}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-8">
        {fieldLabel("05", briefLabel, "Optional", `${formId}-brief`)}
        <textarea
          id={`${formId}-brief`}
          name="brief"
          rows={6}
          placeholder={briefPlaceholder}
          value={values.brief}
          className={cn(fieldClass("brief"), "min-h-40 resize-y")}
          onChange={(event) =>
            setValues((current) => ({ ...current, brief: event.target.value }))
          }
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-8 inline-flex items-center gap-3 rounded-none bg-foreground px-6 py-3 font-mono text-[11px] tracking-[0.16em] text-background uppercase transition-[transform,background-color] duration-300 hover:bg-warning hover:text-warning-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70 motion-reduce:transition-none"
      >
        {status === "sending" ? sendingLabel : submitLabel}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
