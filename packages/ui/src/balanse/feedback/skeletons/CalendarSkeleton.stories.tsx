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
      <CalendarSkeleton {...args} view="day" />
    </ShellStoryFrame>
  ),
};

export const Tablet: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet}>
      <CalendarSkeleton {...args} view="week" />
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
      <CalendarSkeleton {...args} view="day" />
    </ShellStoryFrame>
  ),
};

export const TabletDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet} dark>
      <CalendarSkeleton {...args} view="week" />
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

export const VersusReal: Story = {
  render: (args) => (
    <div className="grid gap-8 lg:grid-cols-2">
      <CalendarSkeleton {...args} view="week" weeks={1} />
      <section className="space-y-4" aria-label="Class schedule calendar">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-sm">
            All
          </span>
          <span className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-sm">
            Reformer
          </span>
        </div>
        <p className="font-display text-xl">September 2026</p>
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
            <div key={label} className="px-1 text-xs font-medium text-muted-foreground">
              {label}
            </div>
          ))}
          {["14", "15", "16", "17", "18", "19", "20"].map((day) => (
            <div
              key={day}
              className="min-h-16 rounded-md border border-border bg-card px-2 py-2 text-sm"
            >
              <span className="block">{day}</span>
              <span className="block text-xs text-muted-foreground">2 sessions</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
