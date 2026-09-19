import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminNav, CustomerNav, PublicNav } from "./AppNav";

const meta = {
  title: "Shared/Navigation",
} satisfies Meta;

export default meta;

export const PublicGuest: StoryObj = {
  render: () => <PublicNav pathname="/" hash="#schedule" principalRole="guest" />,
};

export const PublicCustomerSwap: StoryObj = {
  name: "Public — logged-in Profile swap",
  render: () => <PublicNav pathname="/about" principalRole="customer" />,
};

export const PublicClassesHash: StoryObj = {
  render: () => <PublicNav pathname="/" hash="#classes" principalRole="guest" />,
};

export const CustomerPortal: StoryObj = {
  render: () => <CustomerNav pathname="/portal/bookings/xyz" />,
};

export const AdminNested: StoryObj = {
  render: () => <AdminNav pathname="/sessions/session-wed-open/roster" />,
};
