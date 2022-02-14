'use strict';

const { isObject } = require('./isObject');
const { spinnerStart } = require('./spinnerStart');
const { exec, execAsync } = require('./exec');
const { sleep } = require('./sleep');

module.exports = {
  isObject,
  spinnerStart,
  exec,
  execAsync,
  sleep
}