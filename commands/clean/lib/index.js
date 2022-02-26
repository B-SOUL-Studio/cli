'use strict';

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const log = require('@der-cli/log');

class CleanCommand extends Command {
  init() {
    // 参数处理
    this.options = {
      ...this._argv[0]
    }
    console.log(this.options);
  }

  exec() {
    console.log(process.env);
  }

  doClean() {

  }

  cleanAll() {
    if (fs.existsSync(process.env.DER_CLI_HOME_PATH)) {
      fse.emptyDirSync(process.env.DER_CLI_HOME_PATH);
      log.success('[core/cli] 清空缓存文件:', process.env.DER_CLI_HOME_PATH);
    } else {
      log.notice('[core/cli] 文件夹不存在:', process.env.DER_CLI_HOME_PATH);
    }
  }
}

function init(argv) {
  return new CleanCommand(argv);
}

module.exports = init
module.exports.CleanCommand = CleanCommand;

// .action((options) => {
//     log.notice('开始清空缓存文件');
//     if (options.all) {
//       cleanAll();
//     } else if (options.dep) {
//       const depPath = path.resolve(process.env.DER_CLI_HOME_PATH, DEPENDENCIES_PATH);
//       if (fs.existsSync(depPath)) {
//         fse.emptyDirSync(depPath);
//         log.success('清空依赖文件成功', depPath);
//       } else {
//         log.success('文件夹不存在', depPath);
//       }
//     } else {
//       cleanAll();
//     }
//   });