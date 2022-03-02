'use strict';

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const log = require('@der-cli/log');
const Command = require('@der-cli/command');
const { DEPENDENCIES_PATH } = require('./const');

class CleanCommand extends Command {
  init() {
    // 参数处理
    this.options = {
      ...this._argv[0]
    }
  }

  exec() {
    try {
      this.doClean()
    } catch (e) {
      log.error(e.message);
      if (process.env.DER_CLI_LOG_LEVEL === 'verbose') {
        console.log(e.);
      }
    }
  }

  doClean() {
    const cliPath = process.env.DER_CLI_HOME_PATH;
    log.notice('[Clean] Removing Cache files...');
    if (this.options.all) {
      this.cleanAll(cliPath)
    } else if (this.options.dep) {
      const depPath = path.resolve(process.env.DER_CLI_HOME_PATH, DEPENDENCIES_PATH);
      if (fs.existsSync(depPath)) {
        fse.emptyDirSync(depPath);
        log.success('[Clean] Remove:', `${depPath} ...done`);
      } else {
        log.success('[Clean] Folder is not exsits:', depPath);
      }
    } else {
      this.cleanAll(cliPath)
    }
  }

  cleanAll(cliPath) {
    if (fs.existsSync(cliPath)) {
      fse.emptyDirSync(cliPath);
      log.success('[Clean] Remove:', `${cliPath} ...done`);
    } else {
      log.notice('[Clean] Folder is not exsits:', cliPath);
    }
  }
}

function init(argv) {
  return new CleanCommand(argv);
}

module.exports = init
module.exports.CleanCommand = CleanCommand;