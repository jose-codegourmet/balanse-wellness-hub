import { customers } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockCustomerSelfServiceActions } from "../../../_lib/mock-customer-self-service";
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
    actions: mockCustomerSelfServiceActions(ana.id),
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
    actions: mockCustomerSelfServiceActions(ben.id),
  },
};

/** Legacy single-word name: the last-name prompt shows. */
export const MissingLastName: Story = {
  args: { profile: { ...ana, lastName: "", fullName: "Ana" } },
};
