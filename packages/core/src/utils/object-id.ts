/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { randomBytes, randomInt } from "./random";

const PROCESS_UNIQUE = randomBytes(5).toString("hex");
let index = ~~(randomInt() * 0xffffff);
export function createObjectId(date = Date.now()): string {
  index++;
  const time = Math.floor(date / 1000);
  return time.toString(16) + PROCESS_UNIQUE + swap16(index).toString(16);
}

function swap16(val: number) {
  return ((val & 0xff) << 16) | (val & 0xff00) | ((val >> 16) & 0xff);
}