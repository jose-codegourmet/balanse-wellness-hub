import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { classFormDefaultValues } from "../forms/class/class-form.defaults";
import { classFormSchema } from "../forms/class/class-form.schema";
import { ClassFormPage } from "./ClassFormPage";

const meta = {
  title: "Admin/Screens/ClassForm",
  component: ClassFormPage,
  tags: ["autodocs"],
  args: {
    classId: "new",
    surface: "page",
  },
  parameters: {
    classFormDefaultValues,
    classFormSchema,
  },
} satisfies Meta<typeof ClassFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateStep1: Story = {
  args: { classId: "new", step: 1 },
};

export const CreateStep2: Story = {
  args: { classId: "new", step: 2 },
};

export const CreateStep3: Story = {
  args: { classId: "new", step: 3 },
};

export const EditPrefilled: Story = {
  args: { classId: "class-yoga", step: 1 },
};

/** Empty required fields — submit or Continue to see FieldError + summary. */
export const Invalid: Story = {
  args: { classId: "new", step: 1 },
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
  args: { classId: "new", surface: "page" },
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const OverlayDesktop: Story = {
  args: { classId: "new", surface: "overlay" },
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const Dark: Story = {
  args: { classId: "class-yoga" },
  globals: { theme: "dark" },
};
