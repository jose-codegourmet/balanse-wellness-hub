import type { FormEvent, HTMLAttributes } from "react";

export interface AgencyContactFormValues {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  brief: string;
}

export interface AgencyContactFormSelectOption {
  value: string;
  label: string;
}

export interface AgencyContactFormProps
  extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  nameLabel?: string;
  emailLabel?: string;
  projectTypeLabel?: string;
  budgetLabel?: string;
  briefLabel?: string;
  briefPlaceholder?: string;
  requiredLabel?: string;
  selectLabel?: string;
  submitLabel?: string;
  sendingLabel?: string;
  successLabel?: string;
  projectTypes?: AgencyContactFormSelectOption[];
  budgets?: AgencyContactFormSelectOption[];
  defaultValues?: Partial<AgencyContactFormValues>;
  onSubmit?: (values: AgencyContactFormValues) => void | Promise<void>;
  onInvalidField?: (field: keyof AgencyContactFormValues) => void;
  onFormSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}
