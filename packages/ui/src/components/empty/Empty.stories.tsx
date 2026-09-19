import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InboxIcon } from "lucide-react";

import { Button } from "../button/Button";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./Empty";

const meta: Meta<typeof Empty> = {
  title: "Components/Empty",
  component: Empty,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Empty>;

export const Default: Story = {
  render: (args) => (
    <Empty {...args} className="border">
      <EmptyHeader>
        <EmptyTitle>No messages yet</EmptyTitle>
        <EmptyDescription>
          When you start chatting with matches, conversations will appear here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <Empty {...args} className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>Your inbox is empty</EmptyTitle>
        <EmptyDescription>
          Send a hello to a nearby member to start your first conversation.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <Empty {...args} className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>Try adjusting your filters or search in a wider area.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Browse classes</Button>
        <Button size="sm" variant="outline">
          Reset filters
        </Button>
      </EmptyContent>
    </Empty>
  ),
};
