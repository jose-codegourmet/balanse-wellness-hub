"use client";

import { ApiError } from "@balanse/api-client";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  NativeSelect,
  NativeSelectOption,
} from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2 } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { useLinkCoachToStaff } from "@/lib/query/mutations";
import { notify } from "@/modules/notifications/notify";
import { coachLinkStaffDefaultValues } from "./CoachLinkStaff.defaults";
import type { CoachLinkStaffProps } from "./CoachLinkStaff.meta";
import { type CoachLinkStaffValues, coachLinkStaffSchema } from "./CoachLinkStaff.schema";

export function CoachLinkStaff({ coachId, coachName, staff }: CoachLinkStaffProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const link = useLinkCoachToStaff();
  const form = useForm<CoachLinkStaffValues>({
    resolver: zodResolver(coachLinkStaffSchema),
    defaultValues: coachLinkStaffDefaultValues,
  });
  const available = staff.filter((row) => row.status === "active" && !row.coachId);
  const error = form.formState.errors.staffId?.message;

  const submit = form.handleSubmit(async ({ staffId }) => {
    try {
      await link.mutateAsync({ staffId, coachId });
      notify.admin("coach.saved");
      setOpen(false);
      form.reset(coachLinkStaffDefaultValues);
    } catch (cause) {
      form.setError("staffId", {
        message:
          cause instanceof ApiError ? cause.message : "The coach could not be linked. Try again.",
      });
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset(coachLinkStaffDefaultValues);
      }}
    >
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Link2 aria-hidden="true" />
        Link to staff
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link {coachName} to a staff member</DialogTitle>
          <DialogDescription>
            A coach is one staff member. Their staff account lets them sign in to see their classes
            and roster. Sessions already assigned stay as they are.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor={id}>Staff member</Label>
          <NativeSelect
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            {...form.register("staffId")}
          >
            <NativeSelectOption value="">Choose a staff member</NativeSelectOption>
            {available.map((row) => (
              <NativeSelectOption key={row.id} value={row.id}>
                {row.name} · {row.email}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every active staff member already has a coach profile. Add the person in Staff first.
            </p>
          ) : null}
          {error ? (
            <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={link.isPending}
            disabled={available.length === 0}
            onClick={() => void submit()}
          >
            Link coach
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
