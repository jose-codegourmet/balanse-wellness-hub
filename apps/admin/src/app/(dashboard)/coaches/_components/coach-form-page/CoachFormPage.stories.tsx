import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { coachFormDefaultValues } from "@/modules/admin/forms/coach/coach-form.defaults";
import { coachFormSchema } from "@/modules/admin/forms/coach/coach-form.schema";
import { CoachFormPage } from "./CoachFormPage";

const meta = {
  title: "Admin/Screens/Coach Form",
  component: CoachFormPage,
  tags: ["autodocs"],
  args: {
    coachId: "new",
  },
  parameters: {
    coachFormSchema,
    coachFormDefaultValues,
  },
} satisfies Meta<typeof CoachFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: { coachId: "new" },
};

export const EditWithPhoto: Story = {
  args: { coachId: "coach-rex" },
};

export const EditWithoutPhoto: Story = {
  args: { coachId: "coach-alec" },
};

/** Teaching-only fixture — no staff account, still a valid coach. */
export const CoachWithNoStaffAccount: Story = {
  args: { coachId: "coach-ephraim", initialTab: "profile" },
};

export const PhotoTab: Story = {
  args: { coachId: "coach-rex", initialTab: "photo" },
};

export const ProfileTab: Story = {
  args: { coachId: "coach-rex", initialTab: "profile" },
};

export const FinancialsTab: Story = {
  args: { coachId: "coach-rex", initialTab: "financials" },
};

export const SessionsTab: Story = {
  args: { coachId: "coach-rex", initialTab: "sessions" },
};

/** Empty required fields — submit in the canvas to see FieldError + tab error labels. */
export const ValidationErrors: Story = {
  args: { coachId: "new", initialTab: "profile" },
};

export const Submitting: Story = {
  args: { coachId: "coach-rex" },
  parameters: { mockRuntime: { latencyMs: 10_000 } },
};

export const SubmitFailure: Story = {
  args: { coachId: "coach-rex" },
  parameters: { mockRuntime: { failNext: true } },
};

export const MobileFullPage: Story = {
  args: { coachId: "coach-rex" },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

/**
 * MockPrincipal has no separate staff role. Customer/guest stand in for a
 * non-admin principal — rate fields must be absent from the DOM, not hidden.
 */
export const NonAdminNoFinancials: Story = {
  args: { coachId: "coach-rex" },
  globals: { principal: "customer" },
};

export const Dark: Story = {
  args: { coachId: "coach-rex" },
  globals: { theme: "dark" },
};
