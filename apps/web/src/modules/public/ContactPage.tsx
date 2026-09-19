import { CONTACT_DETAILS, PUBLIC_SOCIAL_LINKS } from "@balanse/domain";
import { MarketingImage, SectionHeading } from "@balanse/ui";
import { BalanseHero } from "@/components/balanse/marketing/BalanseHero";
import { ContactForm } from "./ContactForm";

const DIRECT_CHANNELS = [
  {
    id: "phone",
    label: "Phone",
    value: CONTACT_DETAILS.phone,
    href: `tel:${CONTACT_DETAILS.phone}`,
    note: "Studio questions during opening hours.",
  },
  {
    id: "email",
    label: "Email",
    value: CONTACT_DETAILS.email,
    href: `mailto:${CONTACT_DETAILS.email}`,
    note: "Workshops, partnerships, and anything longer.",
  },
] as const;

export function ContactPage() {
  return (
    <article>
      <BalanseHero
        assetId="contact-a"
        eyebrow="Say hello"
        titleLines={["Contact Balansé."]}
        primaryAction={{ label: "Open address in Maps", href: CONTACT_DETAILS.mapHref }}
        secondaryAction={{ label: "View the schedule", href: "/#schedule" }}
        align="compact"
        features={[
          {
            icon: "monitor",
            title: "Reservations stay on the calendar",
            description: "These channels answer questions.\nThey are not a booking inbox.",
          },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pt-12 md:pt-16">
        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <section aria-labelledby="contact-channels">
            <h2 id="contact-channels" className="sr-only">
              Contact channels
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {DIRECT_CHANNELS.map((channel) => (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    className="flex h-full flex-col rounded-xl border border-[var(--balanse-tan)]/50 bg-card p-5 transition-colors hover:border-accent hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[var(--balanse-gold-deep)]">
                      {channel.label}
                    </span>
                    <span className="mt-2 font-medium break-words">{channel.value}</span>
                    <span className="mt-2 text-sm text-muted-foreground">{channel.note}</span>
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[var(--balanse-gold-deep)]">
              Socials
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {PUBLIC_SOCIAL_LINKS.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.href}
                    rel="noreferrer"
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--balanse-tan)]/60 bg-card px-4 py-2 text-sm transition-colors hover:border-accent hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="font-medium">{social.label}</span>
                    <span className="text-muted-foreground">{social.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="contact-location"
            className="rounded-2xl border border-[var(--balanse-tan)]/50 bg-card p-6 md:p-8"
          >
            <SectionHeading
              id="contact-location"
              eyebrow="Find the studio"
              title="Location"
              description={CONTACT_DETAILS.address}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Opening hours are not published yet. Do not treat this page as a reservation desk.
            </p>
            <a
              className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              href={CONTACT_DETAILS.mapHref}
              rel="noreferrer"
              target="_blank"
            >
              Open address in Maps
            </a>
          </section>
        </div>

        <section className="mt-14 md:mt-20">
          <div className="grid gap-8 md:grid-cols-[16rem_1fr] md:items-center">
            <MarketingImage assetId="contact-b" />
            <div>
              <SectionHeading
                eyebrow="Walk-ins"
                title="Walking in?"
                description="Scan the Balansé QR, sign in or create an account, then reserve through the same booking calendar. Walking in does not open a side channel by phone, WhatsApp, or message."
              />
            </div>
          </div>
        </section>

        <section className="mt-14 mb-16 max-w-xl md:mt-20 md:mb-24">
          <SectionHeading
            eyebrow="Questions"
            title="Send a message"
            description="This form reaches the studio for questions. It does not book a class."
          />
          <div className="mt-6">
            <ContactForm />
          </div>
        </section>
      </div>
    </article>
  );
}
