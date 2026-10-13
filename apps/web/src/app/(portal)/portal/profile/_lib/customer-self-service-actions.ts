"use server";

import {
  confirmMyAvatarUpload,
  deleteMyAvatar,
  mintMyAvatarUpload,
  patchMe,
} from "@balanse/api-client";
import type { CustomerProfile, CustomerProfilePatch } from "@balanse/domain";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCustomerAccessToken, getSessionUser } from "@/modules/session/current-customer";
import type { ActionResult } from "./customer-self-service.types";

async function run<T>(
  work: (fetcher: ReturnType<typeof serverFetcher>) => Promise<T>,
): Promise<ActionResult<T>> {
  if (!(await getSessionUser())) return { ok: false, error: "Sign in to update your profile." };
  try {
    return { ok: true, value: await work(serverFetcher(await getCustomerAccessToken())) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong. Try again.",
    };
  }
}

export async function patchMyProfileAction(
  patch: CustomerProfilePatch,
): Promise<ActionResult<CustomerProfile>> {
  const { email: _email, ...allowed } = patch;
  return run((fetcher) => patchMe(fetcher, allowed));
}

export async function setMyAvatarAction(
  avatar: { dataUrl: string } | null,
): Promise<ActionResult<CustomerProfile>> {
  if (!avatar) return run((fetcher) => deleteMyAvatar(fetcher));
  return run(async (fetcher) => {
    const [header, encoded] = avatar.dataUrl.split(",", 2);
    const contentType = /^data:([^;]+);base64$/.exec(header ?? "")?.[1];
    if (!contentType || !encoded) throw new Error("The cropped image could not be read.");
    const intent = await mintMyAvatarUpload(fetcher, contentType);
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const uploaded = await fetch(intent.upload.signedUrl, {
      method: "PUT",
      headers: { "content-type": contentType },
      body: bytes,
    });
    if (!uploaded.ok) throw new Error("We couldn't upload that photo. Try again.");
    return confirmMyAvatarUpload(fetcher, intent.objectKey);
  });
}
