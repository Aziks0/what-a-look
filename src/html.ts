/**
 * SPDX-FileCopyrightText: 2026 Benjamin DIDIER <contact@aziks.aleeas.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import _htmlPage from "../markdown.html" with { type: "text" };

import { getStyles } from "./styles.ts";
import { exitError } from "./utils.ts";

// @ts-expect-error: It's a string. I know because I'm the one that imported it.
const htmlPage: string = _htmlPage;

const intoGithubMarkdown = async (markdown: string): Promise<string> => {
  try {
    const response = await fetch("https://api.github.com/markdown", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: "gfm", text: markdown }),
    });

    if (!response.ok) {
      throw `${response.status} ${await response.text()}`;
    }

    return await response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : error;

    return exitError(`Failed to fetch GitHub API: ${message}`);
  }
};

export const intoHtml = async (
  markdown: string,
  forceDark: boolean,
): Promise<string> => {
  const githubMarkdown = await intoGithubMarkdown(markdown);

  const htmlWithMarkdown = htmlPage.replace(
    "{{ GITHUB_MARKDOWN_BODY }}",
    githubMarkdown,
  );

  return htmlWithMarkdown.replace(
    "{{ GITHUB_MARKDOWN_CSS }}",
    getStyles(forceDark),
  );
};
