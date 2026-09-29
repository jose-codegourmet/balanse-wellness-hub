export const eventImageTileMeta = {
  purpose:
    "Compact click-or-drop image slot for event posters and gallery images. Validates the file in the browser and hands it to the parent, which mints the pending upload token.",
  whenToUse:
    "Use in the event composer's Look step. The parent keeps the token in the form and an object URL for local preview.",
  whenNotToUse:
    "Do not use for coach photos or class covers (ImageUpload / ImageBinding). It makes no network request and does not store assets.",
} as const;

export type EventImageTileProps = {
  /** Accessible name for the empty slot, e.g. "Add poster". */
  label: string;
  /** Stored value: a public path, URL, or `pending:*` token. Empty string means no image. */
  value: string;
  /** Displayable URL for `value`, when this browser can show it. */
  src: string | null;
  aspect: "poster" | "square";
  onPick: (file: File) => void;
  onRemove?: () => void;
  invalid?: boolean;
  className?: string;
};
