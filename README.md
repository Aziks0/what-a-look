<!--
  SPDX-FileCopyrightText: 2026 Benjamin DIDIER <contact@aziks.aleeas.com>

  SPDX-License-Identifier: CC0-1.0
-->

<!-- markdownlint-disable MD059 -->

# what-a-look

Generate an html file to preview your GitHub markdown files.

## Installation

Use the javascript package manager of your choice to install `what-a-look` globally:

```sh
npm install -g what-a-look
bun install -g what-a-look
pnpm add -g what-a-look
```

Or run the package directly:

```sh
npx what-a-look [OPTIONS]
bunx what-a-look [OPTIONS]
pnpx what-a-look [OPTIONS]
```

## Usage

```sh
what-a-look [OPTIONS]
```

### Options

- `-i`, `--in` — Path to markdown file. It needs the `.md` extension.
- `-o`, `--out` — Out file. Default is to print to stdout.
- `--force-dark` — Force the preview to use dark-mode.
- `-h`, `--help` — Print help.

### Examples

Write to a file:

```sh
what-a-look -i ./README.md -o README.html
```

Pipe to [`mcat`](https://github.com/Skardyy/mcat):

```sh
what-a-look -i ./README.md --force-dark | mcat -e html -I
```

Pipe to [`lynx`](https://lynx.invisible-island.net/index.html):

```sh
what-a-look -i ./README.md | lynx -stdin
```

## Licensing

This repository contains sources available under a multitude of open source licenses.

`what-a-look`, as a whole, is licensed under the GNU General Public License version 3 or later. A copy of the licensing
terms is available [here](LICENSE).

Being [REUSE-compliant](https://reuse.software/), every file, if possible, contains a license header with information on
its copyrights. You can get a Software Bill Of Materials by installing the [REUSE
tool](https://codeberg.org/fsfe/reuse-tool.git), cloning this repository, and running `reuse spdx -o sbom.spdx`.
