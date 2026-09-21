import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar, AvatarFallback } from "../avatar/Avatar";
import { Field, FieldLabel } from "../field/Field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { selectDefaultValues } from "./Select.defaults";

function CoachMark({ initials }: { initials: string }) {
  return (
    <Avatar size="sm" className="size-7">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  args: { ...selectDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="max-w-xs">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Select key={size} {...args}>
          <SelectTrigger size={size} className="w-[160px]">
            <SelectValue placeholder={size} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>
      ))}
    </div>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <Field invalid className="max-w-xs">
      <FieldLabel>Favorite fruit</FieldLabel>
      <Select {...args}>
        <SelectTrigger invalid className="w-[200px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[200px]" disabled>
        <SelectValue placeholder="Unavailable" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const RichOptions: Story = {
  render: (args) => (
    <div className="max-w-sm">
      <Select {...args} defaultValue="maya">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="maya"
            leading={<CoachMark initials="MS" />}
            description="Reformer · senior"
          >
            Maya Santos
          </SelectItem>
          <SelectItem
            value="lina"
            leading={<CoachMark initials="LC" />}
            description="Tower · weekend"
          >
            Lina Cruz
          </SelectItem>
          <SelectItem
            value="jon"
            leading={<CoachMark initials="JR" />}
            description="Mat · mornings"
            disabled
          >
            Jon Reyes
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

export const RichOptionsDark: Story = {
  render: (args) => (
    <div className="dark max-w-sm bg-background p-4 text-foreground">
      <Select {...args} defaultValue="maya">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="maya"
            leading={<CoachMark initials="MS" />}
            description="Reformer · senior"
          >
            Maya Santos
          </SelectItem>
          <SelectItem
            value="lina"
            leading={<CoachMark initials="LC" />}
            description="Tower · weekend"
          >
            Lina Cruz
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

export const Grouped: Story = {
  args: {
    defaultValue: "dog",
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Choose a class" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Pets</SelectLabel>
          <SelectItem value="dog">Dog</SelectItem>
          <SelectItem value="cat">Cat</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Other</SelectLabel>
          <SelectItem value="fish">Fish</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};
