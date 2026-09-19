import { CONTACT_DETAILS } from "@balanse/domain";
import { MarketingImage } from "@balanse/ui";
import { ContactForm } from "./ContactForm";

export function ContactPage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h1 className="font-display text-3xl">Contact Balansé</h1>
          <p className="mt-3 text-muted-foreground">
            Studio details for finding us. Reservations stay on the calendar — these channels are
            not a booking inbox.
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>
                <a className="underline underline-offset-4" href={`tel:${CONTACT_DETAILS.phone}`}>
                  {CONTACT_DETAILS.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a
                  className="underline underline-offset-4"
                  href={`mailto:${CONTACT_DETAILS.email}`}
                >
                  {CONTACT_DETAILS.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Socials</dt>
              <dd className="space-x-3">
                <a
                  className="underline underline-offset-4"
                  href={CONTACT_DETAILS.instagramHref}
                  rel="noreferrer"
                >
                  Instagram {CONTACT_DETAILS.instagram}
                </a>
                <a
                  className="underline underline-offset-4"
                  href={CONTACT_DETAILS.tiktokHref}
                  rel="noreferrer"
                >
                  TikTok {CONTACT_DETAILS.tiktok}
                </a>
                <a
                  className="underline underline-offset-4"
                  href={CONTACT_DETAILS.messengerHref}
                  rel="noreferrer"
                >
                  {CONTACT_DETAILS.messenger}
                </a>
                <a
                  className="underline underline-offset-4"
                  href={CONTACT_DETAILS.whatsappHref}
                  rel="noreferrer"
                >
                  WhatsApp {CONTACT_DETAILS.whatsapp}
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <MarketingImage assetId="contact-a" />
          <h2 className="mt-6 font-display text-2xl">Location</h2>
          <p className="mt-2 text-sm">{CONTACT_DETAILS.address}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Opening hours are not published yet. Do not treat this page as a reservation desk.
          </p>
          <a
            className="mt-3 inline-block text-sm underline underline-offset-4"
            href={CONTACT_DETAILS.mapHref}
            rel="noreferrer"
          >
            Open address in Maps
          </a>
        </div>
      </div>

      <section className="mt-14 grid gap-6 md:grid-cols-[14rem_1fr]">
        <MarketingImage assetId="contact-b" />
        <div>
          <h2 className="font-display text-2xl">Walking in?</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Scan the Balansé QR, sign in or create an account, then reserve through the same booking
            calendar. Walking in does not open a side channel by phone, WhatsApp, or message.
          </p>
        </div>
      </section>

      <section className="mt-14 max-w-xl">
        <h2 className="font-display text-2xl">Send a message</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Optional mock form. It does not book a class and does not call a server.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </section>
    </article>
  );
}
