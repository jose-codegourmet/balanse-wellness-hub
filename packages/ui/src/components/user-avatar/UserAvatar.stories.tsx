import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { UserAvatar, UserAvatarStack } from "./UserAvatar";

const PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#e6d5b8"/><circle cx="40" cy="40" r="24" fill="#c4a35a"/><path d="M16 64 L40 30 L64 64 Z" fill="#6b5344"/></svg>',
  );

const meta: Meta<typeof UserAvatar> = {
  title: "Components/UserAvatar",
  component: UserAvatar,
  tags: ["autodocs"],
  args: { name: { firstName: "Maria Clara", lastName: "Reyes" }, seed: "cust-m-01" },
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

export const WithPhoto: Story = { args: { avatarUrl: PHOTO, size: "lg" } };

export const Initials: Story = { args: { size: "lg" } };

export const SingleNameInitials: Story = {
  args: { name: { firstName: "Empty", lastName: "" }, seed: "cust-empty", size: "lg" },
};

export const BrokenImageFallsBack: Story = {
  args: { avatarUrl: "/does-not-exist.png", size: "lg" },
};

export const Placeholder: Story = { args: { placeholder: true, size: "lg" } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <UserAvatar {...args} size="sm" />
      <UserAvatar {...args} size="default" />
      <UserAvatar {...args} size="lg" />
      <UserAvatar {...args} size="xl" />
      <UserAvatar {...args} avatarUrl={PHOTO} size="xl" />
    </div>
  ),
};

const PEOPLE = [
  { key: "a", name: { firstName: "Clara", lastName: "Reyes" }, avatarUrl: PHOTO },
  { key: "b", name: { firstName: "Migs", lastName: "Tan" } },
  { key: "c", name: { firstName: "Patricia", lastName: "Lim" } },
  { key: "d", name: { firstName: "Bea", lastName: "Villanueva" }, avatarUrl: PHOTO },
  { key: "e", name: { firstName: "Raf", lastName: "Cruz" } },
  { key: "f", name: { firstName: "Andi", lastName: "Lopez" } },
  { key: "g", name: { firstName: "Kimmy", lastName: "Aquino" } },
];

export const Stack: StoryObj<typeof UserAvatarStack> = {
  render: () => <UserAvatarStack people={PEOPLE} overflowCount={2} label="9 going" />,
};

export const GuestPlaceholderStack: StoryObj<typeof UserAvatarStack> = {
  render: () => (
    <UserAvatarStack people={[]} placeholderCount={4} overflowCount={7} label="11 going" />
  ),
};
