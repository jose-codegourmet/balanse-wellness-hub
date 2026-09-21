import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AdminPageTabs } from "./AdminPageTabs";
import { adminPageTabsDefaultValues } from "./AdminPageTabs.defaults";
import type { AdminPageTab } from "./AdminPageTabs.schema";

function TabsDemo({
  tabs,
  value: initialValue,
  mobileBehavior,
  label,
}: {
  tabs: readonly AdminPageTab[];
  value?: string;
  mobileBehavior?: "tabs" | "stack";
  label?: string;
}) {
  const [value, setValue] = useState(initialValue ?? tabs[0]?.id ?? "pending");
  return (
    <AdminPageTabs
      tabs={tabs}
      value={value}
      onValueChange={setValue}
      mobileBehavior={mobileBehavior}
      label={label}
    >
      <p className="text-sm text-muted-foreground">Panel for {value}.</p>
    </AdminPageTabs>
  );
}

const overflowTabs: AdminPageTab[] = [
  { id: "photo", label: "Profile photo" },
  { id: "profile", label: "Public profile" },
  { id: "financials", label: "Internal financials" },
  { id: "sessions", label: "Upcoming sessions" },
  { id: "staff", label: "Linked staff account" },
  { id: "history", label: "Change history" },
];

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
          "Responsive admin tabs. Line tabs at md+; sticky chip row below md when mobileBehavior is tabs. Triggers are type=button so they do not submit parent forms. Keyboard: Left/Right/Home/End.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <TabsDemo tabs={args.tabs ?? []} value={args.value} />,
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
  render: (args) => <TabsDemo tabs={args.tabs ?? []} value={args.value} />,
};

export const ErroredTab: Story = {
  args: {
    tabs: [
      { id: "photo", label: "Profile photo" },
      { id: "profile", label: "Public profile", error: true },
      { id: "financials", label: "Internal financials" },
    ],
    value: "photo",
  },
  render: (args) => <TabsDemo tabs={args.tabs ?? []} value={args.value} />,
};

export const Overflowing360: Story = {
  args: { tabs: overflowTabs, value: "financials" },
  render: (args) => <TabsDemo tabs={args.tabs ?? []} value={args.value} />,
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const Overflowing768: Story = {
  args: { tabs: overflowTabs, value: "financials" },
  render: (args) => <TabsDemo tabs={args.tabs ?? []} value={args.value} />,
  parameters: { viewport: { defaultViewport: "tablet" } },
};

export const Overflowing1280: Story = {
  args: { tabs: overflowTabs, value: "financials" },
  render: (args) => <TabsDemo tabs={args.tabs ?? []} value={args.value} />,
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const StackOnMobile: Story = {
  args: { mobileBehavior: "stack" },
  render: (args) => <TabsDemo tabs={args.tabs ?? []} value={args.value} mobileBehavior="stack" />,
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const KeyboardNavigation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Focus a tab, then use Left/Right to move, Home/End to jump to the first or last tab, and Enter/Space to activate.",
      },
    },
  },
  render: (args) => <TabsDemo tabs={args.tabs ?? []} value={args.value} />,
};
