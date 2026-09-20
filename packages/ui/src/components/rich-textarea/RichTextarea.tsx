"use client";

import { Bold, Italic, Link2, List, ListOrdered, Pilcrow } from "lucide-react";
import type { ChangeEvent, KeyboardEvent, ReactNode, Ref } from "react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

import { cn } from "../../lib/utils";
import { Button } from "../button/Button";
import { ButtonGroup } from "../button-group/ButtonGroup";
import { FieldError } from "../field/Field";
import { Textarea } from "../textarea/Textarea";
import { renderMarkdownSubset } from "./RichTextarea.markdown";
import type { RichTextareaProps } from "./RichTextarea.schema";
import { RICH_TEXTAREA_MAX_LENGTH } from "./RichTextarea.schema";

const MARK_TOOLS = ["bold", "italic", "link", "ul", "ol", "break"] as const;
type MarkTool = (typeof MARK_TOOLS)[number];

const PREVIEW_CLASS =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_p+p]:mt-3 [&_li]:my-0.5";

function getLineBounds(value: string, start: number, end: number) {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const after = value.indexOf("\n", end);
  const lineEnd = after === -1 ? value.length : after;
  return { lineStart, lineEnd };
}

function detectMarks(value: string, start: number, end: number) {
  const before = value.slice(0, start);
  const selected = value.slice(start, end);
  const after = value.slice(end);
  const { lineStart, lineEnd } = getLineBounds(value, start, end);
  const lines = value.slice(lineStart, lineEnd).split("\n");

  return {
    bold: (before.endsWith("**") && after.startsWith("**")) || /^\*\*[\s\S]*\*\*$/.test(selected),
    italic:
      (before.endsWith("*") &&
        !before.endsWith("**") &&
        after.startsWith("*") &&
        !after.startsWith("**")) ||
      (before.endsWith("_") && after.startsWith("_")) ||
      /^\*[\s\S]*\*$/.test(selected) ||
      /^_[\s\S]*_$/.test(selected),
    link:
      (before.endsWith("[") && /^\].*\)$/.test(after)) || /^\[[\s\S]*\]\([^)]*\)$/.test(selected),
    ul: lines.length > 0 && lines.every((line) => /^\s*[-*] /.test(line)),
    ol: lines.length > 0 && lines.every((line) => /^\s*\d+\. /.test(line)),
    break: false,
  };
}

