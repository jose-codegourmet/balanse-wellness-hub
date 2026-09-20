import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CardListSkeleton } from "./CardListSkeleton";
import { cardListSkeletonDefaultValues } from "./CardListSkeleton.defaults";
import { ReducedMotionNote, SHELL_WIDTH, ShellStoryFrame } from "./skeleton-story";

const meta: Meta<typeof CardListSkeleton> = {
  title: "Shared/CardListSkeleton",
  component: CardListSkeleton,
  tags: ["autodocs"],
  args: cardListSkeletonDefaultValues,
};

export default meta;
type Story = StoryObj<typeof CardListSkeleton>;

export const Mobile: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile}>
      <CardListSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const Tablet: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet}>
      <CardListSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const Desktop: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop}>
      <CardListSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const MobileDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile} dark>
      <CardListSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const TabletDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet} dark>
      <CardListSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const DesktopDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop} dark>
      <CardListSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <ReducedMotionNote>
      <CardListSkeleton {...args} />
    </ReducedMotionNote>
  ),
};

export const VersusReal: Story = {
  render: (args) => (
    <div className="grid gap-8 lg:grid-cols-2">
      <CardListSkeleton {...args} items={1} />
      <section>
        <h1 className="font-display text-3xl">Cancellation Requests</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Slot stays locked until the request is completed or rejected.
        </p>
        <ul className="mt-6 space-y-4">
          <li className="rounded-xl border border-border p-4">
            <p>
              <span className="text-muted-foreground">Customer </span>Ana Reyes
            </p>
            <p>
              <span className="text-muted-foreground">Booking </span>Reformer Flow · 20 Sep
            </p>
            <p>
              <span className="text-muted-foreground">Payment status </span>Paid
            </p>
            <p>
              <span className="text-muted-foreground">Request time </span>19 Sep
            </p>
            <p>
              <span className="text-muted-foreground">Reason </span>Schedule conflict
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-sm">
                Complete Cancellation
              </span>
              <span className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-sm">
                Reject Request
              </span>
            </div>
          </li>
        </ul>
      </section>
    </div>
  ),
};
