import { Button } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminPageTabs } from "../admin-page-tabs/AdminPageTabs";
import { adminPageTabsDefaultValues } from "../admin-page-tabs/AdminPageTabs.defaults";
import { AdminPageShell } from "./AdminPageShell";
import { adminPageShellDefaultValues } from "./AdminPageShell.defaults";

const meta: Meta<typeof AdminPageShell> = {
  title: "Admin/Components/AdminPageShell",
  component: AdminPageShell,
  tags: ["autodocs"],
  args: {
    ...adminPageShellDefaultValues,
    children: <p className="text-sm text-muted-foreground">Page body.</p>,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  args: {
    description: undefined,
  },
};

export const WithDescription: Story = {};

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button type="button" variant="outline">
          Export
        </Button>
        <Button type="button">Add booking</Button>
      </>
    ),
  },
};

export const WithTabs: Story = {
  render: (args) => (
    <AdminPageShell
      {...args}
      tabs={
        <AdminPageTabs
          tabs={adminPageTabsDefaultValues.tabs ?? []}
          value={adminPageTabsDefaultValues.value ?? "pending"}
          onValueChange={() => undefined}
        />
      }
    />
  ),
};

export const WithStats: Story = {
  args: {
    stats: (
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-3 text-sm">
          <p className="text-muted-foreground">Pending</p>
          <p className="mt-1 font-display text-2xl">4</p>
        </div>
        <div className="rounded-xl border border-border p-3 text-sm">
          <p className="text-muted-foreground">Confirmed</p>
          <p className="mt-1 font-display text-2xl">12</p>
        </div>
        <div className="rounded-xl border border-border p-3 text-sm">
          <p className="text-muted-foreground">Waitlisted</p>
          <p className="mt-1 font-display text-2xl">2</p>
        </div>
      </div>
    ),
  },
};

export const WithBreadcrumb: Story = {
  args: {
    title: "Maya Cruz",
    breadcrumb: [{ label: "Customers", href: "/customers" }, { label: "Maya Cruz" }],
  },
};

export const Compact360: Story = {
  args: {
    actions: <Button type="button">Add Class</Button>,
  },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const Tablet768: Story = {
  args: {
    actions: <Button type="button">Add Class</Button>,
  },
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

export const Desktop1280: Story = {
  args: {
    actions: <Button type="button">Add Class</Button>,
  },
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

export const DarkTheme: Story = {
  args: {
    actions: <Button type="button">Add Class</Button>,
    breadcrumb: [{ label: "Classes", href: "/classes" }, { label: "Vinyasa Flow" }],
  },
  globals: { theme: "dark" },
};
