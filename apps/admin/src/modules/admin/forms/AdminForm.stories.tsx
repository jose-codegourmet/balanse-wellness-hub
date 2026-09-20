import { Input } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect } from "react";
import { AdminForm, FormActions, FormField, FormSection, useAdminFormContext } from "./AdminForm";
import {
  adminFormDefaultValues,
  adminFormDemoSchema,
  adminFormDemoValues,
} from "./AdminForm.defaults";

const meta: Meta<typeof AdminForm> = {
  title: "Admin/Components/Form/AdminForm",
  component: AdminForm,
  tags: ["autodocs"],
  args: {
    ...adminFormDefaultValues,
    onSubmit: async () => undefined,
    children: null,
  },
};

export default meta;
type Story = StoryObj<typeof AdminForm>;

function DemoFields() {
  return (
    <>
      <FormField name="name" label="Name">
        {(field) => <Input {...field} value={String(field.value ?? "")} />}
      </FormField>
      <FormField name="notes" label="Notes" description="Optional internal note.">
        {(field) => <Input {...field} value={String(field.value ?? "")} />}
      </FormField>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <AdminForm
      schema={adminFormDemoSchema}
      defaultValues={adminFormDemoValues}
      onSubmit={async () => undefined}
    >
      <DemoFields />
      <FormActions submitLabel="Save" />
    </AdminForm>
  ),
};

export const WithSections: Story = {
  render: () => (
    <AdminForm
      schema={adminFormDemoSchema}
      defaultValues={adminFormDemoValues}
      onSubmit={async () => undefined}
    >
      <FormSection title="Basics" description="Required identity.">
        <DemoFields />
      </FormSection>
      <FormActions submitLabel="Save" cancelHref="/classes" />
    </AdminForm>
  ),
};

function AutoSubmit() {
  useEffect(() => {
    document.querySelector("form")?.requestSubmit();
  }, []);
  return null;
}

export const Submitting: Story = {
  render: () => (
    <AdminForm
      schema={adminFormDemoSchema}
      defaultValues={{ name: "Vinyasa", notes: "" }}
      onSubmit={() => new Promise(() => undefined)}
    >
      <DemoFields />
      <FormActions submitLabel="Save" />
      <AutoSubmit />
    </AdminForm>
  ),
};

function RootErrorProbe() {
  const { setError } = useAdminFormContext();
  useEffect(() => {
    setError("root", { type: "root", message: "Mocked request failed. The write was not stored." });
  }, [setError]);
  return null;
}

export const FormLevelRootError: Story = {
  render: () => (
    <AdminForm
      schema={adminFormDemoSchema}
      defaultValues={adminFormDemoValues}
      onSubmit={async () => undefined}
    >
      <DemoFields />
      <RootErrorProbe />
      <FormActions submitLabel="Save" />
    </AdminForm>
  ),
};
