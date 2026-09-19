import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "../button/Button";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard";

const meta: Meta<typeof HoverCard> = {
  title: "Components/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="link" className="px-0" />}>
        @balanse
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Balansé</h4>
          <p className="text-sm text-muted-foreground">
            Smart matching for members and trusted sitters in your neighborhood.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const Open: Story = {
  render: () => (
    <HoverCard open>
      <HoverCardTrigger render={<Button variant="outline" />}>Hover preview</HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm">This card is shown in its open state for documentation.</p>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const AlignStart: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="outline" />}>Left aligned card</HoverCardTrigger>
      <HoverCardContent align="start">
        <p className="text-sm">Content aligned to the start of the trigger.</p>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const WithRichContent: Story = {
  render: () => (
    <HoverCard openDelay={100}>
      <HoverCardTrigger render={<Button variant="link" className="px-0" />}>
        View profile
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            PP
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Jamie Chen</h4>
            <p className="text-sm text-muted-foreground">
              Verified sitter · 4.9 rating · 128 completed stays
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