function RichTextarea({
  className,
  defaultValue,
  disabled,
  id,
  invalid,
  maxLength = RICH_TEXTAREA_MAX_LENGTH,
  maxRows = 12,
  minRows = 4,
  onChange,
  onKeyDown,
  onSelect,
  preview = false,
  readOnly,
  ref,
  value,
  ...props
}: RichTextareaProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const errorId = `${controlId}-over-limit`;
  const descriptionId = `${controlId}-count`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uncontrolled, setUncontrolled] = useState(String(defaultValue ?? ""));
  const [previewOpen, setPreviewOpen] = useState(preview);
  const [toolbarIndex, setToolbarIndex] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const isControlled = value !== undefined;
  const currentValue = isControlled ? String(value) : uncontrolled;
  const overLimit = currentValue.length > maxLength;
  const isInvalid = Boolean(invalid) || overLimit;
  const marks = detectMarks(currentValue, selection.start, selection.end);
  const toolbarLocked = Boolean(disabled || readOnly);

  useEffect(() => {
    setPreviewOpen(preview);
  }, [preview]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    const styles = window.getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 24;
    const padding = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
    const border =
      Number.parseFloat(styles.borderTopWidth) + Number.parseFloat(styles.borderBottomWidth);
    const minHeight = minRows * lineHeight + padding + border;
    const maxHeight = maxRows * lineHeight + padding + border;
    el.style.height = "auto";
    const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [currentValue, maxRows, minRows]);

  const commitValue = (next: string, rangeStart: number, rangeEnd: number) => {
    if (!isControlled) {
      setUncontrolled(next);
    }
    onChange?.({
      target: { value: next },
    } as ChangeEvent<HTMLTextAreaElement>);
    requestAnimationFrame(() => {
      const nextField = textareaRef.current;
      if (!nextField) {
        return;
      }
      nextField.focus();
      nextField.setSelectionRange(rangeStart, rangeEnd);
      setSelection({ start: rangeStart, end: rangeEnd });
    });
  };

  const replaceRange = (
    rangeStart: number,
    rangeEnd: number,
    inserted: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    const el = textareaRef.current;
    if (!el || toolbarLocked) {
      return;
    }
    if (typeof el.setRangeText === "function") {
      el.setRangeText(inserted, rangeStart, rangeEnd, "select");
      commitValue(el.value, selectionStart, selectionEnd);
      return;
    }
    commitValue(
      `${currentValue.slice(0, rangeStart)}${inserted}${currentValue.slice(rangeEnd)}`,
      selectionStart,
      selectionEnd,
    );
  };

  const wrapSelection = (before: string, after: string, emptyPlaceholder = "") => {
    const el = textareaRef.current;
    if (!el || toolbarLocked) {
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = currentValue.slice(start, end) || emptyPlaceholder;
    const innerStart = start + before.length;
    replaceRange(
      start,
      end,
      `${before}${selected}${after}`,
      innerStart,
      innerStart + selected.length,
    );
  };

  const insertAtCursor = (inserted: string, cursorOffset = inserted.length) => {
    const el = textareaRef.current;
    if (!el || toolbarLocked) {
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const caret = start + cursorOffset;
    replaceRange(start, end, inserted, caret, caret);
  };

  const applyList = (kind: "ul" | "ol") => {
    const el = textareaRef.current;
    if (!el || toolbarLocked) {
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const { lineStart, lineEnd } = getLineBounds(currentValue, start, end);
    const block = currentValue.slice(lineStart, lineEnd);
    const lines = block.split("\n");
    const already =
      kind === "ul"
        ? lines.every((line) => /^\s*[-*] /.test(line))
        : lines.every((line) => /^\s*\d+\. /.test(line));
    const nextLines = already
      ? lines.map((line) => line.replace(/^\s*(?:[-*] |\d+\. )/, ""))
      : lines.map((line, index) => (kind === "ul" ? `- ${line}` : `${index + 1}. ${line}`));
    const nextBlock = nextLines.join("\n");
    replaceRange(lineStart, lineEnd, nextBlock, lineStart, lineStart + nextBlock.length);
  };

  const runTool = (tool: MarkTool) => {
    switch (tool) {
      case "bold":
        wrapSelection("**", "**");
        break;
      case "italic":
        wrapSelection("*", "*");
        break;
      case "link":
        wrapSelection("[", "](https://)", "link text");
        break;
      case "ul":
        applyList("ul");
        break;
      case "ol":
        applyList("ol");
        break;
      case "break":
        insertAtCursor("\n\n");
        break;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const meta = event.metaKey || event.ctrlKey;
    if (meta && event.key.toLowerCase() === "b") {
      event.preventDefault();
      runTool("bold");
    } else if (meta && event.key.toLowerCase() === "i") {
      event.preventDefault();
      runTool("italic");
    } else if (meta && event.key.toLowerCase() === "k") {
      event.preventDefault();
      runTool("link");
    }
    onKeyDown?.(event);
  };

  const syncSelection = () => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    setSelection({ start: el.selectionStart, end: el.selectionEnd });
  };

  const describedBy = [props["aria-describedby"], descriptionId, overLimit ? errorId : undefined]
    .filter(Boolean)
    .join(" ");

  const tools: Array<{
    tool: MarkTool;
    label: string;
    pressed: boolean;
    icon: ReactNode;
  }> = [
    { tool: "bold", label: "Bold", pressed: marks.bold, icon: <Bold /> },
    { tool: "italic", label: "Italic", pressed: marks.italic, icon: <Italic /> },
    { tool: "link", label: "Insert link", pressed: marks.link, icon: <Link2 /> },
    { tool: "ul", label: "Unordered list", pressed: marks.ul, icon: <List /> },
    { tool: "ol", label: "Ordered list", pressed: marks.ol, icon: <ListOrdered /> },
    { tool: "break", label: "Paragraph break", pressed: marks.break, icon: <Pilcrow /> },
  ];

  return (
    <div
      data-slot="rich-textarea"
      data-invalid={isInvalid || undefined}
      className={cn("flex w-full flex-col gap-2", className)}
    >
      <div
        role="toolbar"
        aria-label="Text formatting"
        aria-controls={controlId}
        onKeyDown={(event) => {
          const last = tools.length - 1;
          let next = toolbarIndex;
          if (event.key === "ArrowRight") {
            next = (toolbarIndex + 1) % tools.length;
          } else if (event.key === "ArrowLeft") {
            next = (toolbarIndex - 1 + tools.length) % tools.length;
          } else if (event.key === "Home") {
            next = 0;
          } else if (event.key === "End") {
            next = last;
          } else {
            return;
          }
          event.preventDefault();
          setToolbarIndex(next);
          const nextButton =
            event.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next];
          nextButton?.focus();
        }}
      >
        <ButtonGroup>
          {tools.map((item, index) => (
            <Button
              key={item.tool}
              type="button"
              variant="ghost"
              aria-label={item.label}
              aria-pressed={item.pressed}
              disabled={toolbarLocked}
              tabIndex={toolbarLocked || index !== toolbarIndex ? -1 : 0}
              onClick={() => runTool(item.tool)}
              onFocus={() => setToolbarIndex(index)}
            >
              {item.icon}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <Textarea
        {...props}
        ref={(node) => {
          textareaRef.current = node;
          assignRef(ref, node);
        }}
        id={controlId}
        value={currentValue}
        disabled={disabled}
        readOnly={readOnly}
        rows={minRows}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy || undefined}
        className={cn(
          "min-h-0 resize-none [field-sizing:fixed]",
          readOnly &&
            !disabled &&
            "cursor-default bg-muted/40 text-foreground disabled:opacity-100 dark:bg-input/20",
        )}
        onChange={(event) => {
          if (!isControlled) {
            setUncontrolled(event.target.value);
          }
          onChange?.(event);
          syncSelection();
        }}
        onKeyDown={handleKeyDown}
        onSelect={(event) => {
          syncSelection();
          onSelect?.(event);
        }}
        onClick={syncSelection}
        onKeyUp={syncSelection}
      />
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          aria-pressed={previewOpen}
          aria-label={previewOpen ? "Hide preview" : "Show preview"}
          disabled={disabled}
          onClick={() => setPreviewOpen((open) => !open)}
        >
          Preview
        </Button>
        <span
          id={descriptionId}
          className={cn("text-xs text-muted-foreground", overLimit && "text-destructive")}
        >
          {currentValue.length}/{maxLength}
        </span>
      </div>
      {overLimit ? (
        <FieldError id={errorId}>
          {currentValue.length - maxLength} characters over the {maxLength} character limit.
        </FieldError>
      ) : null}
      {previewOpen ? (
        <div data-slot="rich-textarea-preview" className={PREVIEW_CLASS}>
          {renderMarkdownSubset(currentValue) ?? (
            <p className="text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export { isAllowedHref, renderMarkdownSubset } from "./RichTextarea.markdown";
export type { RichTextareaProps, RichTextareaValues } from "./RichTextarea.schema";
export {
  RICH_TEXTAREA_MAX_LENGTH,
  richTextareaSchema,
} from "./RichTextarea.schema";
export { RichTextarea };
