import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ScrollArea, ScrollBar } from "./ScrollArea";
import { scrollAreaDefaultValues } from "./ScrollArea.defaults";

const meta: Meta<typeof ScrollArea> = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  args: {
    ...scrollAreaDefaultValues,
  },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const tags = Array.from({ length: 20 }, (_, index) => `Tag ${index + 1}`);

export const Default: Story = {
  render: (args) => (
    <ScrollArea {...args} className="h-48 w-48 rounded-xl border">
      <div className="space-y-2 p-4">
        {tags.map((tag) => (
          <div key={tag} className="text-sm">
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <ScrollArea {...args} className="w-96 rounded-xl border whitespace-nowrap">
      <div className="flex w-max gap-4 p-4">
        {tags.map((tag) => (
          <div key={tag} className="rounded-lg border px-3 py-1 text-sm">
            {tag}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const BothDirections: Story = {
  render: (args) => (
    <ScrollArea {...args} className="h-48 w-72 rounded-xl border">
      <div className="w-[480px] p-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 24 }, (_, index) => (
            <div key={index} className="rounded-lg border p-3 text-sm">
              Item {index + 1}
            </div>
          ))}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};
