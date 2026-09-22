import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DuplicateScheduleForm } from "./DuplicateScheduleForm";
import { duplicateScheduleFormDefaultValues } from "./DuplicateScheduleForm.defaults";
import { duplicateScheduleFormSchema } from "./DuplicateScheduleForm.schema";

const meta = {
  title: "Admin/Screens/DuplicateScheduleForm",
  component: DuplicateScheduleForm,
  tags: ["autodocs"],
  args: { sourceStart: "2026-09-21", sourceEnd: "2026-09-27" },
  parameters: {
    duplicateScheduleFormDefaultValues: duplicateScheduleFormDefaultValues("2026-09-21"),
    duplicateScheduleFormSchema,
  },
} satisfies Meta<typeof DuplicateScheduleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile" } } };
