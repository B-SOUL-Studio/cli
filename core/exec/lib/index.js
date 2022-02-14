'use strict';

const path = require('path');
const Package = require('@der-cli-dev/package');
const log = require('@der-cli-dev/log');
const { exec: spawn } = require('@der-cli-dev/utils');

const { CACHE_DIR } = require('./const');

// 映射表 cmdName -> packageName
const SETTINGS = {
  init: '@der-cli-dev/init', // TODO test
};

async function exec() {
  let targetPath = process.env.DER_CLI_TARGET_PATH; // -tp /xxx
  const homePath = process.env.DER_CLI_HOME_PATH; // C:/user/username 

  let storeDir = '';
  let pkg;
  log.verbose('初始化本地调试环境路径', targetPath || '未指定');
  log.verbose('初始化本地依赖缓存路径', homePath);

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name(); // init/create/...
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
    storeDir = path.resolve(targetPath, 'node_modules');
    log.verbose('更新本地调试环境路径', targetPath);
    log.verbose('更新本地依赖缓存路径', storeDir);

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });

    // 若本地依赖缓存(C:/user/username/.der-cli/dependencies/node_modules/xxx_package)已存在，则检查/更新
    if (await pkg.exists()) {
      // 更新package
      await pkg.update();
    } else {
      // 否则安装package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }

  const rootFile = pkg.getRootFilePath();
  // rootFile: C:/Users/username/.der-cli/dependencies/node_modules/_@der-cli_init@1.1.3@@der-cli/init/lib/index.js

  if (rootFile) {
    try {
      // T: 在当前进程中调用 init
      require(rootFile).call(null, Array.from(arguments));
      // 优化: 在node子进程中调用
    } catch (e) {
      log.error(e);
    }
  }
}

module.exports = exec;