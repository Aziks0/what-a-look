/**
 * SPDX-FileCopyrightText: 2026 Benjamin DIDIER <contact@aziks.aleeas.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

enum Group {
  Quote,
  None,
}

enum Markdown {
  Heading,
  CodeBlock,
  Paragraph,
  BrokenParagraph,
  List,
  BlankLine,
  Fontnote,
  LinkReference,
}

const hasTrailingNewline = (type: Markdown): boolean =>
  type === Markdown.Heading ||
  type === Markdown.List ||
  type === Markdown.CodeBlock ||
  type === Markdown.BlankLine ||
  type === Markdown.BrokenParagraph;

const isHeading = (line: string): boolean => line.startsWith("#");

const isList = (line: string): boolean => /^(-|\*|\+|\d+\.)\s/m.test(line);

const isCodeBlock = (line: string): boolean => line.startsWith("```");

const isLinkReference = (line: string): boolean => /^\[.*?\]:/m.test(line);

const isFootnote = (line: string): boolean => /^\[\^\d+\]:/m.test(line);

const isAlert = (line: string): boolean =>
  /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/im.test(line);

// GitHub accepts these:
// - 2 or more whitespaces at the end of the line.
// - A backslash at the end of the line.
// - A break element (this one we don't care).
const hasForcedLineBreak = (line: string): boolean => /(\s{2}|\\)$/m.test(line);

const isQuote = (line: string): boolean => line.startsWith(">");

const getType = (line: string): Markdown => {
  const trimmed = line.trim();

  if (trimmed.length === 0) return Markdown.BlankLine;
  if (isHeading(trimmed)) return Markdown.Heading;
  if (isCodeBlock(trimmed)) return Markdown.CodeBlock;
  if (isList(trimmed)) return Markdown.List;
  if (isFootnote(trimmed)) return Markdown.Fontnote;
  if (isLinkReference(trimmed)) return Markdown.LinkReference;
  return Markdown.Paragraph;
};

const sanitize = (lines: string[]): string[] => {
  const sanitizedLines: string[] = [];

  let previousType = Markdown.Heading;
  let type = Markdown.Heading;

  const addTrailingNewlineIfNeeded = () => {
    if (hasTrailingNewline(previousType)) return;

    const previousLine = sanitizedLines.pop();
    if (previousLine === undefined) return;

    sanitizedLines.push(`${previousLine}\n`);
  };

  for (let index = 0; index < lines.length; index++) {
    // ts doesn't seem to understand that `line` cannot be undefined here.
    const line = lines[index] ?? "";

    previousType = type;
    type = getType(line);

    // Keep line breaks on blank lines.
    if (type === Markdown.BlankLine) {
      addTrailingNewlineIfNeeded();

      sanitizedLines.push("\n");

      continue;
    }

    // Keep line breaks on headings.
    if (type === Markdown.Heading) {
      addTrailingNewlineIfNeeded();

      sanitizedLines.push(`${line}\n`);

      continue;
    }

    // Keep trailing line break on lists. Also add a leading line break on the
    // first item, if necessary.
    if (type === Markdown.List) {
      addTrailingNewlineIfNeeded();

      // Skip until we stop finding list items.
      for (; index < lines.length; index++) {
        // ts doesn't seem to understand that `line` cannot be undefined here.
        const line: string = lines[index] ?? "";

        if (!isList(line.trim())) break;

        sanitizedLines.push(`${line}\n`);
      }

      // We need the next loop to check the current line.
      index--;

      continue;
    }

    // Keep the line breaks on code blocks.
    if (type === Markdown.CodeBlock) {
      addTrailingNewlineIfNeeded();

      // Add a newline to the opening code block.
      sanitizedLines.push(`${line}\n`);
      index++;

      // Skip until the end of the code block. We don't need to change anything
      // to the code inside it.
      for (; index < lines.length; index++) {
        // ts doesn't seem to understand that `line` cannot be undefined here.
        const line: string = lines[index] ?? "";

        sanitizedLines.push(`${line}\n`);

        if (isCodeBlock(line.trim())) break;
      }

      continue;
    }

    // Consider footnotes and link references like paragraphs, just with a
    // leading newline if needed and a space for future paragraphs.
    // NOTE: This is not how GitHub treats them, but we don't really care
    // anymore, we're way past that.
    if (type === Markdown.Fontnote || type === Markdown.LinkReference) {
      addTrailingNewlineIfNeeded();

      sanitizedLines.push(`${line} `);

      continue;
    }

    // If we're here, the line is a paragraph.

    // If a paragraph follows a list item, we need to place it on the same line
    // as the item.
    if (previousType === Markdown.List) {
      type = Markdown.List;

      let previousLine = sanitizedLines.pop();
      if (previousLine === undefined) continue;

      // Remove the newline from the previous list.
      previousLine = previousLine.slice(0, -1);

      // Add back the list item with our current line added.
      sanitizedLines.push(`${previousLine.trimEnd()} ${line.trimStart()}\n`);

      continue;
    }

    // Handle markdown "line breaks".
    if (hasForcedLineBreak(line)) {
      type = Markdown.BrokenParagraph;

      const previousLine = sanitizedLines.pop();
      if (previousLine === undefined) continue;

      sanitizedLines.push(`${previousLine.trimEnd()} ${line.trimStart()}\n`);

      continue;
    }

    sanitizedLines.push(`${line.trim()} `);
  }

  return sanitizedLines;
};

const sanitizeGroup = (lines: string[], group: Group): string => {
  let sanitizedLines = sanitize(lines);

  if (group === Group.Quote) {
    // Add a newline to first line if it's an alert.
    const firstLine = sanitizedLines[0];
    if (firstLine && isAlert(firstLine.trimStart()))
      sanitizedLines[0] = `${firstLine}\n`;

    // Add back the quotes at the beginning of lines.
    let lastHasNewline = true;
    sanitizedLines = sanitizedLines.map((line) => {
      if (lastHasNewline) line = `> ${line}`;

      lastHasNewline = line.endsWith("\n");

      return line;
    });
  }

  return `${sanitizedLines.join("")}\n`;
};

/**
 * Sanitize newlines in a markdown string.
 *
 * The GitHub markdown api converts newlines to a `<br>` element, even when it
 * isn't supposed to according to the spec. This function fixes it, with an
 * obvious bit of radioactivity added, because why not? I didn't want to add a
 * whole markdown parser in the equation for a project that should be so simple.
 * Right, _should_... that's were I got it wrong.
 *
 * @param markdown The markdown string.
 * @returns The sanitized markdown.
 */
export const sanitizeNewlines = (markdown: string): string => {
  // Split on LF/CRLF.
  const lines = markdown.split(/\r?\n/);

  // Remove quotes from lines but mark them as being in quotes.
  const markedLines = lines.map((line) => {
    const quoted = isQuote(line.trimStart());
    return {
      group: quoted ? Group.Quote : Group.None,
      line: quoted ? line.replace(">", "") : line,
    };
  });

  if (markedLines.length === 0) return "";

  // ts doesn't seem to understand that we checked the length of the array.
  let currentGroup = markedLines[0]?.group ?? Group.None;
  let buffer: string[] = [];
  let sanitizedMarkdown = "";

  for (const { group, line } of markedLines) {
    if (group !== currentGroup) {
      sanitizedMarkdown += sanitizeGroup(buffer, currentGroup);

      currentGroup = group;
      buffer = [];
    }

    buffer.push(line);
  }

  return sanitizedMarkdown;
};
