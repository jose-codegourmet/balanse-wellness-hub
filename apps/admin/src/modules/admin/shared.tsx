"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Input,
  Label,
} from "@balanse/ui";
import { type ReactNode, useState } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h1 className="font-display text-3xl">{title}</h1>
      {children}
    </div>
  );
}

export function Field({
  id,
  label,
  children,
  hint,
}: {
  id: string;
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function ConfirmAction({
  triggerLabel,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  variant = "default",
  disabled,
}: {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => unknown;
  variant?: "default" | "outline" | "destructive";
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant={variant}
        disabled={disabled}
        className="min-h-11"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Back</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              void onConfirm();
              setOpen(false);
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DataTable({ columns, children }: { columns: string[]; children: ReactNode }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-3 py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
