import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { sessionFormDefaultValues } from "@/modules/admin/forms/session/session-form.defaults";
import { sessionFormSchema } from "@/modules/admin/forms/session/session-form.schema";
import { SessionFormPage } from "./SessionFormPage";
import { sessionFormPageDefaultValues } from "./SessionFormPage.defaults";

const meta = {
  title: "Admin/Screens/SessionForm",
  component: SessionFormPage,
  tags: ["autodocs"],
  args: sessionFormPageDefaultValues,
  parameters: {
    sessionFormDefaultValues,
    sessionFormSchema,
  },
} satisfies Meta<typeof SessionFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreatePrefillsDate: Story = {
  args: { sessionId: "new", date: "2026-09-21", surface: "overlay" },
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const CreatePage: Story = {
  args: { sessionId: "new", date: "2026-09-21" },
};

export const EditPrefilled: Story = {
  args: { sessionId: "session-wed-open" },
};

export const CapacityValidation: Story = {
  args: { sessionId: "session-wed-open" },
};

export const Submitting: Story = {
  args: { sessionId: "session-wed-open" },
  parameters: { mockRuntime: { latencyMs: 10_000 } },
};

export const SubmitFailure: Story = {
  args: { sessionId: "session-wed-open" },
  parameters: { mockRuntime: { failNext: true } },
};

export const MobileFullPage: Story = {
  args: { sessionId: "new", date: "2026-09-21", surface: "page" },
  parameters: { viewport: { defaultViewport: "mobile" } },
};

export const OverlayDesktop: Story = {
  args: { sessionId: "new", date: "2026-09-21", surface: "overlay" },
  parameters: { viewport: { defaultViewport: "desktop" } },
};

/**
 * MockPrincipal has no separate staff role. Customer/guest stand in for a
 * non-admin principal — coach-rate snapshot fields must be absent from the DOM.
 */
export const NonAdminNoRateSnapshot: Story = {
  args: { sessionId: "session-wed-open" },
  globals: { principal: "customer" },
};

export const Dark: Story = {
  args: { sessionId: "session-wed-open" },
  globals: { theme: "dark" },
};

export const MultipleCoaches: Story = {
  args: { sessionId: "session-wed-cutoff" },
};
