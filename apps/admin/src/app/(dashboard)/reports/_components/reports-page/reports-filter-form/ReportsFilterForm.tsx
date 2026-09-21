"use client";

import type { ChoiceOption } from "@balanse/ui";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  choiceOptionFilterText,
  Label,
  NativeSelect,
} from "@balanse/ui";

type ReportClass = { id: string; name: string };

export function ReportsFilterForm({
  classes,
  coachFilterOptions,
  selectedCoachFilter,
  classId,
  coachId: _coachId,
  sessionStatus,
  onClassChange,
  onCoachChange,
  onStatusChange,
}: {
  classes: ReportClass[];
  coachFilterOptions: ChoiceOption[];
  selectedCoachFilter?: ChoiceOption;
  classId: string;
  coachId: string;
  sessionStatus: string;
  onClassChange: (value: string) => void;
  onCoachChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <form className="mt-8 grid gap-3 md:grid-cols-3">
      <div className="grid gap-1.5">
        <Label htmlFor="report-class">Class</Label>
        <NativeSelect
          id="report-class"
          value={classId}
          onChange={(event) => onClassChange(event.target.value)}
        >
          <option value="all">All classes</option>
          {classes.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="report-coach">Coach</Label>
        <Combobox
          items={coachFilterOptions}
          value={selectedCoachFilter}
          onValueChange={(next) => onCoachChange(next?.value ?? "all")}
          itemToStringLabel={(item) => choiceOptionFilterText(item)}
        >
          <ComboboxInput
            id="report-coach"
            placeholder="Search coach…"
            leading={selectedCoachFilter?.leading}
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxEmpty>No coach found.</ComboboxEmpty>
            <ComboboxList>
              <ComboboxCollection>
                {(item) => (
                  <ComboboxItem
                    key={item.value}
                    value={item}
                    leading={item.leading}
                    description={item.description}
                  >
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="report-status">Session Status</Label>
        <NativeSelect
          id="report-status"
          value={sessionStatus}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="all">All</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="CANCELLED">Cancelled</option>
        </NativeSelect>
      </div>
    </form>
  );
}
