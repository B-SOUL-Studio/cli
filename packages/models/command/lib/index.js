'use strict';

const semver = require('semver');
const log = require('@der-cli/log');
const { LOWEST_NODE_VERSION } = require('./const');
const {
  Error_EMPTY_ARGS,
  Error_ARGS_IS_NOT_ARRAY,
  Error_ARGS_IS_EMPTY,
  Error_INIT_IS_NOT_EXSITS,
  Error_EXEC_IS_NOT_EXSITS,
  Error_NODE_VERSION_IS_TOO_LOW
} = require('./error');

/**
 * Command 抽象类
 *
 * @class Command
 */
class Command {
  constructor(argv) {
    // log.verbose('Command', argv);

    if (!argv) {
      Error_EMPTY_ARGS()
    }
    if (!Array.isArray(argv)) {
      Error_ARGS_IS_NOT_ARRAY()
    }
    if (argv.length < 1) {
      Error_ARGS_IS_EMPTY()
    }
    this._argv = argv;

    // 执行初始化内容
    let runner = new Promise((resolve, reject) => {
      let _chain = Promise.resolve();
      _chain = _chain.then(() => this.checkNodeVersion());
      _chain = _chain.then(() => this.initArgs());
      _chain = _chain.then(() => this.init());
      _chain = _chain.then(() => this.exec());
      _chain.catch(err => {
        log.error(err);
      });
    });
  }

  // 参数初始化
  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }

  // 检查 node.js 版本号
  checkNodeVersion() {
    // 获取当前版本号与最低版本号
    const currentVersion = process.version;
    const lowestVersion = LOWEST_NODE_VERSION;
    // 判断当前版本号是否比最低版本号低
    if (!semver.gte(currentVersion, lowestVersion)) {
      (Error_NODE_VERSION_IS_TOO_LOW(lowestVersion))
    }
  }

  // 用户自定义init
  init() {
    Error_INIT_IS_NOT_EXSITS()
  }

  // 用户自定义exec
  exec() {
    Error_EXEC_IS_NOT_EXSITS()
  }
}

module.exports = Command;