/**
 * BE-052 signed-upload PUT step (WIRE-0602, #359). This goes straight to
 * Supabase Storage's signed URL, never through `/api/*` — not an `ApiFetcher`
 * call.
 */
export async function putSignedUpload(
  signedUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(signedUrl, {
    method: "PUT",
    headers: { "content-type": contentType },
    body: file,
  });
  if (!response.ok) {
    throw new Error("The upload failed. Try again.");
  }
}
