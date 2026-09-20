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
      <BentoSkeleton {...args} />
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
      <BentoSkeleton {...args} />
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
      <BentoSkeleton {...args} />
      <section>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-6 xl:grid-cols-12">
          <article className="min-h-72 rounded-xl border border-border bg-card p-5 md:col-span-6 xl:col-span-7">
            <p className="text-[10px] font-semibold tracking-widest uppercase">Needs Attention</p>
            <p className="mt-6 text-sm">Payment proof → Review</p>
          </article>
          <article className="rounded-xl border border-border bg-card p-5 md:col-span-2 xl:col-span-5">
            <p className="text-sm">Today&apos;s Classes</p>
            <p className="mt-8 text-3xl font-light">4</p>
          </article>
        </div>
      </section>
    </div>
  ),
};
