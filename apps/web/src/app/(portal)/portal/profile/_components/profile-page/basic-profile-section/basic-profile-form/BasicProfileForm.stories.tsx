import { customers } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BasicProfileForm } from "./BasicProfileForm";
import { basicProfileFormDefaultValues } from "./BasicProfileForm.defaults";

const ana = customers[0];

const meta = {
  title: "Portal/Basic profile form",
  component: BasicProfileForm,
  tags: ["autodocs"],
  args: {
    profile: ana,
    onSave: async (patch) => ({
      ok: true,
      value: { ...ana, ...patch, nickname: patch.nickname ?? null },
    }),
    onSaved: () => undefined,
  },
} satisfies Meta<typeof BasicProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Nickname set: the preview shows it instead of the first name. */
export const WithNickname: Story = {
  args: { profile: { ...ana, nickname: "Annie" } },
};

/** Legacy single-word name after the backfill: last name is empty and required. */
export const MissingLastName: Story = {
  args: {
    profile: {
      ...ana,
      firstName: "Ana",
      lastName: basicProfileFormDefaultValues.lastName,
      fullName: "Ana",
    },
  },
};

export const Saving: Story = { args: { forcedStatus: "saving" } };
export const Failed: Story = { args: { forcedStatus: "failed" } };
