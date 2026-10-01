import { customers, publicClasses } from "@balanse/mock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mockCustomerSelfServiceActions } from "../../../_lib/mock-customer-self-service";
import { AboutYouSection } from "./AboutYouSection";

const ana = customers[0];
const ben = customers[1];
const active = publicClasses.filter((gymClass) => gymClass.active);

const meta = {
  title: "Portal/AboutYouSection",
  component: AboutYouSection,
  tags: ["autodocs"],
  args: {
    profile: ana,
    answers: null,
    classes: active,
    referralChannel: null,
    actions: mockCustomerSelfServiceActions(ana.id),
  },
} satisfies Meta<typeof AboutYouSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Not started: empty forms and a link to the welcome steps. */
export const NotStarted: Story = {};

export const Completed: Story = {
  args: {
    profile: ben,
    actions: mockCustomerSelfServiceActions(ben.id),
    answers: {
      goals: ["STRENGTH", "COMMUNITY"],
      goalsOther: "",
      experienceLevel: "REGULAR",
      interestClassIds: active.slice(0, 2).map((gymClass) => gymClass.id),
      interestsOther: "",
      heardFrom: "INSTAGRAM",
      heardFromOther: "",
      updatedAt: "2026-09-28T02:00:00.000Z",
    },
  },
};
