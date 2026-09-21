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
import { useCallback, useEffect, useState } from "react";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/admin-page-tabs/AdminPageTabs";
import { useTabParam } from "@/components/balanse/page/useTabParam";
import { adminSettingsQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { BusinessProfileSection } from "./BusinessProfileSection";
import { PaymentInfoSection } from "./PaymentInfoSection";
import { PoliciesSection } from "./PoliciesSection";
import { PublicContentSection } from "./PublicContentSection";
import { SETTINGS_TAB_LABELS, SETTINGS_TABS } from "./settings-tabs";

export type SettingsPageProps = {
  /** Storybook / URL fallback. Live routes still prefer `?tab=`. */
  initialTab?: SettingsSection;
  /** Storybook: start a section with empty required fields. */
  emptySection?: boolean;
  /** Storybook: replace the FAQ list without mutating other fixtures. */
  faqsOverride?: { id: string; question: string; answer: string }[];
  /** Storybook: seed an invalid yyyy-mm promote value. */
  invalidPolicyVersion?: boolean;
};

export function SettingsPage({
  initialTab,
  emptySection = false,
  faqsOverride,
  invalidPolicyVersion = false,
}: SettingsPageProps) {
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminSettingsQuery(principal.role));
  const settings = query.data;
  const defaultTab = initialTab && SETTINGS_SECTIONS.includes(initialTab) ? initialTab : "business";
  const [tab, setTab] = useTabParam("tab", SETTINGS_TABS, defaultTab);
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

  function requestTab(next: SettingsSection) {
    if (next === tab) return;
    if (dirtySections(next).length > 0) {
      setPendingTab(next);
      return;
    }
    setTab(next);
  }

  function confirmTabLeave() {
    if (!pendingTab) return;
    for (const id of dirtySections(pendingTab)) bump(id);
    setTab(pendingTab);
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
      title="Settings"
      description="Each section saves on its own. Payment, public copy, and policies stay independent."
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
      <div className="mt-6 grid gap-10">
        <section id="settings-business" className={tab === "business" ? undefined : "hidden"}>
          <BusinessProfileSection
            key={`business-${epoch.business}`}
            settings={settings}
            empty={emptySection && tab === "business"}
            onDirtyChange={(next) => markDirty("business", next)}
            onSaved={() => bump("business")}
          />
        </section>
        <section id="settings-payment" className={tab === "payment" ? undefined : "hidden"}>
          <PaymentInfoSection
            key={`payment-${epoch.payment}`}
            settings={settings}
            empty={emptySection && tab === "payment"}
            onDirtyChange={(next) => markDirty("payment", next)}
            onSaved={() => bump("payment")}
          />
        </section>
        <section id="settings-content" className={tab === "content" ? undefined : "hidden"}>
          <PublicContentSection
            key={`content-${epoch.content}`}
            settings={settings}
            empty={emptySection && tab === "content"}
            faqsOverride={faqsOverride}
            onDirtyChange={(next) => markDirty("content", next)}
            onSaved={() => bump("content")}
          />
        </section>
        <section id="settings-policies" className={tab === "policies" ? undefined : "hidden"}>
          <PoliciesSection
            key={`policies-${epoch.policies}`}
            settings={settings}
            invalidVersion={invalidPolicyVersion}
            onDirtyChange={(next) => markDirty("policies", next)}
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
