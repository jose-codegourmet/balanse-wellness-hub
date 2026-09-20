"use client";

import type { AdminSettings } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, Field, FieldDescription, FieldLabel, Input, Textarea } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
            <Field>
              <FieldLabel htmlFor="biz-name">Name</FieldLabel>
              <Input
                id="biz-name"
                value={settings.businessName}
                onChange={(event) => setSettings({ ...settings, businessName: event.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="biz-phone">Contact</FieldLabel>
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
            <Field>
              <FieldLabel htmlFor="biz-address">Address</FieldLabel>
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
            <Field>
              <FieldLabel htmlFor="biz-hours">Opening hours</FieldLabel>
              <Input id="biz-hours" value={settings.openingHours} readOnly />
              <FieldDescription>Left blank. Facebook did not expose daily hours.</FieldDescription>
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Payment Info</h2>
          <div className="mt-4 grid gap-4">
            <Field>
              <FieldLabel htmlFor="gcash-name">GCash name</FieldLabel>
              <Input
                id="gcash-name"
                value={settings.gcashName}
                onChange={(event) => setSettings({ ...settings, gcashName: event.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="gcash-number">GCash number</FieldLabel>
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
            <Field>
              <FieldLabel htmlFor="pub-about">About</FieldLabel>
              <Textarea
                id="pub-about"
                value={settings.about}
                onChange={(event) => setSettings({ ...settings, about: event.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="pub-contact">Contact</FieldLabel>
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
            <Field>
              <FieldLabel htmlFor="pub-faq">FAQs</FieldLabel>
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
            <Field>
              <FieldLabel htmlFor="policy-version">Promote new version</FieldLabel>
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
