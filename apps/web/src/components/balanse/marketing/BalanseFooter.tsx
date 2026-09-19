"use client";

import {
  CONTACT_DETAILS,
  PUBLIC_FOOTER_COLUMNS,
  PUBLIC_FOOTER_NOTE,
  PUBLIC_SOCIAL_LINKS,
  type PublicSocialLink,
  publicFooterYear,
} from "@balanse/domain";
import { Footer16 } from "@/components/jabkit/footer-16";
import type { Footer16SocialLink } from "@/components/jabkit/footer-16/Footer16.types";
import { marketingSlotSrc } from "./asset-src";

const SOCIAL_KIND: Partial<Record<PublicSocialLink["id"], Footer16SocialLink["kind"]>> = {
  instagram: "instagram",
  messenger: "facebook",
};

function TikTokGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1em]" fill="currentColor" aria-hidden="true">
      <title>TikTok</title>
      <path d="M16.5 3h-2.6v12.1a2.3 2.3 0 1 1-2.3-2.3c.2 0 .4 0 .6.1v-2.7a5 5 0 1 0 4.3 5V9.1a6.3 6.3 0 0 0 3.5 1.1V7.6a3.7 3.7 0 0 1-3.5-3.7V3Z" />
    </svg>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1em]" fill="currentColor" aria-hidden="true">
      <title>WhatsApp</title>
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Zm0 1.7a7.3 7.3 0 1 1-3.7 13.6l-.3-.2-2.7.7.7-2.6-.2-.3A7.3 7.3 0 0 1 12 4.7Zm-3.3 3.6c-.2 0-.4 0-.6.3-.2.2-.7.7-.7 1.7s.7 2 .8 2.1c.1.2 1.4 2.3 3.5 3.1 1.7.7 2.1.6 2.5.5.4 0 1.2-.5 1.4-1 .2-.5.2-1 .1-1.1l-.5-.3-1.3-.6c-.2 0-.3-.1-.5.1l-.6.8c-.1.2-.3.2-.5.1a5.9 5.9 0 0 1-2.9-2.5c-.2-.3 0-.5.1-.6l.4-.5.2-.4v-.4l-.6-1.4c-.1-.4-.3-.3-.4-.3h-.4Z" />
    </svg>
  );
}

const SOCIAL_ICON: Partial<Record<PublicSocialLink["id"], React.ReactNode>> = {
  tiktok: <TikTokGlyph />,
  whatsapp: <WhatsAppGlyph />,
};

function BalanseMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 text-accent" fill="none" aria-hidden="true">
      <title>Balansé mark</title>
      <path d="M16 4c-5 3-8 7.5-8 12s3 9 8 12" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 4c5 3 8 7.5 8 12s-3 9-8 12" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 16h24" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

/**
 * Public-site footer built on Jabkit `footer-16`, wired to the domain footer
 * catalog and a real marketing photo. The portal keeps the compact
 * `@balanse/ui` footer — this cinematic close belongs to marketing pages.
 */
export function BalanseFooter({ year = publicFooterYear() }: { year?: number }) {
  const socialLinks: Footer16SocialLink[] = PUBLIC_SOCIAL_LINKS.map((social) => ({
    label: `${social.label} ${social.handle}`,
    href: social.href,
    kind: SOCIAL_KIND[social.id],
    icon: SOCIAL_ICON[social.id],
  }));

  return (
    <Footer16
      data-section="footer"
      brandName="Balansé"
      brandHref="/"
      brandLogo={<BalanseMark />}
      tagline={PUBLIC_FOOTER_NOTE}
      linkColumns={PUBLIC_FOOTER_COLUMNS.map((column) => ({
        title: column.title,
        links: column.links.map((item) => ({ label: item.label, href: item.href })),
      }))}
      legalLinks={[
        { label: CONTACT_DETAILS.address, href: CONTACT_DETAILS.mapHref },
        { label: CONTACT_DETAILS.email, href: `mailto:${CONTACT_DETAILS.email}` },
        { label: CONTACT_DETAILS.phone, href: `tel:${CONTACT_DETAILS.phone}` },
      ]}
      socialLinks={socialLinks}
      copyright={`© ${year} Balansé Wellness Hub · Cebu City`}
      backgroundImage={marketingSlotSrc("about-c")}
      className="mt-auto [&_.jk-footer16-word_svg]:opacity-90"
    />
  );
}
