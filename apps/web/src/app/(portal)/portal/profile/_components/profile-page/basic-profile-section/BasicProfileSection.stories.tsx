import { customers } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BasicProfileSection } from "./BasicProfileSection";

const ana = customers[0];
const ben = customers[1];

const meta = {
  title: "Portal/BasicProfileSection",
  component: BasicProfileSection,
  tags: ["autodocs"],
  args: {
    profile: ana,
    onSaved: () => undefined,
  },
} satisfies Meta<typeof BasicProfileSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Initials, no nickname, shown on rosters. */
export const Default: Story = {};

/** Photo, nickname, and hidden from public rosters. */
export const PhotoNicknameHidden: Story = {
  args: {
    profile: { ...ben, showOnPublicRoster: false },
  },
};

/** Legacy single-word name: the last-name prompt shows. */
export const MissingLastName: Story = {
  args: { profile: { ...ana, lastName: "", fullName: "Ana" } },
};
