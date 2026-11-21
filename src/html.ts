/**
 * SPDX-FileCopyrightText: 2026 Benjamin DIDIER <contact@aziks.aleeas.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import _htmlPage from "../markdown.html" with { type: "text" };

// @ts-expect-error: It's a string. I know because I'm the one that imported it.
const htmlPage: string = _htmlPage;

export default htmlPage;
