export const classImagesInputMeta = {
  purpose:
    "Upload input for a class cover (multiple=false) or gallery (up to 12). Each file goes through POST /api/admin/class-images (mint → signed PUT → confirm) as soon as it is picked; the field value is the list of public HTTPS URLs.",
  api: "Controlled `value: string[]` / `onChange`. `multiple` defaults to true (gallery). Cover callers wrap a single string into a one-item array.",
  aspectRatio:
    "Shows a recommended 16:9 landscape, ≥1920×1080 hint (CLASS_IMAGE_ASPECT). Advisory only: any ratio uploads; off-ratio images get a soft 'may be cropped' note.",
  whenToUse: "Class editor cover and gallery fields.",
  whenNotToUse:
    "Event media (EventImageTile defers upload until the event has an id) or coach photos (CoachPhotoField).",
} as const;
