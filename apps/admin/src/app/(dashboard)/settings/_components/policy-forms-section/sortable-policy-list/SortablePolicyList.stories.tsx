import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { SortablePolicyList } from "./SortablePolicyList";

const options = [
  { value: "Waiver", label: "Waiver", description: "Customers accept version 2026-01." },
  { value: "Gym Policy", label: "Gym Policy", description: "Customers accept version 2026-01." },
  {
    value: "Privacy Notice",
    label: "Privacy Notice",
    description: "Customers accept version 2026-03.",
  },
];

function Demo({ initial }: { initial: string[] }) {
  const [value, setValue] = useState<unknown>(initial);
  return (
    <SortablePolicyList
      name="booking"
      formLabel="Class booking"
      options={options}
      value={value}
      onChange={(next) => setValue(next)}
      onBlur={() => {}}
      ref={() => {}}
    />
  );
}

const meta = {
  title: "Admin/Components/SortablePolicyList",
  component: Demo,
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Drag rows by the handle, or use the arrow buttons. */
export const Attached: Story = { args: { initial: ["Waiver", "Gym Policy"] } };

export const Empty: Story = { args: { initial: [] } };
