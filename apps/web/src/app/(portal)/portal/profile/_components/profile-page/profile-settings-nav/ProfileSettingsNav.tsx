"use client";

import { CUSTOMER_PROFILE_SECTIONS, type CustomerProfileSectionId } from "@balanse/domain";
import { FileCheck2, KeyRound, Lock, UserRound } from "lucide-react";
import Link from "next/link";

const icons = {
  basic: UserRound,
  account: KeyRound,
  password: Lock,
  policies: FileCheck2,
};

/**
 * The profile submenu (FE-CUS-017). Each entry is a real route so a section can
 * be linked, refreshed, and reached with the browser back button. The active
 * entry comes from the route rather than `usePathname()` so Storybook renders
 * the same active state the app does.
 */
export function ProfileSettingsNav({ activeSection }: { activeSection: CustomerProfileSectionId }) {
  return (
    <nav className="profile-submenu" aria-label="Profile settings">
      <ul>
        {CUSTOMER_PROFILE_SECTIONS.map((section) => {
          const Icon = icons[section.id];
          return (
            <li key={section.id}>
              <Link
                href={section.href}
                aria-current={section.id === activeSection ? "page" : undefined}
              >
                <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                <span>{section.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
