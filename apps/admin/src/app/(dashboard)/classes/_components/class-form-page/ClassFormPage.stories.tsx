import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { classFormDefaultValues } from "@/modules/admin/forms/class/class-form.defaults";
import { classFormSchema } from "@/modules/admin/forms/class/class-form.schema";
import { ClassFormPage } from "./ClassFormPage";
import { classFormPageDefaultValues } from "./ClassFormPage.defaults";

const meta = {
  title: "Admin/Screens/ClassForm",
  component: ClassFormPage,
  tags: ["autodocs"],
  args: { ...classFormPageDefaultValues },
  parameters: {
    classFormDefaultValues,
    classFormSchema,
  },
} satisfies Meta<typeof ClassFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = { args: { classId: "new" } };

export const EditPrefilled: Story = {
  args: { classId: "class-yoga" },
};

/** Empty required fields — submit or Continue to see FieldError + summary. */
export const Invalid: Story = {
  args: { classId: "new" },
};

export const Submitting: Story = {
  args: { classId: "class-yoga" },
  parameters: { mockRuntime: { latencyMs: 10_000 } },
};

export const SubmitFailure: Story = {
  args: { classId: "class-yoga" },
  parameters: { mockRuntime: { failNext: true } },
};

export const MobileFullPage: Story = {
  args: { classId: "new" },
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const Dark: Story = {
  args: { classId: "class-yoga" },
  globals: { theme: "dark" },
};
