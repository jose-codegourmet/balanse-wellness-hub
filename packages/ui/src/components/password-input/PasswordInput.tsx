"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../button/Button";
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
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={id}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-1.5 my-auto"
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </div>
  );
}

export { PasswordInput };
