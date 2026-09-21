import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsFilterForm } from "./ReportsFilterForm";

const meta: Meta<typeof ReportsFilterForm> = {
  title: "Admin/Reports filter form",
  component: ReportsFilterForm,
  tags: ["autodocs"],
  args: {
    classes: [{ id: "class-yoga", name: "Yoga" }],
    coachFilterOptions: [{ value: "all", label: "All coaches" }],
    selectedCoachFilter: { value: "all", label: "All coaches" },
    classId: "all",
    coachId: "all",
    sessionStatus: "all",
    onClassChange: () => undefined,
    onCoachChange: () => undefined,
    onStatusChange: () => undefined,
  },
};
export default meta;
export const Default: StoryObj<typeof meta> = {};
