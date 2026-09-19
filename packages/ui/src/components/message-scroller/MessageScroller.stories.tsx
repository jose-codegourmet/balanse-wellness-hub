import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Bubble, BubbleContent } from "../bubble/Bubble";
import { Message, MessageContent } from "../message/Message";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "./MessageScroller";

const meta: Meta<typeof MessageScroller> = {
  title: "Components/MessageScroller",
  component: MessageScroller,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MessageScroller>;

const sampleMessages = [
  "Hey there! Welcome to Balansé support.",
  "How can we help you and your practice today?",
  "You can ask about matching, safety tips, or account settings.",
  "Our team typically replies within a few minutes.",
  "Feel free to share photos of your practice too!",
  "We love seeing happy matches from the community.",
  "Need help with your subscription? Just ask.",
  "Thanks for being part of Balansé!",
];

function MessageList({ count = sampleMessages.length }: { count?: number }) {
  return (
    <>
      {sampleMessages.slice(0, count).map((text, index) => (
        <MessageScrollerItem key={text} scrollAnchor={index === count - 1}>
          <Message align={index % 2 === 0 ? "start" : "end"}>
            <MessageContent>
              <Bubble align={index % 2 === 0 ? "start" : "end"}>
                <BubbleContent>{text}</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </MessageScrollerItem>
      ))}
    </>
  );
}

export const Default: Story = {
  render: (args) => (
    <MessageScrollerProvider>
      <MessageScroller {...args} className="h-72 w-full max-w-md rounded-xl border">
        <MessageScrollerViewport>
          <MessageScrollerContent>
            <MessageList count={5} />
          </MessageScrollerContent>
        </MessageScrollerViewport>
      </MessageScroller>
    </MessageScrollerProvider>
  ),
};

export const WithScrollButton: Story = {
  render: (args) => (
    <MessageScrollerProvider>
      <MessageScroller {...args} className="h-72 w-full max-w-md rounded-xl border">
        <MessageScrollerViewport>
          <MessageScrollerContent>
            <MessageList />
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  ),
};

export const LongConversation: Story = {
  render: (args) => (
    <MessageScrollerProvider>
      <MessageScroller {...args} className="h-96 w-full max-w-lg rounded-xl border">
        <MessageScrollerViewport>
          <MessageScrollerContent className="gap-4">
            <MessageList count={8} />
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  ),
};
