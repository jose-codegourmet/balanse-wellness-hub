import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CalendarSkeleton } from "./CalendarSkeleton";
import { calendarSkeletonDefaultValues } from "./CalendarSkeleton.defaults";
import { ReducedMotionNote, SHELL_WIDTH, ShellStoryFrame } from "./skeleton-story";

const meta: Meta<typeof CalendarSkeleton> = {
  title: "Shared/CalendarSkeleton",
  component: CalendarSkeleton,
  tags: ["autodocs"],
  args: calendarSkeletonDefaultValues,
};

export default meta;
type Story = StoryObj<typeof CalendarSkeleton>;

export const Mobile: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile}>
      <CalendarSkeleton {...args} weeks={4} />
    </ShellStoryFrame>
  ),
};

export const Tablet: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet}>
      <CalendarSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const Desktop: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop}>
      <CalendarSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const MobileDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile} dark>
      <CalendarSkeleton {...args} weeks={4} />
    </ShellStoryFrame>
  ),
};

export const TabletDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet} dark>
      <CalendarSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const DesktopDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop} dark>
      <CalendarSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <ReducedMotionNote>
      <CalendarSkeleton {...args} />
    </ReducedMotionNote>
  ),
};
