import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DetailPageSkeleton } from "./DetailPageSkeleton";
import { detailPageSkeletonDefaultValues } from "./DetailPageSkeleton.defaults";
import { ReducedMotionNote, SHELL_WIDTH, ShellStoryFrame } from "./skeleton-story";

const meta: Meta<typeof DetailPageSkeleton> = {
  title: "Shared/DetailPageSkeleton",
  component: DetailPageSkeleton,
  tags: ["autodocs"],
  args: detailPageSkeletonDefaultValues,
};

export default meta;
type Story = StoryObj<typeof DetailPageSkeleton>;

export const Mobile: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile}>
      <DetailPageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const Tablet: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet}>
      <DetailPageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const Desktop: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop}>
      <DetailPageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const MobileDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile} dark>
      <DetailPageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const TabletDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet} dark>
      <DetailPageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const DesktopDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop} dark>
      <DetailPageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <ReducedMotionNote>
      <DetailPageSkeleton {...args} />
    </ReducedMotionNote>
  ),
};

export const VersusReal: Story = {
  render: (args) => (
    <div className="grid gap-8 lg:grid-cols-2">
      <DetailPageSkeleton {...args} />
      <section>
        <h1 className="font-display text-3xl">Ana Reyes</h1>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl">Profile</h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>ana@example.com</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contact</dt>
                <dd>+63 917 000 0000</dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="font-display text-2xl">Upcoming</h2>
            <ul className="mt-3 space-y-2">
              <li className="rounded-xl border border-border p-3 text-sm">
                <p>Reformer Flow</p>
                <p className="text-muted-foreground">Confirmed</p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  ),
};
