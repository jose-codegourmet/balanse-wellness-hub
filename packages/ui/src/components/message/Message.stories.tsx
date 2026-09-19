import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar, AvatarFallback } from "../avatar/Avatar";
import { Bubble, BubbleContent } from "../bubble/Bubble";

import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "./Message";

const meta: Meta<typeof Message> = {
  title: "Components/Message",
  component: Message,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Message>;

export const Default: Story = {
  render: (args) => (
    <Message {...args}>
      <MessageAvatar>
        <Avatar className="size-8">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <Bubble>
          <BubbleContent>Hello! How can I help you today?</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ),
};

export const EndAligned: Story = {
  render: (args) => (
    <Message {...args} align="end">
      <MessageAvatar>
        <Avatar className="size-8">
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <Bubble align="end">
          <BubbleContent>Sounds good, thanks!</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: (args) => (
    <MessageGroup className="max-w-md">
      <Message {...args}>
        <MessageAvatar>
          <Avatar className="size-8">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Jane Doe</MessageHeader>
          <Bubble variant="secondary">
            <BubbleContent>Your appointment is confirmed for tomorrow at 2 PM.</BubbleContent>
          </Bubble>
          <MessageFooter>2:34 PM</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};
