import { isAdminUploadPhotoKey, SIGNED_UPLOAD } from "@balanse/domain";
import type { ApiActor, ApiDeps } from "./deps";
import { ApiError } from "./errors";
import { fieldError, throwFields } from "./validation";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function mintSignedUpload(
  deps: ApiDeps,
  actor: Extract<ApiActor, { kind: "admin" }>,
  input: {
    bucket: "coach-photos" | "marketing-assets";
    purpose: "coach_photo" | "gcash_qr";
    entityId: string | null;
    contentType: string;
    allowed: ReadonlySet<string>;
    objectKey: string;
  },
) {
  if (!input.allowed.has(input.contentType)) {
    throwFields(fieldError("contentType", "invalid_format", "Unsupported image type."));
  }
  const upload = await deps.storage.createSignedUpload(input.bucket, input.objectKey, {
    contentType: input.contentType,
  });
  await deps.prisma.pendingUpload.create({
    data: {
      bucket: input.bucket,
      objectKey: input.objectKey,
      purpose: input.purpose,
      entityId: input.entityId,
      actorId: actor.staffId,
    },
  });
  return {
    upload: {
      signedUrl: upload.signedUrl,
      token: upload.token,
      path: upload.path,
      expiresIn: SIGNED_UPLOAD.expiresSeconds,
    },
    objectKey: input.objectKey,
    bucket: input.bucket,
    maxBytes: SIGNED_UPLOAD.maxBytes,
    contentTypes: [...input.allowed],
  };
}

export function extensionFor(contentType: string): string {
  return EXT[contentType] ?? "jpg";
}

export async function confirmUpload(deps: ApiDeps, objectKey: string): Promise<void> {
  await deps.prisma.pendingUpload.updateMany({
    where: { objectKey },
    data: { confirmedAt: deps.now() },
  });
}

export async function retireAdminObject(
  deps: ApiDeps,
  bucket: "coach-photos" | "marketing-assets",
  previous: string | null | undefined,
): Promise<void> {
  if (!previous) return;
  if (bucket === "coach-photos" && !isAdminUploadPhotoKey(previous)) return;
  await deps.storage.remove(bucket, [previous]);
}

export function assertOwnedCoachPhotoKey(coachId: string, objectKey: string): void {
  if (!objectKey.startsWith(`coach-photos/${coachId}/`)) {
    throw new ApiError(400, "invalid_object_key", "objectKey is not an upload for this coach.");
  }
}
