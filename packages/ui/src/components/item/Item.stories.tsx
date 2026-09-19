import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MailIcon, MoreHorizontalIcon } from "lucide-react";

import { Button } from "../button/Button";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "./Item";

const meta: Meta<typeof Item> = {
  title: "Components/Item",
  component: Item,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Item>;

export const Default: Story = {
  render: (args) => (
    <ItemGroup className="max-w-md">
      <Item {...args}>
        <ItemMedia variant="icon">
          <MailIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Unread messages</ItemTitle>
          <ItemDescription>3 new messages from members near you.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
};

export const Outline: Story = {
  render: (args) => (
    <ItemGroup className="max-w-md">
      <Item {...args} variant="outline">
        <ItemContent>
          <ItemTitle>Weekly digest</ItemTitle>
          <ItemDescription>Summary of matches and playdate invites.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            View
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
};

export const WithActions: Story = {
  render: (args) => (
    <ItemGroup className="max-w-md">
      <Item {...args} variant="muted">
        <ItemMedia variant="icon">
          <MailIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Match request</ItemTitle>
          <ItemDescription>Bailey&apos;s owner wants to schedule a playdate.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="icon-sm" variant="ghost">
            <MoreHorizontalIcon />
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
};
