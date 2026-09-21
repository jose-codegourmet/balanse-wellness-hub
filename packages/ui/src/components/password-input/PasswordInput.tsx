"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { cn } from "../../lib/utils";
import { Input } from "../input/Input";

import type { PasswordInputProps } from "./PasswordInput.schema";

function PasswordInput({ className, disabled, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div data-slot="password-input" className={cn("relative w-full min-w-0", className)}>
      <Input
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className="pr-10"
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={id}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
