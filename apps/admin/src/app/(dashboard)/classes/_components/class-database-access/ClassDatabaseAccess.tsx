"use client";
import { Button } from "@balanse/ui";
import { Database, LockKeyhole } from "lucide-react";
import { AdminForm, FormField } from "@/modules/admin/forms/AdminForm";
import { TextBinding } from "@/modules/admin/forms/bindings";
import { classDatabaseAccessDefaultValues } from "./ClassDatabaseAccess.defaults";
import {
  type ClassDatabaseAccessProps,
  classDatabaseAccessSchema,
} from "./ClassDatabaseAccess.schema";
export function ClassDatabaseAccess({
  canSave,
  connect,
  disconnect,
  onConnected,
}: ClassDatabaseAccessProps) {
  if (!connect) return null;
  if (canSave)
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Database className="size-4" /> Connected to database · Admin access verified
        {disconnect ? (
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              await disconnect();
              onConnected();
            }}
          >
            Sign out of database
          </Button>
        ) : null}
      </div>
    );
  return (
    <details className="rounded-xl border border-border bg-muted/40 p-4">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <LockKeyhole className="size-4" />
        Database connected · Sign in to save changes
      </summary>
      <p className="my-3 max-w-xl text-sm text-muted-foreground">
        Use an active Supabase administrator account. The preview login does not grant database
        access. Your project owner must provision the first administrator.
      </p>
      <AdminForm
        schema={classDatabaseAccessSchema}
        defaultValues={classDatabaseAccessDefaultValues}
        className="max-w-lg"
        onSubmit={async (values) => {
          const result = await connect(values);
          if (result.error) throw new Error(result.error);
          onConnected();
        }}
      >
        <FormField name="email" label="Admin email">
          {(field) => <TextBinding {...field} type="email" autoComplete="username" />}
        </FormField>
        <FormField name="password" label="Password">
          {(field) => <TextBinding {...field} type="password" autoComplete="current-password" />}
        </FormField>
        <Button type="submit">Sign in to save</Button>
      </AdminForm>
    </details>
  );
}
