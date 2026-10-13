import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StaffPhotoCard } from "./StaffPhotoCard";

const meta: Meta<typeof StaffPhotoCard> = {
  title: "Admin/Components/Staff Photo Card",
  component: StaffPhotoCard,
  tags: ["autodocs"],
  args: { staffId: "staff-rex", name: "Rex Santos", avatarUrl: null, canEdit: true },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Initials: Story = {};
export const MyPhoto: Story = { args: { self: true } };
export const WithPhoto: Story = {
  args: {
    name: "Rex Francis Regis",
    avatarUrl: "/assets/headshots/rex-francis-regis/headshot-1x1.webp",
  },
};
export const BrokenPhotoFallback: Story = { args: { avatarUrl: "/missing-staff-photo.webp" } };
export const CreateFirst: Story = { args: { staffId: undefined } };
export const ReadOnly: Story = { args: { canEdit: false } };
