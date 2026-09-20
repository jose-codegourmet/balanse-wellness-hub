"use client";

import type { AdminSettings } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, Input, Label, Textarea } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { ImageUpload } from "@/components/balanse/ImageUpload";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { adminSettingsQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function SettingsPage() {
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminSettingsQuery(principal.role));
  const [settings, setSettings] = useState<AdminSettings>(query.data);
  const [newVersion, setNewVersion] = useState("2026-09");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (query.data) setSettings(query.data);
  }, [query.data]);

  return (
    <AdminPageShell className="max-w-2xl" title="Settings">
      <form
        className="mt-8 grid gap-10"
        onSubmit={(event) => {
          event.preventDefault();
          void getMockAdapter()
            .updateAdminSettings(settings)
            .then((next) => {
              setSettings(next);
              setSaved(true);
            });
        }}
      >
        <section>
          <h2 className="font-display text-2xl">Business Profile</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Name" id="biz-name">
              <Input
                id="biz-name"
                value={settings.businessName}
                onChange={(event) => setSettings({ ...settings, businessName: event.target.value })}
              />
            </Field>
            <Field label="Contact" id="biz-phone">
              <Input
                id="biz-phone"
                value={settings.contact.phone}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, phone: event.target.value },
                  })
                }
              />
            </Field>
            <Field label="Address" id="biz-address">
              <Input
                id="biz-address"
                value={settings.contact.address}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, address: event.target.value },
                  })
                }
              />
            </Field>
            <Field
              label="Opening hours"
              id="biz-hours"
              hint="Left blank. Facebook did not expose daily hours."
            >
              <Input id="biz-hours" value={settings.openingHours} readOnly />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Payment Info</h2>
          <div className="mt-4 grid gap-4">
            <Field label="GCash name" id="gcash-name">
              <Input
                id="gcash-name"
                value={settings.gcashName}
                onChange={(event) => setSettings({ ...settings, gcashName: event.target.value })}
              />
            </Field>
            <Field label="GCash number" id="gcash-number">
              <Input
                id="gcash-number"
                value={settings.gcashNumber}
                onChange={(event) => setSettings({ ...settings, gcashNumber: event.target.value })}
              />
            </Field>
            <ImageUpload
              label="GCash QR"
              fallbackLabel="No QR uploaded yet."
              onMockSubmit={async () => {
                setSettings((current) =>
                  current ? { ...current, qrImageKey: "settings/gcash-qr" } : current,
                );
              }}
            />
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Public Content</h2>
          <div className="mt-4 grid gap-4">
            <Field label="About" id="pub-about">
              <Textarea
                id="pub-about"
                value={settings.about}
                onChange={(event) => setSettings({ ...settings, about: event.target.value })}
              />
            </Field>
            <Field label="Contact" id="pub-contact">
              <Input
                id="pub-contact"
                value={settings.contact.email}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, email: event.target.value },
                  })
                }
              />
            </Field>
            <Field label="FAQs" id="pub-faq">
              <Textarea
                id="pub-faq"
                value={settings.faqs.map((faq) => `${faq.question}\n${faq.answer}`).join("\n\n")}
                onChange={(event) => {
                  const [question, ...rest] = event.target.value.split("\n");
                  setSettings({
                    ...settings,
                    faqs: [
                      {
                        id: settings.faqs[0]?.id ?? "faq-1",
                        question: question ?? "",
                        answer: rest.join("\n"),
                      },
                    ],
                  });
                }}
              />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Policies / Waivers</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {settings.policyDocuments.map((doc) => (
              <li key={doc.id}>
                {doc.documentName} · {doc.version}
                {doc.current ? " · current" : ""}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <Field label="Promote new version" id="policy-version">
              <Input
                id="policy-version"
                value={newVersion}
                onChange={(event) => setNewVersion(event.target.value)}
              />
            </Field>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void getMockAdapter().promotePolicyVersion("Waiver", newVersion).then(setSettings)
              }
            >
              Promote waiver version
            </Button>
          </div>
        </section>

        <Button type="submit">Save settings</Button>
        {saved ? <p className="text-sm">Saved in this mock.</p> : null}
      </form>
    </AdminPageShell>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
