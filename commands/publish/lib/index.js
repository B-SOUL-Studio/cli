'use strict';

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const Command = require('@der-cli-dev/command');
const Git = require('@der-cli-dev/git');
const log = require('@der-cli-dev/log');
const {
  Error_PACKAGE_JSON_NOT_FOUND,
  Error_PACKAGE_JSON_INFO_NOT_COMPLETE
} = require('./error')

class PublishCommand extends Command {
  init() {
    // 参数处理
    // log.verbose('publish init', this._argv);
    this.options = {
      ...this._argv[0]
    }
  }

  async exec() {
    try {
      const startTime = new Date().getTime();
      // 1.初始化检查
      this.prepare()
      // 2.Git Flow自动化
      const git = new Git(this.projectInfo, this.options);
      await git.prepare();
      // 3.云构建、云发布
      const endTime = new Date().getTime();
      log.success('[Publish]本次发布耗时:', Math.floor(endTime - startTime) + 'ms');

    } catch (e) {
      log.error(e);
      if (process.env.DER_CLI_LOG_LEVEL === 'verbose') {
        console.log(e);
      }
    }
  }

  prepare() {
    // 1.检查项目是否为npm项目
    const projectPath = process.cwd();
    const pkgPath = path.join(projectPath, 'package.json');
    log.verbose('[Publish]项目包路径:', pkgPath);
    if (!fs.existsSync(pkgPath)) {
      Error_PACKAGE_JSON_NOT_FOUND()
    }
    // 2.检查是否包含name、version、build字段
    const pkg = fse.readJsonSync(pkgPath);
    const { name, version, scripts } = pkg;
    // log.verbose('package.json:', name, version, scripts);
    if (!name || !version || !scripts || !scripts.build) {
      Error_PACKAGE_JSON_INFO_NOT_COMPLETE()
    }

    this.projectInfo = { name, version, dir: projectPath };
  }
}

function init(argv) {
  return new PublishCommand(argv);
}

module.exports = init
module.exports.PublishCommand = PublishCommand;