import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InsightsBarChart } from "./InsightsBarChart";

const meta = {
  title: "Admin/Marketing insights/Bar chart",
  component: InsightsBarChart,
  tags: ["autodocs"],
  args: {
    id: "story-heard-from",
    title: "How they heard about us",
    description: "Single choice from onboarding.",
    rows: [
      { key: "FRIEND", label: "A friend", count: 4 },
      { key: "INSTAGRAM", label: "Instagram", count: 2 },
      { key: "FACEBOOK", label: "Facebook", count: 1 },
      { key: "GOOGLE", label: "Google search", count: 1 },
      { key: "OTHER", label: "Other", count: 1 },
    ],
    percentOf: { total: 9, label: "answers" },
  },
} satisfies Meta<typeof InsightsBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPercentages: Story = {};

/** Multi-select question: the caption explains why percentages exceed 100% in total. */
export const MultiSelectCaption: Story = {
  args: {
    id: "story-goals",
    title: "Goals",
    rows: [
      { key: "STRENGTH", label: "Get stronger", count: 4 },
      { key: "FLEXIBILITY_MOBILITY", label: "Flexibility & mobility", count: 3 },
      { key: "COMMUNITY", label: "Meet people & community", count: 3 },
    ],
    percentOf: { total: 6, label: "respondents" },
    countLabel: "Respondents",
    caption:
      "Multi-select: percentages are of the 6 people who answered, so they don't add up to 100%.",
    tone: 2,
  },
};

/** Counts only (no share column), as used for class interests. */
export const CountsOnly: Story = {
  args: {
    id: "story-interests",
    title: "Class interest",
    rows: [
      { key: "class-pilates", label: "Pilates", count: 4 },
      { key: "class-yoga", label: "Yoga", count: 3 },
      { key: "class-bjj", label: "Brazilian Jiu-Jitsu (inactive)", count: 1 },
    ],
    percentOf: undefined,
    tone: 4,
  },
};

export const Empty: Story = {
  args: { emptyLabel: "No sign-ups in this range" },
};
