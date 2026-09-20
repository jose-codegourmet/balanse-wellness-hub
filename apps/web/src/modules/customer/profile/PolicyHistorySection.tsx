"use client";

import type { PolicyAcceptance } from "@balanse/domain";
import { formatSessionDate } from "@balanse/domain";
import { Check, FileCheck2 } from "lucide-react";

/** Accepted document history. Required by FE-CUS-005, so it keeps its own destination. */
export function PolicyHistorySection({ acceptances }: { acceptances: PolicyAcceptance[] }) {
  return (
    <section data-section="policy-history" className="profile-panel">
      <div className="profile-section-title">
        <FileCheck2 size={21} strokeWidth={1.5} aria-hidden="true" />
        <h2 className="font-display">Policies &amp; waivers</h2>
      </div>
      <p className="profile-description">A record of the documents you’ve accepted.</p>
      {acceptances.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No accepted versions recorded yet.</p>
      ) : (
        <ul className="profile-policy-list">
          {acceptances.map((row) => (
            <li key={`${row.documentName}-${row.version}`}>
              <Check size={16} aria-hidden="true" />
              <div>
                <strong>{row.documentName}</strong>
                <span>
                  {row.version} · Accepted {formatSessionDate(row.acceptedAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
