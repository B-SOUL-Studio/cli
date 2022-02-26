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
    this.doClean()
  }

  doClean() {
    const cliPath = process.env.DER_CLI_HOME_PATH;
    log.notice('开始清空缓存文件...');
    if (this.options.all) {
      this.cleanAll(cliPath)
    } else if (this.options.dep) {
      const depPath = path.resolve(process.env.DER_CLI_HOME_PATH, DEPENDENCIES_PATH);
      if (fs.existsSync(depPath)) {
        fse.emptyDirSync(depPath);
        log.success('[clean] 清空依赖文件成功:', depPath);
      } else {
        log.success('[clean] 文件夹不存在:', depPath);
      }
    } else {
      this.cleanAll(cliPath)
    }
  }

  cleanAll(cliPath) {
    if (fs.existsSync(cliPath)) {
      fse.emptyDirSync(cliPath);
      log.success('[clean] 缓存已清空:', cliPath);
    } else {
      log.notice('[clean] 文件夹不存在:', cliPath);
    }
  }
}

function init(argv) {
  return new CleanCommand(argv);
}

module.exports = init
module.exports.CleanCommand = CleanCommand;