import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EventFormPage } from "./EventFormPage";
import { eventFormDefaultValues } from "./EventFormPage.defaults";
import { eventFormSchema } from "./EventFormPage.schema";

const meta = {
  title: "Admin/Screens/Event form",
  component: EventFormPage,
  tags: ["autodocs"],
  parameters: { eventFormDefaultValues, eventFormSchema },
} satisfies Meta<typeof EventFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyCreate: Story = {};

export const SessionPreboundCreate: Story = {
  args: { sessionId: "session-wed-open" },
};

export const PopulatedEdit: Story = {
  args: { sessionId: "session-event-pilates" },
};

export const ValidationErrors: Story = {
  args: {
    showValidationErrors: true,
    previewValues: {
      ...eventFormDefaultValues,
      sessionId: "",
      title: "",
      registrationOpensOn: "2026-09-26",
      registrationOpensAtTime: "09:00",
      registrationClosesOn: "2026-09-26",
      registrationClosesAtTime: "08:00",
    },
  },
};

export const SessionAlreadyHasEvent: Story = {};

export const PublishBlockedOnDraftSession: Story = {
  args: { sessionId: "session-event-self-defense" },
};

export const CancelConfirm: Story = {
  args: { sessionId: "session-event-pilates", previewDialog: "cancel" },
};

export const ArchiveConfirm: Story = {
  args: { sessionId: "session-event-pilates", previewDialog: "archive" },
};
