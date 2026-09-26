import { FIELD_CONSTRAINTS, manilaYmd } from "@balanse/domain";
import { z } from "zod";

const limits = FIELD_CONSTRAINTS.event;

export const eventFormSchema = z
  .object({
    sessionId: z.string().trim().min(1, "Choose a session."),
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(limits.title.max, `Use ${limits.title.max} characters or fewer.`),
    summary: z
      .string()
      .trim()
      .max(limits.summary.max, `Use ${limits.summary.max} characters or fewer.`),
    description: z
      .string()
      .trim()
      .max(limits.description.max, `Use ${limits.description.max} characters or fewer.`),
    posterImage: z
      .string()
      .trim()
      .max(limits.posterImage.max, `Use ${limits.posterImage.max} characters or fewer.`),
    galleryImages: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(
            limits.galleryImages.itemMax,
            `Use ${limits.galleryImages.itemMax} characters or fewer.`,
          ),
      )
      .max(
        limits.galleryImages.maxItems,
        `Add at most ${limits.galleryImages.maxItems} gallery images.`,
      ),
    venueName: z
      .string()
      .trim()
      .max(limits.venueName.max, `Use ${limits.venueName.max} characters or fewer.`),
    venueAddress: z
      .string()
      .trim()
      .max(limits.venueAddress.max, `Use ${limits.venueAddress.max} characters or fewer.`),
    beneficiary: z
      .string()
      .trim()
      .max(limits.beneficiary.max, `Use ${limits.beneficiary.max} characters or fewer.`),
    whatToBring: z
      .string()
      .trim()
      .max(limits.whatToBring.max, `Use ${limits.whatToBring.max} characters or fewer.`),
    internalNotes: z
      .string()
      .trim()
      .max(limits.internalNotes.max, `Use ${limits.internalNotes.max} characters or fewer.`),
    registrationOpensOn: z.string(),
    registrationOpensAtTime: z.string(),
    registrationClosesOn: z.string(),
    registrationClosesAtTime: z.string(),
  })
  .superRefine((values, ctx) => {
    requirePair(
      values.registrationOpensOn,
      values.registrationOpensAtTime,
      "registrationOpensOn",
      "registrationOpensAtTime",
      "registration open",
      ctx,
    );
    requirePair(
      values.registrationClosesOn,
      values.registrationClosesAtTime,
      "registrationClosesOn",
      "registrationClosesAtTime",
      "registration close",
      ctx,
    );
    const opens = eventInstantFromParts(values.registrationOpensOn, values.registrationOpensAtTime);
    const closes = eventInstantFromParts(
      values.registrationClosesOn,
      values.registrationClosesAtTime,
    );
    if (opens && closes && Date.parse(closes) <= Date.parse(opens)) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationClosesOn"],
        message: "Registration must close after it opens.",
      });
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export function eventInstantFromParts(ymd: string, hhmm: string): string | null {
  const date = ymd.trim();
  const time = hhmm.trim();
  if (!date || !time) return null;
  return `${date}T${time}:00+08:00`;
}

export function eventPartsFromInstant(iso: string | null): { ymd: string; hhmm: string } {
  if (!iso) return { ymd: "", hhmm: "" };
  const ymd = manilaYmd(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return { ymd, hhmm: `${hour}:${minute}` };
}

function requirePair(
  ymd: string,
  hhmm: string,
  datePath: string,
  timePath: string,
  label: string,
  ctx: z.RefinementCtx,
) {
  const hasDate = ymd.trim().length > 0;
  const hasTime = hhmm.trim().length > 0;
  if (hasDate === hasTime) return;
  ctx.addIssue({
    code: "custom",
    path: [hasDate ? timePath : datePath],
    message: `Set both the date and time for ${label}, or leave both empty.`,
  });
}
