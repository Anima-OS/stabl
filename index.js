#! /usr/bin/env node

/* Copyright (c) 2018, Mark "Happy-Ferret" Bauermeister
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */

"use strict";

const fs = require("fs");
const chalk = require("chalk");
const sections = require("markdown-sections");
const opts = require("optimist").argv;

function usage() {
  console.error(
    [
      ``,
      `${chalk.green("Usage:")}`,
      ``,
      "stabl STABILITY",
      ``,
      `options:`,
      `-h, --help    display this help message`,
      ``,
      `STABILITY has to be one of:`,
      `${chalk.bgBlue("experimental")} || ${chalk.bgYellow("unstable")} || ${chalk.bgGreen("stable")} || ${chalk.bgRed(
        "deprecated"
      )}`,
      ``,
      `More information can be found at ${chalk.cyanBright("https://github.com/Anima-OS/stabl")}`,
    ].join("\n")
  );
  process.exit(1);
}

if (opts.h || opts.help) usage();

var readme = fs
  .readdirSync("./")
  .filter(function (name) {
    return /^readme\.(md|markdown)$/.test(name.toLowerCase());
  })
  .shift();

var text = fs.readFileSync(readme, "utf-8");

var a = sections(text);

function findLast(array, test) {
  var i = null;

  array.forEach(function (v, j) {
    if (test(v, j)) i = j;
  });

  return i;
}

var i = findLast(a, function (section, j) {
  return /^#+\s*stability/.test(section.toLowerCase());
});

var stability = opts._[0];

var descriptions = require("./api.json");
var levels = Object.keys(descriptions);

var k =
  stability &&
  findLast(levels, function (level) {
    return level.toLowerCase().indexOf(stability.toLowerCase()) === 0;
  });

if (k == null) usage();

a.splice(
  i == null ? 1 : i,
  i == null ? 0 : 1,
  [
    `#### Stability`,
    ``,
    `[![](https://anima-os.github.io/stabl-badges/${levels[
      k
    ].toLowerCase()}.svg)](https://github.com/Anima-OS/stabl-badges "${levels[k]}: ${descriptions[levels[k]]}")`,
    ``,
  ].join("\n")
);

var newText = a.join("\n");

try {
  var p = JSON.parse(fs.readFileSync("./package.json", "utf8"));

  p.stability = levels[k].toLowerCase();
  p = JSON.stringify(p, false, 2) + "\n";

  fs.writeFileSync("./package.json", p);
} catch (error) {
  console.error(`${chalk.red("No package.json found in the current directory. Skipping.")}`);
}

fs.writeFileSync(readme, newText);
