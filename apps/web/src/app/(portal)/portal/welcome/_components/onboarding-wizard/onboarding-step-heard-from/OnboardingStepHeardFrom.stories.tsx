import { Button } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { OnboardingStepHeardFrom } from "./OnboardingStepHeardFrom";
import {
  onboardingStepHeardFromDefaultValues,
  onboardingStepHeardFromValuesFrom,
} from "./OnboardingStepHeardFrom.defaults";

const meta = {
  title: "Portal/Onboarding/Step 4 · Heard from",
  component: OnboardingStepHeardFrom,
  tags: ["autodocs"],
  args: {
    defaultValues: onboardingStepHeardFromDefaultValues,
    onSubmit: () => undefined,
    footer: <Button type="submit">Finish</Button>,
  },
} satisfies Meta<typeof OnboardingStepHeardFrom>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: { defaultValues: { heardFrom: "INSTAGRAM", heardFromOther: "" } },
};

/** A friend's shared link: prefilled to "A friend", referrer never named. */
export const PrefilledFromFriendLink: Story = {
  args: {
    defaultValues: onboardingStepHeardFromValuesFrom(null, "CUSTOMER_LINK"),
    referredByFriend: true,
  },
};

/** Studio QR (e.g. an event poster): prefilled to "An event". */
export const PrefilledFromStudioQr: Story = {
  args: { defaultValues: onboardingStepHeardFromValuesFrom(null, "STUDIO_QR") },
};

export const OtherExpanded: Story = {
  args: { defaultValues: { heardFrom: "OTHER", heardFromOther: "Office wellness fair" } },
};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /finish/i }));
  },
};
