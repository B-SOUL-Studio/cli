'use strict';

// const fs = require('fs');
// const path = require('path');
// const inquirer = require('inquirer');
// const fse = require('fs-extra');
// const glob = require('glob');
// const ejs = require('ejs');
// const semver = require('semver');
// const userHome = require('user-home');
const Command = require('@der-cli-dev/command');
const Package = require('@der-cli-dev/package');
const log = require('@der-cli-dev/log');
const {
  // spinnerStart,
  // sleep,
  // execAsync
} = require('@der-cli-dev/utils');

// const getProjectTemplate = require('./getProjectTemplate');
const {
  TYPE_PROJECT,
  TYPE_COMPONENT,
  TEMPLATE_TYPE_NORMAL,
  TEMPLATE_TYPE_CUSTOM,
  WHITE_COMMAND
} = require('./const');

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || '';
    this.force = !!this._cmd.force;
    log.verbose('正在执行命令', this.projectName);
    log.verbose('清空工作目录', this.force);
  }

  exec() {}
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;