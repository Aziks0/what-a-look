/**
 * SPDX-FileCopyrightText: 2026 Benjamin DIDIER <contact@aziks.aleeas.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import fs from "node:fs";

export const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : `${error}`;

export const exitError = (message: string): never => {
  console.error(`Error: ${message}`);
  process.exit(1);
};

export const readFile = (path: string): string => {
  try {
    return fs.readFileSync(path, "utf8");
  } catch (error) {
    const message = toMessage(error);

    return exitError(`Failed to read file at path '${path}': ${message}`);
  }
};

export const writeFile = (path: string, data: string) => {
  try {
    fs.writeFileSync(path, data);
  } catch (error) {
    const message = toMessage(error);

    exitError(`Failed to write file at path '${path}': ${message}`);
  }
};
