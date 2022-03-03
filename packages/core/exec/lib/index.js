'use strict';

const path = require('path');
const Package = require('@der-cli/package');
const log = require('@der-cli/log');
const { exec: spawn } = require('@der-cli/utils');
const {
  CACHE_DIR,
  DEFAULT_CORE_PACKAGE_VERSION,
  SETTINGS
} = require('./const');

/**
 * 执行命令, 开启子进程
 */
async function exec() {
  let targetPath = process.env.DER_CLI_TARGET_PATH; // -tp /xxx
  const homePath = process.env.DER_CLI_HOME_PATH; // C:\user\username\.der-cli 

  let storeDir = '';
  let pkg;
  log.verbose('[exec] 检查本地代码调试区:', targetPath || '未指定(默认使用线上版本)');
  log.verbose('[exec] 检查本地缓存路径:', homePath);

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name(); // init/create/...
  const packageName = SETTINGS[cmdName];
  const packageVersion = DEFAULT_CORE_PACKAGE_VERSION;

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
    storeDir = path.resolve(targetPath, 'node_modules');
    log.verbose('[exec] (默认)远程代码调试工作区:', targetPath);
    log.verbose('[exec] 远程代码调试缓存目录:', storeDir);

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
      // 优化: 在node子进程中调用
      const args = Array.from(arguments); // 参数转数组
      const cmd = args[args.length - 1];
      const o = Object.create(null);
      Object.keys(cmd).forEach(key => { // 过滤属性，减小args体积
        if (cmd.hasOwnProperty(key) &&
          !key.startsWith('_') &&
          key !== 'parent') {
          o[key] = cmd[key];
        }
      });

      args[args.length - 1] = o;
      // 动态执行 der-cli/init/lib/index.js 文件, 开启子进程
      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit', // 控制台输出日志 
      });
      log.verbose(`[exec] ${cmdName}命令进程:`, child.pid);
      child.on('error', e => {
        log.error(e);
        process.exit(1);
      });
      child.on('exit', e => {
        console.log();
        log.verbose(`[exec] End with code ${e}\n`);
        process.exit(e);
      });
    } catch (e) {
      log.error(e);
    }
  }
}

module.exports = exec;