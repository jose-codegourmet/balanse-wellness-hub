import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AdminPageTabs } from "./AdminPageTabs";
import { adminPageTabsDefaultValues } from "./AdminPageTabs.defaults";

const meta: Meta<typeof AdminPageTabs> = {
  title: "Admin/Components/AdminPageTabs",
  component: AdminPageTabs,
  tags: ["autodocs"],
  args: {
    ...adminPageTabsDefaultValues,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Wrapper over `@balanse/ui` Tabs (Base UI). The primitive supplies `role="tablist"`, `aria-controls` ↔ `role="tabpanel"`, roving `tabIndex`, and Left/Right/Home/End. Active state uses weight plus the line indicator so it is not colour-only.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <AdminPageTabs {...args} value={value} onValueChange={setValue}>
        <p className="text-sm text-muted-foreground">Panel for {value}.</p>
      </AdminPageTabs>
    );
  },
};

export const Payments: Story = {
  args: {
    tabs: [
      { id: "gcash", label: "GCash Pending" },
      { id: "counter", label: "Pay at Counter" },
      { id: "refunds", label: "Refunds" },
    ],
    value: "gcash",
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <AdminPageTabs {...args} value={value} onValueChange={setValue}>
        <p className="text-sm text-muted-foreground">Queue for {value}.</p>
      </AdminPageTabs>
    );
  },
};

export const KeyboardNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Focus a tab, then use Left/Right to move, Home/End to jump to the first or last tab, and Enter/Space to activate. Do not re-implement this in the wrapper — it comes from Base UI Tabs.",
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <AdminPageTabs {...args} value={value} onValueChange={setValue}>
        <p className="text-sm text-muted-foreground">Use arrow keys on the tab list.</p>
      </AdminPageTabs>
    );
  },
};
