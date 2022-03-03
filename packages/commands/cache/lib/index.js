'use strict';

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const log = require('@der-cli/log');
const Command = require('@der-cli/command');
const { readFile } = require('@der-cli/utils');
const {
  DEPENDENCIES_CACHE_PATH,
  GIT_CACHE_PATH,
  TPL_CACHE_PATH,
  GIT_OWN_CACHE_PATH,
  GIT_LOGIN_CACHE_PATH,
  GIT_TOKEN_CACHE_PATH,
  GIT_SERVER_CACHE_PATH
} = require('./const');
const {
  Error_FOLDER_NOT_EXISTS,
  Error_FILE_CACHE_NOT_EXISTS
} = require('./error');

class CacheCommand extends Command {
  init() {
    // 参数处理
    this.options = {
      ...this._argv[0]
    }
  }

  exec() {
    try {
      this.doCache()
    } catch (e) {
      log.error(e.message);
      if (process.env.DER_CLI_LOG_LEVEL === 'verbose') {
        console.log(e);
      }
    }
  }

  doCache() {
    const cliPath = process.env.DER_CLI_HOME_PATH;
    let depPath = path.resolve(process.env.DER_CLI_HOME_PATH, DEPENDENCIES_CACHE_PATH)
    let gitPath = path.resolve(process.env.DER_CLI_HOME_PATH, GIT_CACHE_PATH)
    let tplPath = path.resolve(process.env.DER_CLI_HOME_PATH, TPL_CACHE_PATH)

    if (!fs.existsSync(cliPath)) {
      Error_FOLDER_NOT_EXISTS()
    }

    if (this.options.all) {
      this.gitCache(gitPath)
      this.tplCache(tplPath)
      this.depCache(depPath)
    } else if (this.options.dependencies) {
      this.depCache(depPath)
    } else if (this.options.git) {
      this.gitCache(gitPath)
    } else if (this.options.template) {
      this.tplCache(tplPath)
    } else {
      log.notice('[Cache]', 'No options.(--all/--git/--template/--dependencies)');
    }
  }

  depCache(depPath) {
    if (fs.existsSync(depPath)) {
      this.toolStart('DEPEMDENCIES CACHE')
      let files = [];
      fs.readdirSync(depPath).forEach(file => {
        files.push(file);
      })
      log.info('[Cache] Dependencies total cache files:', files.length);
    } else {
      Error_FILE_CACHE_NOT_EXISTS(depPath)
    }
  }

  gitCache(gitPath) {
    if (fs.existsSync(gitPath)) {
      this.toolStart('GIT CACHE')
      const own = path.resolve(gitPath, GIT_OWN_CACHE_PATH);
      const login = path.resolve(gitPath, GIT_LOGIN_CACHE_PATH);
      const token = path.resolve(gitPath, GIT_TOKEN_CACHE_PATH);
      const server = path.resolve(gitPath, GIT_SERVER_CACHE_PATH);

      const ownCache = readFile(own);
      const loginCache = readFile(login);
      const tokenCache = readFile(token);
      const serverCache = readFile(server);

      if (!loginCache || !tokenCache || !serverCache || !ownCache) {
        Error_FILE_CACHE_NOT_EXISTS(gitPath)
      } else {
        log.info('[Cache] Git远程平台:', serverCache);
        log.info('[Cache] Git仓库类型:', `${ownCache}(${ownCache === 'org' ? '组织' : '个人'})`);
        log.info('[Cache] Git登录用户:', loginCache);
        log.info('[Cache] Git App Token:', this.options.token ? tokenCache : '******');
      }

    } else {
      Error_FILE_CACHE_NOT_EXISTS(gitPath)
    }
  }

  tplCache(tplPath) {
    if (fs.existsSync(tplPath)) {
      this.toolStart('TEMPLATE CACHE')
      let files = [];
      fs.readdirSync(tplPath).forEach(file => {
        if (file.startsWith('_@der-cli')) {
          log.info('[Cache] Template:', file);
          files.push(tplPath);
        }
      })
      log.info('[Cache] Template total cache files:', files.length);
    } else {
      Error_FILE_CACHE_NOT_EXISTS(tplPath)
    }
  }

  toolStart(info) {
    console.log();
    log.info(`******** ${info} ********`);
  }
}

function init(argv) {
  return new CacheCommand(argv);
}

module.exports = init
module.exports.CacheCommand = CacheCommand;