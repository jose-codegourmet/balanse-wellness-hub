import { Input } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";
import { AdminForm, FormActions, FormField } from "@/modules/admin/forms/AdminForm";
import { adminFormDemoSchema, adminFormDemoValues } from "@/modules/admin/forms/AdminForm.defaults";
import { AdminWizard, AdminWizardStepPanel } from "./AdminWizard";
import { adminWizardDefaultValues, adminWizardSteps } from "./AdminWizard.defaults";

const meta = {
  title: "Admin/Components/AdminWizard",
  component: AdminWizard,
  tags: ["autodocs"],
  args: {
    ...adminWizardDefaultValues,
  },
} satisfies Meta<typeof AdminWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

function DemoWizard(props: Partial<ComponentProps<typeof AdminWizard>>) {
  return (
    <AdminForm
      schema={adminFormDemoSchema}
      defaultValues={adminFormDemoValues}
      onSubmit={async () => undefined}
    >
      <AdminWizard
        {...adminWizardDefaultValues}
        {...props}
        steps={adminWizardSteps}
        title={props.title ?? adminWizardDefaultValues.title ?? "Create item"}
        footer={
          <FormActions submitLabel="Save" cancelHref="/classes">
            <span className="sr-only">Wizard actions</span>
          </FormActions>
        }
      >
        <AdminWizardStepPanel stepId="basics">
          <FormField name="name" label="Name">
            {(field) => <Input {...field} value={String(field.value ?? "")} />}
          </FormField>
        </AdminWizardStepPanel>
        <AdminWizardStepPanel stepId="defaults">
          <FormField name="notes" label="Notes">
            {(field) => <Input {...field} value={String(field.value ?? "")} />}
          </FormField>
        </AdminWizardStepPanel>
        <AdminWizardStepPanel stepId="review">
          <p className="text-sm text-muted-foreground">Ready to save.</p>
        </AdminWizardStepPanel>
      </AdminWizard>
    </AdminForm>
  );
}

export const PageCreate: Story = {
  render: (args) => <DemoWizard {...args} surface="page" mode="create" />,
};

export const PageEdit: Story = {
  render: (args) => <DemoWizard {...args} surface="page" mode="edit" />,
};

export const OverlayDesktop: Story = {
  parameters: { viewport: { defaultViewport: "desktop" } },
  render: (args) => <DemoWizard {...args} surface="overlay" layout="step" />,
};

export const OverlayMobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile" } },
  render: (args) => <DemoWizard {...args} surface="overlay" layout="stack" />,
};

export const Dark: Story = {
  globals: { theme: "dark" },
  render: (args) => <DemoWizard {...args} />,
};
