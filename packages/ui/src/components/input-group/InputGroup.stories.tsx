import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MailIcon, SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./InputGroup";
import { inputGroupDefaultValues } from "./InputGroup.defaults";

const meta: Meta<typeof InputGroup> = {
  title: "Components/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  args: { ...inputGroupDefaultValues },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
    </InputGroup>
  ),
};

export const WithButton: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput placeholder="Enter your email" type="email" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Subscribe</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithText: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon>
        <InputGroupText>
          <MailIcon />
          Email
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="you@example.com" type="email" />
    </InputGroup>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput invalid placeholder="invalid-email" defaultValue="invalid-email" />
    </InputGroup>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput disabled placeholder="Disabled" defaultValue="Cannot edit" />
    </InputGroup>
  ),
};

export const WithTextarea: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon align="block-start">
        <InputGroupText>Message</InputGroupText>
      </InputGroupAddon>
      <InputGroupTextarea placeholder="Write your message..." rows={4} />
    </InputGroup>
  ),
};
