import type { PublicSessionPage } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PublicSessionDetails } from "./PublicSessionDetails";

const SAMPLE_SESSION: PublicSessionPage = {
  id: "session-event-pilates",
  name: "Pilates for a Cause",
  classId: "class-pilates",
  className: "Mat Pilates",
  classSlug: "mat-pilates",
  classShortDescription: "Slow, precise core work that builds strength from the inside out.",
  heroImage: "/assets/marketing/classes/mat-pilates-hero.webp",
  coaches: [
    { id: "coach-jodi", name: "Jodi Tio", photoKey: "coach-photos/jodi-tio" },
    { id: "coach-sofia", name: "Sofia Ocampo", photoKey: null },
  ],
  coachesDetailed: [
    {
      id: "coach-jodi",
      name: "Jodi Tio",
      photoKey: "coach-photos/jodi-tio",
      specialties: ["Mat Pilates"],
    },
    { id: "coach-sofia", name: "Sofia Ocampo", photoKey: null, specialties: ["Mat Pilates"] },
  ],
  coachName: "Jodi Tio, Sofia Ocampo",
  startsAt: "2026-09-26T00:00:00.000Z",
  endsAt: "2026-09-26T01:30:00.000Z",
  pricePhp: 1000,
  capacity: 30,
  remainingSlots: 17,
  reservable: true,
  availability: "open",
  status: "PUBLISHED",
  venue: { name: "Mandani Bay Garden Area", address: "Mandaue City, Cebu" },
  event: { id: "event-pilates-cause", title: "Pilates for a Cause", status: "PUBLISHED" },
};

const meta: Meta<typeof PublicSessionDetails> = {
  title: "Balanse/Public/PublicSessionDetails",
  component: PublicSessionDetails,
  tags: ["autodocs"],
  args: { session: SAMPLE_SESSION },
  decorators: [(Story) => <div className="max-w-3xl p-4">{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof PublicSessionDetails>;

export const Default: Story = {};
export const Full: Story = {
  args: {
    session: {
      ...SAMPLE_SESSION,
      remainingSlots: 0,
      availability: "full_with_waitlist",
      reservable: false,
    },
  },
};
export const WithoutClassBlurb: Story = { args: { showClassBlurb: false } };
