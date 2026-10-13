"use client";

import type { CustomerProfile } from "@balanse/domain";
import { PROFILE_FIELDS_NOTE } from "@balanse/domain";
import { CircleAlert, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { AvatarUploader } from "@/components/balanse/avatar-uploader/AvatarUploader";
import { useDeleteMyAvatar, usePatchMe, useSaveMyAvatar } from "@/lib/query/mutations/customers";
import type { CustomerProfileActions } from "../../../_lib/customer-self-service.types";
import { BasicProfileForm } from "./basic-profile-form/BasicProfileForm";
import { RosterVisibilitySetting } from "./roster-visibility-setting/RosterVisibilitySetting";

export type BasicProfileSectionProps = {
  profile: CustomerProfile;
  onSaved: (next: CustomerProfile) => void;
  actions: CustomerProfileActions;
  forcedStatus?: "saving" | "failed";
};

export function BasicProfileSection({
  profile,
  onSaved,
  actions,
  forcedStatus,
}: BasicProfileSectionProps) {
  const router = useRouter();
  const patchProfile = usePatchMe(profile.id);
  const saveAvatar = useSaveMyAvatar(profile.id);
  const deleteAvatar = useDeleteMyAvatar(profile.id);

  /** Saved identity also lives in the server-rendered portal header. */
  function saved(next: CustomerProfile) {
    onSaved(next);
    router.refresh();
  }

  return (
    <section data-section="profile" className="profile-panel">
      <div className="profile-section-title">
        <UserRound size={21} strokeWidth={1.5} aria-hidden="true" />
        <h2 className="font-display">Basic profile</h2>
      </div>
      <p className="profile-description">We’ll use these details for your class bookings.</p>
      <p className="sr-only">{PROFILE_FIELDS_NOTE}</p>

      {profile.lastName.trim() ? null : (
        <p
          role="status"
          className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Add your last name to complete your profile.
        </p>
      )}

      <div className="mt-6 grid gap-2">
        <h3 className="text-xs font-semibold tracking-[0.12em] uppercase">Photo</h3>
        <AvatarUploader
          name={{ firstName: profile.firstName, lastName: profile.lastName }}
          avatarUrl={profile.avatarUrl}
          seed={profile.id}
          onSave={async (dataUrl) => {
            try {
              saved(await saveAvatar.mutateAsync(dataUrl));
              return null;
            } catch (error) {
              return error instanceof Error ? error.message : "We couldn't save that photo.";
            }
          }}
          onRemove={async () => {
            try {
              saved(await deleteAvatar.mutateAsync());
              return null;
            } catch (error) {
              return error instanceof Error ? error.message : "We couldn't remove that photo.";
            }
          }}
        />
      </div>

      <BasicProfileForm
        profile={profile}
        onSave={async (patch) => {
          try {
            return { ok: true, value: await patchProfile.mutateAsync(patch) };
          } catch (error) {
            return {
              ok: false as const,
              error: error instanceof Error ? error.message : "We couldn't save your profile.",
            };
          }
        }}
        onSaved={saved}
        forcedStatus={forcedStatus}
      />

      <RosterVisibilitySetting
        checked={profile.showOnPublicRoster}
        onChange={async (showOnPublicRoster) => {
          try {
            onSaved(await patchProfile.mutateAsync({ showOnPublicRoster }));
            return null;
          } catch (error) {
            return error instanceof Error ? error.message : "We couldn't save your roster setting.";
          }
        }}
      />
    </section>
  );
}
