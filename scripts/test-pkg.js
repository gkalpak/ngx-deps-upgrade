#!/usr/bin/env node
'use strict';

// Imports
const {green, red} = require('chalk');
const {existsSync} = require('fs');
const {resolve} = require('path');
const {bin, main, types, typings} = require('../package.json');

// Constants
const CHECK_MARK = green('\u2714');
const X_MARK = red('\u2716');
const ROOT_DIR = resolve(__dirname, '..');

// Run
_main();

// Function - Definitions
function _main() {
  checkBin(bin || {}, ROOT_DIR);
  checkFile('main', main || '', ROOT_DIR);
  checkFile('types', types || '', ROOT_DIR);
  checkFile('typings', typings || '', ROOT_DIR);
}

function checkBin(bin, rootDir) {
  const missingScripts = Object.keys(bin).
    map(key => resolve(rootDir, bin[key])).
    filter(path => !existsSync(path));

  reportResults(
    'All scripts mentioned in `package.json > bin` exist.',
    'Some scripts mentioned in `package.json > bin` are missing.',
    {'Missing scripts': missingScripts});
}

function checkFile(propName, filePath, rootDir) {
  if (!filePath) return;

  const missingFile = !existsSync(resolve(rootDir, filePath));

  reportResults(
    `The file mentioned in \`package.json > ${propName}\` exists.`,
    `The file mentioned in \`package.json > ${propName}\` is missing.`,
    {'Missing script': missingFile ? [filePath] : []});
}

function reportResults(successMessage, errorMessage, errors) {
  const errorHeaders = Object.keys(errors).filter(header => errors[header].length);

  if (!errorHeaders.length) {
    console.log(`${CHECK_MARK}  ${successMessage}`);
  } else {
    const errorSummary = `${X_MARK}  ${errorMessage}`;
    const errorDetails = errorHeaders.
      reduce((lines, header) => [
        ...lines,
        `${header}:`,
        ...errors[header].map(x => `  ${x}`),
      ], []).
      map(line => `     ${line}`).
      join('\n');

    console.error(errorSummary);
    console.error(errorDetails);
    console.error();

    process.exit(1);
  }
}
