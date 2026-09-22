"use client";

import { SETTINGS_SECTIONS, type SettingsSection } from "@balanse/domain";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpenText, Building2, CircleHelp, FileText, Mail, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentType, useCallback, useEffect, useState } from "react";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/admin-page-tabs/AdminPageTabs";
import { useTabParam } from "@/components/balanse/page/useTabParam";
import { adminSettingsQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { SETTINGS_TAB_LABELS, SETTINGS_TABS } from "../../_lib/settings-tabs";
import { BusinessProfileSection } from "../business-profile-section/BusinessProfileSection";
import { PaymentInfoSection } from "../payment-info-section/PaymentInfoSection";
import { PoliciesSection } from "../policies-section/PoliciesSection";
import { PublicContentSection } from "../public-content-section/PublicContentSection";

const CONTENT_PAGES = [
  { id: "overview", label: "Overview", icon: BookOpenText },
  { id: "about", label: "About page", icon: FileText },
  { id: "contact", label: "Contact details", icon: Mail },
  { id: "faqs", label: "FAQs", icon: CircleHelp },
] as const;
const POLICY_PAGES = [
  { id: "library", label: "Policy library", icon: Building2 },
  { id: "new", label: "New policy", icon: Plus },
] as const;

export type ContentPage = (typeof CONTENT_PAGES)[number]["id"];
export type PolicyPage = (typeof POLICY_PAGES)[number]["id"];

export type SettingsPageProps = {
  /** Storybook / URL fallback. Live routes still prefer `?tab=`. */
  initialTab?: SettingsSection;
  /** Storybook: start a section with empty required fields. */
  emptySection?: boolean;
  /** Storybook: replace the FAQ list without mutating other fixtures. */
  faqsOverride?: { id: string; question: string; answer: string }[];
  /** Storybook: seed an invalid yyyy-mm promote value. */
  invalidPolicyVersion?: boolean;
  /** Route-backed public-content subpage. */
  contentPage?: ContentPage;
  /** Route-backed policy subpage. */
  policyPage?: PolicyPage;
  /** Route-backed policy editor target. */
  policyId?: string;
};

function SettingsSubnav<T extends string>({
  pages,
  active,
  base,
  label,
}: {
  pages: readonly { id: T; label: string; icon: ComponentType<{ className?: string }> }[];
  active: T;
  base: string;
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className="mb-8 overflow-x-auto rounded-2xl border border-border/70 bg-card/75 p-1.5 shadow-[0_14px_35px_-28px_color-mix(in_oklab,var(--foreground)_45%,transparent)] backdrop-blur"
    >
      <div className="flex min-w-max items-center gap-1">
        {pages.map((page) => {
          const Icon = page.icon;
          const href =
            page.id === "overview" || page.id === "library"
              ? base
              : `${base}/${page.id === "about" ? "about-page" : page.id}`;
          return (
            <Link
              key={page.id}
              href={href}
              aria-current={page.id === active ? "page" : undefined}
              className={
                page.id === active
                  ? "inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
                  : "inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              }
            >
              <Icon className="size-4" aria-hidden />
              {page.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SettingsPage({
  initialTab,
  emptySection = false,
  faqsOverride,
  invalidPolicyVersion = false,
  contentPage: contentPageProp = "overview",
  policyPage: policyPageProp = "library",
  policyId,
}: SettingsPageProps) {
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminSettingsQuery(principal));
  const settings = query.data;
  const defaultTab = initialTab && SETTINGS_SECTIONS.includes(initialTab) ? initialTab : "business";
  const [tab, setTab] = useTabParam("tab", SETTINGS_TABS, defaultTab);
  const router = useRouter();
  const pathname = usePathname();
  const contentPage = contentPageProp;
  const policyPage = policyPageProp;
  const [dirty, setDirty] = useState<Record<SettingsSection, boolean>>({
    business: false,
    payment: false,
    content: false,
    policies: false,
  });
  const [epoch, setEpoch] = useState<Record<SettingsSection, number>>({
    business: 0,
    payment: 0,
    content: 0,
    policies: 0,
  });
  const [pendingTab, setPendingTab] = useState<SettingsSection | null>(null);

  const contentTitle =
    contentPage === "overview"
      ? "Public content"
      : (CONTENT_PAGES.find((page) => page.id === contentPage)?.label ?? "Public content");
  const pageTitle = tab === "content" ? contentTitle : "Settings";
  const pageDescription =
    tab === "content"
      ? contentPage === "overview"
        ? "Manage the stories and practical details customers see before they book."
        : "Edit this public page, review its live destination, and publish when the copy is ready."
      : "Each section saves on its own. Payment, public copy, and policies stay independent.";

  const markDirty = useCallback((id: SettingsSection, next: boolean) => {
    setDirty((current) => (current[id] === next ? current : { ...current, [id]: next }));
  }, []);

  const bump = useCallback((id: SettingsSection) => {
    setEpoch((current) => ({ ...current, [id]: current[id] + 1 }));
    setDirty((current) => ({ ...current, [id]: false }));
  }, []);

  function dirtySections(except?: SettingsSection) {
    return SETTINGS_SECTIONS.filter((id) => dirty[id] && id !== except);
  }

  function destinationForTab(next: SettingsSection) {
    if (next === "content") return "/settings/content";
    if (next === "policies") return "/settings/policies";
    return next === "business" ? "/settings" : `/settings?tab=${next}`;
  }

  function requestTab(next: SettingsSection) {
    if (next === tab) return;
    if (dirtySections(next).length > 0) {
      setPendingTab(next);
      return;
    }
    const destination = destinationForTab(next);
    if (destination === pathname) return;
    if (next === "content" || next === "policies" || pathname.startsWith("/settings/"))
      router.push(destination);
    else setTab(next);
  }

  function confirmTabLeave() {
    if (!pendingTab) return;
    for (const id of dirtySections(pendingTab)) bump(id);
    const destination = destinationForTab(pendingTab);
    if (pendingTab === "content" || pendingTab === "policies" || pathname.startsWith("/settings/"))
      router.push(destination);
    else setTab(pendingTab);
    setPendingTab(null);
  }

  useEffect(() => {
    const raw = window.location.hash.replace(/^#settings-/, "");
    if (SETTINGS_SECTIONS.includes(raw as SettingsSection)) {
      setTab(raw as SettingsSection);
    }
  }, [setTab]);

  return (
    <AdminPageShell
      title={pageTitle}
      description={pageDescription}
      eyebrow={tab === "content" ? "Website settings" : undefined}
      tabs={
        <AdminPageTabs
          tabs={SETTINGS_TABS}
          value={tab}
          onValueChange={(next) => requestTab(next as SettingsSection)}
          mobileBehavior="tabs"
          label="Settings sections"
        />
      }
    >
      <div className="mt-6 grid min-w-0 gap-10">
        <section id="settings-business" className={tab === "business" ? "min-w-0" : "hidden"}>
          <BusinessProfileSection
            key={`business-${epoch.business}`}
            settings={settings}
            empty={emptySection && tab === "business"}
            onDirtyChange={(next) => markDirty("business", next)}
            onSaved={() => bump("business")}
          />
        </section>
        <section id="settings-payment" className={tab === "payment" ? "min-w-0" : "hidden"}>
          <PaymentInfoSection
            key={`payment-${epoch.payment}`}
            settings={settings}
            empty={emptySection && tab === "payment"}
            onDirtyChange={(next) => markDirty("payment", next)}
            onSaved={() => bump("payment")}
          />
        </section>
        <section id="settings-content" className={tab === "content" ? "min-w-0" : "hidden"}>
          <SettingsSubnav
            pages={CONTENT_PAGES}
            active={contentPage}
            base="/settings/content"
            label="Public content pages"
          />
          <PublicContentSection
            key={`content-${epoch.content}`}
            settings={settings}
            empty={emptySection && tab === "content"}
            faqsOverride={faqsOverride}
            onDirtyChange={(next) => markDirty("content", next)}
            page={contentPage === "overview" ? "all" : contentPage}
            onSaved={() => bump("content")}
          />
        </section>
        <section id="settings-policies" className={tab === "policies" ? "min-w-0" : "hidden"}>
          <SettingsSubnav
            pages={POLICY_PAGES}
            active={policyPage}
            base="/settings/policies"
            label="Policy pages"
          />
          <PoliciesSection
            key={`policies-${epoch.policies}`}
            settings={settings}
            invalidVersion={invalidPolicyVersion}
            onDirtyChange={(next) => markDirty("policies", next)}
            view={policyPage}
            policyId={policyId}
            onSaved={() => bump("policies")}
          />
        </section>
      </div>

      <AlertDialog open={pendingTab !== null} onOpenChange={(open) => !open && setPendingTab(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes
              {dirtySections(pendingTab ?? undefined)
                .map((id) => ` in ${SETTINGS_TAB_LABELS[id]}`)
                .join("")}
              . Switch sections and those edits are lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTabLeave}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageShell>
  );
}
