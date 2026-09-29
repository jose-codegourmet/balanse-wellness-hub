import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MailIcon, PlusIcon } from "lucide-react";

import { Button } from "./Button";
import { buttonDefaultValues } from "./Button.defaults";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { ...buttonDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args} variant="default">
        Primary
      </Button>
      <Button {...args} variant="accent">
        Book session
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="destructive">
        Destructive
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button {...args} size="xs">
          Extra small
        </Button>
        <Button {...args} size="sm">
          Small
        </Button>
        <Button {...args} size="md">
          Medium
        </Button>
        <Button {...args} size="lg">
          Large
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button {...args} size="icon-xs" aria-label="Add">
          <PlusIcon />
        </Button>
        <Button {...args} size="icon-sm" aria-label="Add">
          <PlusIcon />
        </Button>
        <Button {...args} size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
        <Button {...args} size="icon-lg" aria-label="Add">
          <PlusIcon />
        </Button>
      </div>
    </div>
  ),
};

const SURFACE_VARIANTS = [
  ["default", "Save changes"],
  ["accent", "Book session"],
  ["secondary", "Add note"],
  ["outline", "Cancel"],
  ["ghost", "Dismiss"],
  ["destructive", "Archive"],
  ["link", "Show all coaches"],
] as const;

/**
 * Every variant on the three grounds it ships on. Warm white and cream follow
 * the theme (`bg-card`, `bg-background`); the navy band carries `dark` so the
 * tokens flip, which is how CTA bands and the admin sidebar keep `outline`,
 * `ghost` and `link` legible.
 */
export const Surfaces: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(
        [
          ["Warm white", "bg-card"],
          ["Cream", "bg-background"],
          ["Navy", "dark bg-[var(--balanse-navy)] text-foreground"],
        ] as const
      ).map(([label, surface]) => (
        <div key={label} className={`${surface} rounded-[6px] border border-border p-6`}>
          <p className="mb-4 text-xs font-medium text-muted-foreground">{label}</p>
          <div className="flex flex-wrap items-center gap-3">
            {SURFACE_VARIANTS.map(([variant, text]) => (
              <Button key={variant} {...args} variant={variant}>
                {text}
              </Button>
            ))}
            <Button {...args} variant="outline" size="icon" aria-label="Add">
              <PlusIcon />
            </Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args}>
        <MailIcon data-icon="inline-start" />
        Email
      </Button>
      <Button {...args} variant="outline">
        Continue
        <PlusIcon data-icon="inline-end" />
      </Button>
    </div>
  ),
};

export const AsRender: Story = {
  render: (args) => (
    <Button {...args} render={<a href="#save" />}>
      Save as link
    </Button>
  ),
};
