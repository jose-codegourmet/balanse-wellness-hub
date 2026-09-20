import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BentoSkeleton } from "./BentoSkeleton";
import { bentoSkeletonDefaultValues } from "./BentoSkeleton.defaults";
import { ReducedMotionNote, SHELL_WIDTH, ShellStoryFrame } from "./skeleton-story";

const meta: Meta<typeof BentoSkeleton> = {
  title: "Shared/BentoSkeleton",
  component: BentoSkeleton,
  tags: ["autodocs"],
  args: bentoSkeletonDefaultValues,
};

export default meta;
type Story = StoryObj<typeof BentoSkeleton>;

export const Mobile: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile}>
      <BentoSkeleton {...args} tiles={2} />
    </ShellStoryFrame>
  ),
};

export const Tablet: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet}>
      <BentoSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const Desktop: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop}>
      <BentoSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const MobileDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile} dark>
      <BentoSkeleton {...args} tiles={2} />
    </ShellStoryFrame>
  ),
};

export const TabletDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet} dark>
      <BentoSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const DesktopDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop} dark>
      <BentoSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <ReducedMotionNote>
      <BentoSkeleton {...args} />
    </ReducedMotionNote>
  ),
};

export const VersusReal: Story = {
  render: (args) => (
    <div className="grid gap-8 lg:grid-cols-2">
      <BentoSkeleton {...args} tiles={2} />
      <section>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <div className="mt-6 grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-2">
          <div className="p-4 md:p-5">
            <p className="text-sm">Today&apos;s Classes</p>
            <p className="mt-8 text-3xl font-light">4</p>
          </div>
          <div className="border-border/50 border-t p-4 md:border-t-0 md:border-l md:p-5">
            <p className="text-sm">Pending Payments</p>
            <p className="mt-8 text-3xl font-light">2</p>
          </div>
        </div>
        <h2 className="mt-10 font-display text-2xl">Needs Attention</h2>
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          <li className="flex flex-col gap-1 px-4 py-3">
            <span className="text-sm font-medium">Payment proof → Review</span>
            <span className="text-sm text-muted-foreground">2 payments waiting</span>
          </li>
        </ul>
      </section>
    </div>
  ),
};
