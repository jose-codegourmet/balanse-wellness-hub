import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProfilePreferencesForm } from "./ProfilePreferencesForm";
import { profilePreferencesFormDefaultValues } from "./ProfilePreferencesForm.defaults";
import { profilePreferencesFormSchema } from "./ProfilePreferencesForm.schema";

const meta = {
  title: "Admin/Components/Form/Profile preferences",
  component: ProfilePreferencesForm,
  tags: ["autodocs"],
  parameters: { profilePreferencesFormDefaultValues, profilePreferencesFormSchema },
} satisfies Meta<typeof ProfilePreferencesForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const QuietMode: Story = {
  args: {
    defaultValues: {
      ...profilePreferencesFormDefaultValues,
      scheduleUpdates: false,
      dailySummary: false,
    },
  },
};
