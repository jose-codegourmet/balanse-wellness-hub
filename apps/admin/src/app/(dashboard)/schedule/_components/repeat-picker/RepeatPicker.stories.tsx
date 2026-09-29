import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { RepeatPicker } from "./RepeatPicker";
import type { RepeatPickerProps, RepeatValue } from "./RepeatPicker.meta";

function Harness(props: Omit<RepeatPickerProps, "onChange">) {
  const [value, setValue] = useState<RepeatValue>(props.value);
  return <RepeatPicker {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: "Admin/Screens/Schedule/Repeat picker",
  component: Harness,
  tags: ["autodocs"],
  args: {
    anchorYmd: "2026-09-16",
    today: "2026-09-16",
    value: { mode: "none", weekdays: [], endsOn: "" },
  },
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DoesNotRepeat: Story = {};

export const WeeklySameDay: Story = {
  args: { value: { mode: "weekly", weekdays: [3], endsOn: "2026-11-10" } },
};

export const CustomDays: Story = {
  args: { value: { mode: "weekly", weekdays: [1, 3, 5], endsOn: "2026-12-08" } },
};

export const AlwaysRepeats: Story = {
  args: { allowNone: false, value: { mode: "weekly", weekdays: [3], endsOn: "2026-10-13" } },
};

export const WithErrors: Story = {
  args: {
    value: { mode: "weekly", weekdays: [], endsOn: "" },
    errors: { weekdays: "Choose at least one day.", endsOn: "Choose when the series ends." },
  },
};
