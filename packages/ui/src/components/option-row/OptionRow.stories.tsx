import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar, AvatarFallback } from "../avatar/Avatar";
import { OptionRow } from "./OptionRow";
import { optionRowDefaultValues } from "./OptionRow.defaults";

function LeadingMark({ initials }: { initials: string }) {
  return (
    <Avatar size="sm" className="size-7">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

const meta: Meta<typeof OptionRow> = {
  title: "Components/OptionRow",
  component: OptionRow,
  tags: ["autodocs"],
  args: {
    ...optionRowDefaultValues,
    leading: <LeadingMark initials="MS" />,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CompactTrigger: Story = {
  args: {
    compact: true,
  },
};

export const PlainLabel: Story = {
  args: {
    leading: undefined,
    description: undefined,
    reserveLeading: false,
    label: "Reformer Flow",
  },
};

export const LightAndDark: Story = {
  render: (args) => (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-background p-4">
        <OptionRow {...args} />
      </div>
      <div className="dark rounded-lg border border-border bg-background p-4 text-foreground">
        <OptionRow {...args} />
      </div>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};
