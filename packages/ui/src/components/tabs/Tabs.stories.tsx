import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

import {
  Tabs,
  type TabsCarouselItem,
  TabsCarouselList,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="account" className="max-w-md">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm text-muted-foreground">Make changes to your account settings here.</p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm text-muted-foreground">Change your password here.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const Line: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="overview" className="max-w-md">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">
          Overview of your practice matching activity.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-sm text-muted-foreground">Analytics and engagement metrics.</p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-sm text-muted-foreground">Downloadable reports and summaries.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="profile" orientation="vertical" className="max-w-lg">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <p className="text-sm text-muted-foreground">Update your class profile and photos.</p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-sm text-muted-foreground">
          Manage email and push notification settings.
        </p>
      </TabsContent>
      <TabsContent value="billing">
        <p className="text-sm text-muted-foreground">View plans, invoices, and payment methods.</p>
      </TabsContent>
    </Tabs>
  ),
};

const responsiveTabs: TabsCarouselItem[] = [
  { value: "overview", label: "Overview" },
  { value: "matches", label: "Matches" },
  { value: "playdates", label: "Playdates" },
  { value: "messages", label: "Messages" },
  { value: "community", label: "Community" },
  { value: "safety", label: "Safety tips" },
  { value: "settings", label: "Settings" },
];

function ResponsiveTabsDemo(args: React.ComponentProps<typeof Tabs>) {
  const [width, setWidth] = React.useState(320);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted-foreground">
          Container width: <span className="font-medium text-foreground">{width}px</span>
          <span className="ml-2 text-xs">
            (carousel below 384px / <code>@sm</code>, static tabs at or above)
          </span>
        </span>
        <input
          type="range"
          min={240}
          max={640}
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
        />
      </label>

      <div className="rounded-xl border border-dashed border-border p-4" style={{ width }}>
        <Tabs {...args} defaultValue="overview" className="w-full">
          <TabsCarouselList tabs={responsiveTabs} breakpoint="sm" />
          {responsiveTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <p className="text-sm text-muted-foreground">
                Content for <span className="font-medium text-foreground">{tab.label}</span>.
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Narrow (280px) — carousel
          </p>
          <div className="w-[280px]">
            <Tabs defaultValue="overview" className="w-full">
              <TabsCarouselList tabs={responsiveTabs} breakpoint="sm" />
            </Tabs>
          </div>
        </div>
        <div className="rounded-xl border p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Wide (480px) — static</p>
          <div className="w-[480px] max-w-full">
            <Tabs defaultValue="overview" className="w-full">
              <TabsCarouselList tabs={responsiveTabs} breakpoint="sm" />
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ResponsiveTabs: Story = {
  parameters: {
    layout: "padded",
  },
  render: (args) => <ResponsiveTabsDemo {...args} />,
};
