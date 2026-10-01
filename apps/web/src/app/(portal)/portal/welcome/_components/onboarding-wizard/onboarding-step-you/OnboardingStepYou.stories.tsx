import { Button } from "@balanse/ui";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { AvatarUploader } from "@/components/balanse/avatar-uploader/AvatarUploader";
import { OnboardingStepYou } from "./OnboardingStepYou";
import { onboardingStepYouDefaultValues } from "./OnboardingStepYou.defaults";

const meta = {
  title: "Portal/Onboarding/Step 1 · You",
  component: OnboardingStepYou,
  tags: ["autodocs"],
  args: {
    defaultValues: onboardingStepYouDefaultValues,
    avatarUrl: null,
    seed: "cust-ana",
    onSubmit: () => undefined,
    footer: <Button type="submit">Continue</Button>,
  },
} satisfies Meta<typeof OnboardingStepYou>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    defaultValues: { firstName: "Ana", lastName: "Delgado", nickname: "Annie" },
    avatarUrl: "/assets/placeholders/avatars/avatar-03.svg",
    avatarSlot: (
      <AvatarUploader
        name={{ firstName: "Ana", lastName: "Delgado" }}
        avatarUrl="/assets/placeholders/avatars/avatar-03.svg"
        seed="cust-ana"
        onSave={async () => null}
        onRemove={async () => null}
      />
    ),
  },
};

/** Legacy single-word name: Continue reveals the required last name. */
export const ValidationError: Story = {
  args: { defaultValues: { firstName: "Ana", lastName: "", nickname: "A" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /continue/i }));
  },
};
