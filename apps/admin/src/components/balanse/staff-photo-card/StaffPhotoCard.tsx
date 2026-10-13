"use client";

import {
  removeMyStaffPhoto,
  removeStaffPhoto,
  replaceMyStaffPhoto,
  replaceStaffPhoto,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { type AdminStaff, type StaffAuthorizationActor, splitFullName } from "@balanse/domain";
import { Button, UserAvatar } from "@balanse/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { useStaffActor } from "@/lib/auth/use-staff-permissions";
import { adminAuthScope } from "@/lib/query/auth-scope";
import { adminKeys } from "@/lib/query/keys";
import type { StaffPhotoCardProps } from "./StaffPhotoCard.meta";

export function StaffPhotoCard({
  staffId,
  name,
  avatarUrl,
  canEdit,
  self = false,
}: StaffPhotoCardProps) {
  const input = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const statusId = useId();
  const actor = useStaffActor();
  const scope = adminAuthScope(actor);
  const client = useQueryClient();
  const router = useRouter();

  async function save(file: File | null) {
    if (!staffId || !canEdit || inFlight.current) return;
    if (
      file &&
      (!["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size <= 0 ||
        file.size > 5 * 1024 * 1024)
    ) {
      setError(true);
      setMessage("Choose a JPG, PNG, or WEBP image up to 5 MB.");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError(false);
    setMessage(null);
    try {
      const result = self
        ? file
          ? await replaceMyStaffPhoto(apiFetchBrowser, file)
          : await removeMyStaffPhoto(apiFetchBrowser)
        : file
          ? await replaceStaffPhoto(apiFetchBrowser, staffId, file)
          : await removeStaffPhoto(apiFetchBrowser, staffId);
      if (actor?.staffId === staffId) {
        client.setQueryData<StaffAuthorizationActor>(
          [...adminKeys.all(scope), "identity"],
          (identity) => ({ ...(identity ?? actor), avatarUrl: result.avatarUrl }),
        );
      }
      client.setQueryData<AdminStaff[]>(adminKeys.staff.all(scope), (rows) =>
        rows?.map((row) => (row.id === staffId ? { ...row, avatarUrl: result.avatarUrl } : row)),
      );
      await Promise.all([
        client.invalidateQueries({ queryKey: adminKeys.staff.all(scope) }),
        client.invalidateQueries({ queryKey: [...adminKeys.all(scope), "identity"] }),
      ]);
      if (actor?.staffId === staffId) router.refresh();
      setMessage(file ? "Photo saved." : "Photo removed. Initials will be shown.");
    } catch (cause) {
      setError(true);
      setMessage(cause instanceof Error ? cause.message : "Couldn't save the photo. Try again.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="Staff photo"
      className={`${self ? "" : "my-6 "}flex flex-wrap items-center gap-5 rounded-xl border border-border/70 bg-card p-5`}
    >
      <UserAvatar
        name={splitFullName(name)}
        avatarUrl={avatarUrl}
        seed={staffId ?? "new-staff"}
        size="xl"
      />
      <div className="min-w-0 flex-1 space-y-2">
        <h2 className="font-display text-xl">Profile photo</h2>
        <p className="text-sm text-muted-foreground">
          {self
            ? "Shown in the staff directory and your navigation account menu."
            : "Shown in the staff directory and their navigation account menu."}{" "}
          Initials are used when no photo is set.
        </p>
        {!staffId ? (
          <p className="text-sm text-muted-foreground">
            Save the staff member first, then add a photo.
          </p>
        ) : canEdit ? (
          <>
            <input
              ref={input}
              type="file"
              className="sr-only"
              tabIndex={-1}
              accept="image/jpeg,image/png,image/webp"
              aria-label="Choose staff photo"
              aria-describedby={statusId}
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void save(file);
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => input.current?.click()}
              >
                <Camera aria-hidden />
                {avatarUrl ? "Replace photo" : "Upload photo"}
              </Button>
              {avatarUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => void save(null)}
                >
                  Remove photo
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or WEBP · Up to 5 MB · Saves immediately
            </p>
          </>
        ) : null}
        <p
          id={statusId}
          role="status"
          className={`text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}
        >
          {busy ? "Saving photo…" : message}
        </p>
      </div>
    </section>
  );
}
