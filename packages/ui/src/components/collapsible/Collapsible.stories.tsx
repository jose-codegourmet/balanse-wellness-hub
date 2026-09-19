import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChevronsUpDownIcon } from "lucide-react";

import { Button } from "../button/Button";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsible";

const meta: Meta<typeof Collapsible> = {
  title: "Components/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-[360px] space-y-2">
      <div className="flex items-center justify-between gap-4 px-1">
        <h4 className="text-sm font-medium">Order summary</h4>
        <CollapsibleTrigger render={<Button variant="ghost" size="icon-xs" />}>
          <ChevronsUpDownIcon />
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-lg border px-4 py-2 text-sm">3 items · $129.00</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-lg border px-4 py-2 text-sm">Premium harness · $49.00</div>
        <div className="rounded-lg border px-4 py-2 text-sm">Travel bowl · $24.00</div>
        <div className="rounded-lg border px-4 py-2 text-sm">Leash set · $56.00</div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const Open: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-[360px] space-y-2">
      <div className="flex items-center justify-between gap-4 px-1">
        <h4 className="text-sm font-medium">Shipping details</h4>
        <CollapsibleTrigger render={<Button variant="ghost" size="icon-xs" />}>
          <ChevronsUpDownIcon />
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-lg border px-4 py-2 text-sm">123 Maple Street</div>
        <div className="rounded-lg border px-4 py-2 text-sm">San Francisco, CA 94102</div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Collapsible disabled className="w-[360px] space-y-2 opacity-60">
      <div className="flex items-center justify-between gap-4 px-1">
        <h4 className="text-sm font-medium">Unavailable section</h4>
        <CollapsibleTrigger render={<Button variant="ghost" size="icon-xs" disabled />}>
          <ChevronsUpDownIcon />
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="rounded-lg border px-4 py-2 text-sm">This content cannot be toggled.</div>
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const WithLongContent: Story = {
  render: () => (
    <Collapsible className="w-[360px] space-y-2">
      <div className="flex items-center justify-between gap-4 px-1">
        <h4 className="text-sm font-medium">Terms and conditions</h4>
        <CollapsibleTrigger render={<Button variant="outline" size="sm" />}>
          Read more
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
        By using Balansé you agree to our community guidelines, privacy policy, and acceptable use
        terms. Collapsible sections help keep dense legal or informational content accessible
        without overwhelming the primary page layout.
      </CollapsibleContent>
    </Collapsible>
  ),
};
