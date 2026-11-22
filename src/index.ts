/**
 * SPDX-FileCopyrightText: 2026 Benjamin DIDIER <contact@aziks.aleeas.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import path from "node:path";
import utils from "node:util";

import { intoHtml } from "./html.ts";
import { exitError, readFile, toMessage, writeFile } from "./utils.ts";

const helpMessage = `what-a-look, get an html file to preview your GitHub markdown files.

Usage: what-a-look [OPTIONS]

Options:
  -i, --in         Path to markdown file. It needs the '.md' extension.
  -o, --out        Out file. Default is to print to stdout.
      --force-dark Force the preview to use dark-mode.
  -h, --help       Print help.`;

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
