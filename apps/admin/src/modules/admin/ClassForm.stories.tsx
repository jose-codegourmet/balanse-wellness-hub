import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ClassFormPage } from "./ClassPages";
import { classFormDefaultValues } from "./forms/class/class-form.defaults";

const meta = {
  title: "Admin/Screens/ClassForm",
  component: ClassFormPage,
  tags: ["autodocs"],
  args: {
    classId: "new",
  },
  parameters: {
    classFormDefaultValues,
  },
} satisfies Meta<typeof ClassFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { classId: "new" },
};

export const Prefilled: Story = {
  args: { classId: "class-yoga" },
};

export const Invalid: Story = {
  args: { classId: "new" },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector("form")?.requestSubmit();
  },
};

export const Submitting: Story = {
  args: { classId: "class-yoga" },
  parameters: { mockRuntime: { latencyMs: 10_000 } },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector("form")?.requestSubmit();
  },
};
