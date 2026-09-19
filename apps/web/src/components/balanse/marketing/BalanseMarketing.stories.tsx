import { COACH_SPECIALTY_ACCENT_IDS, FAQ_GROUPS } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BalanseCtaBand } from "./BalanseCtaBand";
import { BalanseCtaSection } from "./BalanseCtaSection";
import { BalanseFaqSection } from "./BalanseFaqSection";
import { BalanseFooter } from "./BalanseFooter";
import { BalanseHero } from "./BalanseHero";

const meta = {
  title: "Marketing/Balansé blocks",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

export const LandingHero: StoryObj = {
  name: "Hero — editorial composition",
  render: () => (
    <BalanseHero
      assetId="landing-a"
      eyebrow="Cebu City · Movement, wellness, community"
      titleLines={["Find your balance.", "Choose a class and", "reserve your spot."]}
      primaryAction={{ label: "Browse this week", href: "/#schedule" }}
      secondaryAction={{ label: "Create an account", href: "/sign-up" }}
      features={[
        {
          icon: "monitor",
          title: "Book on the calendar",
          description: "Browse as a guest, then reserve\nonce you are signed in.",
        },
        {
          icon: "armchair",
          title: "Recovery is part of it",
          description: "Movement, education, and rest\nin one dedicated space.",
        },
      ]}
    />
  ),
};

export const CompactHero: StoryObj = {
  name: "Hero — compact (coaches accent)",
  render: () => (
    <BalanseHero
      assetId="coaches-c-capoeira"
      eyebrow="The roster"
      titleLines={["Meet the coaches."]}
      primaryAction={{ label: "View the schedule", href: "/#schedule" }}
      secondaryAction={{ label: "About the studio", href: "/about" }}
      align="compact"
    />
  ),
};

export const MidCtaBand: StoryObj = {
  name: "CTA band — landing mid (landing-e)",
  render: () => (
    <BalanseCtaBand blockId="landing-mid" supportingTitle="Every discipline, one room" />
  ),
};

export const AboutCtaBand: StoryObj = {
  name: "CTA band — about (about-d)",
  render: () => (
    <BalanseCtaBand
      blockId="about-band"
      supportingTitle="One space, every session"
      icon="armchair"
    />
  ),
};

export const ClosingCta: StoryObj = {
  name: "Closing CTA — quiet invitation",
  render: () => (
    <BalanseCtaSection
      blockId="landing-final"
      assetIds={["landing-d", "landing-b", "landing-c"]}
      features={[
        { icon: "sparkles", label: "Guests browse the calendar free" },
        { icon: "users", label: "Small groups, familiar coaches" },
        { icon: "workflow", label: "GCash or Pay at Counter" },
        { icon: "shield", label: "An admin confirms every booking" },
      ]}
    />
  ),
};

export const FaqSection: StoryObj = {
  name: "FAQs — faq12",
  render: () => (
    <BalanseFaqSection
      groups={FAQ_GROUPS}
      kicker="Booking, payment, waitlist, changes, walk-ins"
      title="Everything the studio gets asked"
      description="Pick a topic on the rail. Answers are canonical."
    />
  ),
};

export const SiteFooter: StoryObj = {
  name: "Footer — quiet luxury",
  render: () => <BalanseFooter year={2026} />,
};

export const SpecialtyAccentIds: StoryObj = {
  name: "Specialty accents — pass-2 inventory",
  render: () => (
    <ul className="grid grid-cols-3 gap-4 p-8 sm:grid-cols-6">
      {COACH_SPECIALTY_ACCENT_IDS.map((id) => (
        <li key={id} className="text-xs text-muted-foreground">
          {id}
        </li>
      ))}
    </ul>
  ),
};
