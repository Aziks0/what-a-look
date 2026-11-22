/**
 * SPDX-FileCopyrightText: 2026 Benjamin DIDIER <contact@aziks.aleeas.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// @ts-expect-error: You can find it. I believe in you!
import _styles from "github-markdown-css/github-markdown.css" with {
  type: "text",
};

const styles: string = _styles;

/**
 * Generate GitHub styles with dark color scheme.
 *
 * @returns The generated styles.
 */
const generateDarkStyles = (): string => {
  // Remove the `@media (prefers-color-scheme: dark)` block but keep the inner
  // block.
  const full = styles.replace(
    /@media \(prefers-color-scheme: dark\)(?:.*?\r?\n)}/s,
    (s) => s.slice(s.indexOf("{") + 1, s.lastIndexOf("}")),
  );

  // Remove the whole `@media (prefers-color-scheme: light)` block.
  return full.replace(
    /@media \(prefers-color-scheme: light\)(?:.*?\r?\n)}/s,
    "",
  );
};

/**
 * Get the GitHub markdown css styles.
 *
 * @param forceDark Should we force the styles to use dark mode?
 * @returns The css styles.
 */
export const getStyles = (forceDark: boolean): string => {
  if (forceDark) {
    return generateDarkStyles();
  }

  return styles;
};
