'use strict';

const { isObject } = require('./isObject');
const { spinnerStart } = require('./spinnerStart');
const { exec, execAsync } = require('./exec');
const { sleep } = require('./sleep');
const { readFile, writeFile } = require('./file');
const terminalLink = require('./terminalLink');
const inquirer = require('./inquirer');

module.exports = {
  isObject,
  spinnerStart,
  exec,
  execAsync,
  sleep,
  readFile,
  writeFile,
  inquirer,
  terminalLink
}