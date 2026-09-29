import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { EventSessionPicker } from "./EventSessionPicker";
import type { EventSessionPickerProps } from "./EventSessionPicker.meta";
import { eventSessionPickerChoices } from "./EventSessionPicker.stories-data";

function Harness(props: Omit<EventSessionPickerProps, "onChange">) {
  const [value, setValue] = useState(props.value);
  return <EventSessionPicker {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: "Admin/Screens/Event form/Session picker",
  component: Harness,
  tags: ["autodocs"],
  args: { choices: eventSessionPickerChoices, value: "" },
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Selected: Story = { args: { value: "session-a" } };

export const ShowingUnavailable: Story = { args: { defaultShowUnavailable: true } };

export const NoChoices: Story = { args: { choices: [] } };
