/**
 * SPDX-FileCopyrightText: 2026 Benjamin DIDIER <contact@aziks.aleeas.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import path from "node:path";
import utils from "node:util";

import htmlPage from "./html.ts";
import getStyles from "./styles.ts";

import { exitError, readFile, toMessage, writeFile } from "./utils.ts";

const helpMessage = `what-a-look, get an html file to preview your GitHub markdown files.

Usage: what-a-look [OPTIONS]

Options:
  -i, --in         Path to markdown file. It needs the '.md' extension.
  -o, --out        Out file. Default is to print to stdout.
      --force-dark Force the preview to use dark-mode.
  -h, --help       Print help.`;

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

const intoHtml = async (
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

const parseArgs = () => {
  try {
    const { values } = utils.parseArgs({
      options: {
        in: {
          type: "string",
          short: "i",
        },
        out: {
          type: "string",
          short: "o",
          default: "",
        },
        "force-dark": {
          type: "boolean",
          default: false,
        },
        help: {
          type: "boolean",
          short: "h",
          default: false,
        },
      },
      allowPositionals: false,
      strict: true,
    });

    return values;
  } catch (error) {
    const message = toMessage(error);

    return exitError(`${message}\n\nFor more information, try '--help'.`);
  }
};

const main = async () => {
  const args = parseArgs();

  if (args.help) {
    console.log(helpMessage);
    return;
  }

  if (!args.in) {
    return exitError(
      "Missing option '--in'\n\nFor more information, try '--help'.",
    );
  }

  if (path.extname(args.in) !== ".md") {
    exitError(
      "Input file is not a markdown file\n\nMaybe consider adding the '.md' extension.",
    );
  }

  const markdown = readFile(args.in);
  const html = await intoHtml(markdown, args["force-dark"]);

  // Write the html to stdout if the user didn't ask to write to a file.
  if (args.out.length === 0) {
    console.log(html);
    return;
  }

  writeFile(args.out, html);
};

main();
