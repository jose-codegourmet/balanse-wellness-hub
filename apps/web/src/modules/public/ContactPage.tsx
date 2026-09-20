import { CONTACT_DETAILS, PUBLIC_SOCIAL_LINKS } from "@balanse/domain";
import { MarketingImage, SectionHeading } from "@balanse/ui";
import { CalendarClock, Mail, MapPin, Phone } from "lucide-react";
import { BalanseHero } from "@/components/balanse/marketing/BalanseHero";
import { Button } from "@/components/jabkit/button";
import { ContactForm } from "./ContactForm";
import "./contact-page.css";

const DIRECT_CHANNELS = [
  {
    id: "phone",
    label: "Phone",
    icon: Phone,
    value: CONTACT_DETAILS.phone,
    href: `tel:${CONTACT_DETAILS.phone}`,
    note: "Studio questions during opening hours.",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    value: CONTACT_DETAILS.email,
    href: `mailto:${CONTACT_DETAILS.email}`,
    note: "Workshops, partnerships, and anything longer.",
  },
] as const;

/**
 * Contact (FE-PUB-007). The content contract is fixed by
 * `docs/screen-specs/public/03-contact.md`: channels, location, socials,
 * walk-ins, then the optional form. The guardrail — these channels answer
 * questions and never take a reservation — is repeated at every block on
 * purpose, because it is the whole point of the page.
 */
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

      <div className="contact-page marketing-container">
        <section className="contact-section" aria-labelledby="contact-channels">
          <SectionHeading
            id="contact-channels"
            eyebrow="Reach the studio"
            title="Contact details"
            description="Phone and email for questions about classes, workshops, and the space itself."
          />
          <div className="contact-section-body">
            <ul className="contact-grid">
              {DIRECT_CHANNELS.map((channel) => {
                const Icon = channel.icon;
                return (
                  <li key={channel.id}>
                    <a className="contact-card" href={channel.href}>
                      <span className="contact-card-label">
                        <Icon size={14} strokeWidth={1.75} aria-hidden="true" /> {channel.label}
                      </span>
                      <span className="contact-card-value">{channel.value}</span>
                      <span className="contact-card-note">{channel.note}</span>
                    </a>
                  </li>
                );
              })}
              <li>
                <div className="contact-card">
                  <span className="contact-card-label">
                    <MapPin size={14} strokeWidth={1.75} aria-hidden="true" /> Location
                  </span>
                  <span className="contact-card-value">{CONTACT_DETAILS.address}</span>
                  {/* `CONTACT_DETAILS` carries no opening hours, so the page
                      says so rather than inventing a schedule. */}
                  <span className="contact-card-note">
                    <CalendarClock
                      size={13}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="mr-1.5 inline align-[-2px]"
                    />
                    Opening hours are not published yet. Do not treat this page as a reservation
                    desk.
                  </span>
                  <span className="contact-card-action">
                    <Button asChild variant="secondary">
                      <a href={CONTACT_DETAILS.mapHref} rel="noreferrer" target="_blank">
                        Open address in Maps
                      </a>
                    </Button>
                  </span>
                </div>
              </li>
            </ul>

            <h3 className="contact-subheading">Socials</h3>
            <ul className="contact-socials">
              {PUBLIC_SOCIAL_LINKS.map((social) => (
                <li key={social.id}>
                  <a className="contact-social" href={social.href} rel="noreferrer" target="_blank">
                    <span className="font-medium">{social.label}</span>
                    <span>{social.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="contact-section" aria-labelledby="contact-walk-ins">
          <div className="contact-split">
            <MarketingImage assetId="contact-b" className="contact-split-media" />
            <div className="contact-card">
              <SectionHeading
                id="contact-walk-ins"
                eyebrow="Walk-ins"
                title="Walking in?"
                description="Scan the Balansé QR, sign in or create an account, then reserve through the same booking calendar."
              />
              <p className="contact-guardrail">
                <MapPin size={15} strokeWidth={1.75} aria-hidden="true" />
                Walking in does not open a side channel by phone, WhatsApp, or message.
              </p>
            </div>
          </div>
        </section>

        <section className="contact-section" aria-labelledby="contact-message">
          <div className="contact-card contact-form-card">
            <div className="contact-form-aside">
              <SectionHeading
                id="contact-message"
                eyebrow="Questions"
                title="Send a message"
                description="This form reaches the studio for questions. It does not book a class."
              />
              <p>
                Replies come by email. If you want a spot in a class, use the schedule — it is the
                only place a reservation is recorded.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </div>
    </article>
  );
}
