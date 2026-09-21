import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FormPageSkeleton } from "./FormPageSkeleton";
import { formPageSkeletonDefaultValues } from "./FormPageSkeleton.defaults";
import { ReducedMotionNote, SHELL_WIDTH, ShellStoryFrame } from "./skeleton-story";

const meta: Meta<typeof FormPageSkeleton> = {
  title: "Shared/FormPageSkeleton",
  component: FormPageSkeleton,
  tags: ["autodocs"],
  args: formPageSkeletonDefaultValues,
};

export default meta;
type Story = StoryObj<typeof FormPageSkeleton>;

export const Mobile: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile}>
      <FormPageSkeleton {...args} tabs={4} />
    </ShellStoryFrame>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const Tablet: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet}>
      <FormPageSkeleton {...args} tabs={4} />
    </ShellStoryFrame>
  ),
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

export const Desktop: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop}>
      <FormPageSkeleton {...args} tabs={4} />
    </ShellStoryFrame>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

export const MobileDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.mobile} dark>
      <FormPageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const TabletDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.tablet} dark>
      <FormPageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const DesktopDark: Story = {
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop} dark>
      <FormPageSkeleton {...args} />
    </ShellStoryFrame>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <ReducedMotionNote>
      <FormPageSkeleton {...args} />
    </ReducedMotionNote>
  ),
};

export const WithTabs: Story = {
  args: {
    tabs: 4,
    label: "Loading coach",
  },
  render: (args) => (
    <ShellStoryFrame width={SHELL_WIDTH.desktop}>
      <FormPageSkeleton {...args} />
    </ShellStoryFrame>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

export const VersusReal: Story = {
  render: (args) => (
    <div className="grid gap-8 lg:grid-cols-2">
      <FormPageSkeleton {...args} sections={1} fields={2} tabs={3} />
      <section className="max-w-2xl">
        <h1 className="font-display text-3xl">Settings</h1>
        <form className="mt-8 grid gap-10">
          <section>
            <h2 className="font-display text-2xl">Business Profile</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-1.5">
                <span className="text-sm font-medium">Name</span>
                <span className="flex h-8 items-center rounded-lg border border-input px-2.5 text-sm">
                  Balansé Wellness Hub
                </span>
              </div>
              <div className="grid gap-1.5">
                <span className="text-sm font-medium">Contact</span>
                <span className="flex h-8 items-center rounded-lg border border-input px-2.5 text-sm">
                  +63 900 000 0000
                </span>
              </div>
            </div>
          </section>
          <span className="inline-flex h-8 w-32 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
            Save settings
          </span>
        </form>
      </section>
    </div>
  ),
};
