import { createElement, type ReactNode } from "react";

const ALLOWED_HREF_PREFIXES = ["http:", "https:", "mailto:"] as const;
const REJECTED_HREF_PREFIXES = ["javascript:", "data:", "vbscript:"] as const;

export function isAllowedHref(href: string): boolean {
  const trimmed = href.trim();
  const lower = trimmed.toLowerCase();
  if (REJECTED_HREF_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return false;
  }
  return ALLOWED_HREF_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function isExternalHref(href: string): boolean {
  const lower = href.trim().toLowerCase();
  return lower.startsWith("http:") || lower.startsWith("https:");
}

function linkRel(href: string): string | undefined {
  return isExternalHref(href) ? "noopener noreferrer" : undefined;
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let plainStart = 0;
  let key = 0;

  const flushPlain = (end: number) => {
    if (end > plainStart) {
      nodes.push(text.slice(plainStart, end));
    }
  };

  const pushNode = (node: ReactNode) => {
    nodes.push(node);
    key += 1;
  };

  while (i < text.length) {
    if (text.startsWith("![", i)) {
      i += 2;
      continue;
    }

    if (text[i] === "[") {
      const closeBracket = text.indexOf("]", i + 1);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          const label = text.slice(i + 1, closeBracket);
          const href = text.slice(closeBracket + 2, closeParen);
          flushPlain(i);
          if (isAllowedHref(href)) {
            pushNode(
              createElement(
                "a",
                {
                  key: `${keyPrefix}-a-${key}`,
                  href: href.trim(),
                  rel: linkRel(href),
                },
                parseInline(label, `${keyPrefix}-a-${key}`),
              ),
            );
          } else {
            pushNode(label);
          }
          i = closeParen + 1;
          plainStart = i;
          continue;
        }
      }
    }

    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        flushPlain(i);
        pushNode(
          createElement(
            "strong",
            { key: `${keyPrefix}-strong-${key}` },
            parseInline(text.slice(i + 2, end), `${keyPrefix}-strong-${key}`),
          ),
        );
        i = end + 2;
        plainStart = i;
        continue;
      }
    }

    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = findClosingDelimiter(text, i + 1, "*");
      if (end !== -1) {
        flushPlain(i);
        pushNode(
          createElement(
            "em",
            { key: `${keyPrefix}-em-${key}` },
            parseInline(text.slice(i + 1, end), `${keyPrefix}-em-${key}`),
          ),
        );
        i = end + 1;
        plainStart = i;
        continue;
      }
    }

    if (text[i] === "_" && text[i + 1] !== "_") {
      const end = findClosingDelimiter(text, i + 1, "_");
      if (end !== -1) {
        flushPlain(i);
        pushNode(
          createElement(
            "em",
            { key: `${keyPrefix}-em-${key}` },
            parseInline(text.slice(i + 1, end), `${keyPrefix}-em-${key}`),
          ),
        );
        i = end + 1;
        plainStart = i;
        continue;
      }
    }

    i += 1;
  }

  flushPlain(text.length);
  return nodes;
}

function findClosingDelimiter(text: string, from: number, delimiter: "*" | "_"): number {
  let i = from;
  while (i < text.length) {
    if (delimiter === "*" && text.startsWith("**", i)) {
      i += 2;
      continue;
    }
    if (text[i] === delimiter) {
      return i;
    }
    i += 1;
  }
  return -1;
}

const UNORDERED_LINE = /^\s*[-*] (.+)$/;
const ORDERED_LINE = /^\s*\d+\. (.+)$/;

function isUnorderedBlock(lines: string[]): boolean {
  return lines.length > 0 && lines.every((line) => UNORDERED_LINE.test(line));
}

function isOrderedBlock(lines: string[]): boolean {
  return lines.length > 0 && lines.every((line) => ORDERED_LINE.test(line));
}

function renderParagraph(text: string, key: string): ReactNode {
  const lines = text.split("\n");
  const children: ReactNode[] = [];
  lines.forEach((line, index) => {
    children.push(...parseInline(line, `${key}-p-${index}`));
    if (index < lines.length - 1) {
      children.push(createElement("br", { key: `${key}-br-${index}` }));
    }
  });
  return createElement("p", { key }, children);
}

function renderList(tag: "ul" | "ol", lines: string[], pattern: RegExp, key: string): ReactNode {
  return createElement(
    tag,
    { key },
    lines.map((line, index) => {
      const match = line.match(pattern);
      const body = match?.[1] ?? line;
      return createElement(
        "li",
        { key: `${key}-li-${index}` },
        parseInline(body, `${key}-li-${index}`),
      );
    }),
  );
}

/** Markdown subset → React nodes. Out-of-subset syntax is left as literal text. */
export function renderMarkdownSubset(markdown: string): ReactNode {
  const normalized = markdown.replace(/\r\n/g, "\n");
  if (!normalized.trim()) {
    return null;
  }

  const blocks = normalized.split(/\n{2,}/);
  const children: ReactNode[] = [];

  blocks.forEach((block, index) => {
    if (!block.trim()) {
      return;
    }
    const lines = block.split("\n").filter((line) => line.length > 0);
    const key = `md-${index}`;
    if (isUnorderedBlock(lines)) {
      children.push(renderList("ul", lines, UNORDERED_LINE, key));
      return;
    }
    if (isOrderedBlock(lines)) {
      children.push(renderList("ol", lines, ORDERED_LINE, key));
      return;
    }
    children.push(renderParagraph(block, key));
  });

  return children;
}
