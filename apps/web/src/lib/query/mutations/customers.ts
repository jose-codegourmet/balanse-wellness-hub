"use client";

import {
  completeMyOnboarding,
  confirmMyAvatarUpload,
  deleteMyAvatar,
  mintMyAvatarUpload,
  type OnboardingPatch,
  type PatchMyProfileInput,
  patchMe,
  saveMyOnboarding,
  skipMyOnboarding,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { CustomerProfile } from "@balanse/domain";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { webKeys } from "../keys";

function profileMutationOptions(
  customerId: string | null,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  return {
    onSuccess: (profile: CustomerProfile) => {
      queryClient.setQueryData(webKeys.me.profile(customerId), profile);
    },
  };
}

export function usePatchMe(customerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<PatchMyProfileInput>) => patchMe(apiFetchBrowser, input),
    ...profileMutationOptions(customerId, queryClient),
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, encoded] = dataUrl.split(",", 2);
  const match = /^data:([^;]+);base64$/.exec(header ?? "");
  if (!match || !encoded) throw new Error("The cropped image could not be read.");
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: match[1] });
}

export function useSaveMyAvatar(customerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dataUrl: string) => {
      const image = dataUrlToBlob(dataUrl);
      const intent = await mintMyAvatarUpload(apiFetchBrowser, image.type);
      const response = await fetch(intent.upload.signedUrl, {
        method: "PUT",
        headers: { "content-type": image.type },
        body: image,
      });
      if (!response.ok) throw new Error("We couldn't upload that photo. Try again.");
      return confirmMyAvatarUpload(apiFetchBrowser, intent.objectKey);
    },
    ...profileMutationOptions(customerId, queryClient),
  });
}

export function useDeleteMyAvatar(customerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteMyAvatar(apiFetchBrowser),
    ...profileMutationOptions(customerId, queryClient),
  });
}

export function useSaveMyOnboarding(customerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: OnboardingPatch) => saveMyOnboarding(apiFetchBrowser, patch),
    onSuccess: (data) => queryClient.setQueryData(webKeys.me.onboarding(customerId), data),
  });
}
export function useCompleteMyOnboarding(customerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => completeMyOnboarding(apiFetchBrowser),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: webKeys.me.profile(customerId) }),
        queryClient.invalidateQueries({ queryKey: webKeys.me.onboarding(customerId) }),
      ]),
  });
}
export function useSkipMyOnboarding(customerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => skipMyOnboarding(apiFetchBrowser),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: webKeys.me.profile(customerId) }),
        queryClient.invalidateQueries({ queryKey: webKeys.me.onboarding(customerId) }),
      ]),
  });
}
