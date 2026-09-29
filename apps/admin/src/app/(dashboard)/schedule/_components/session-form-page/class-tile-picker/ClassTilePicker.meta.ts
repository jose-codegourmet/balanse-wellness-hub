import type { AdminClass } from "@balanse/domain";

export const classTilePickerMeta = {
  purpose:
    "Pick a session's class from photo tiles that show each class's default length and price.",
  whenToUse:
    "The What section of the session form. Picking a class lets the form apply that class's default duration and price.",
  whenNotToUse: "Not for editing classes; that is /classes.",
} as const;

export type ClassTilePickerProps = {
  classes: readonly AdminClass[];
  value: string;
  onChange: (classId: string) => void;
  invalid?: boolean;
};
