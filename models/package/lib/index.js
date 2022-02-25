'use strict';

const path = require('path');
const fse = require('fs-extra');
const pkgDir = require('pkg-dir').sync;
const pathExists = require('path-exists').sync;
const npminstall = require('npminstall');
const { isObject } = require('@der-cli/utils');
const formatPath = require('@der-cli/format-path');
const log = require('@der-cli/log');
const {
  getDefaultRegistry,
  getNpmLatestVersion
} = require('@der-cli/get-npm-info');
const {
  Error_EMPTY_OPTION,
  Error_OPTION_IS_NOT_OBJECT
} = require('./error');

/**
 * 本地 Package 依赖下载、更新、缓存核心实现
 *
 * @class Package
 */
class Package {
  constructor(options) {
    if (!options) {
      Error_EMPTY_OPTION()
    }
    if (!isObject(options)) {
      Error_OPTION_IS_NOT_OBJECT()
    }

    // Init props
    const { targetPath, storeDir, packageName, packageVersion } = options;
    this.targetPath = targetPath; // package的目标路径（本地）
    this.storeDir = storeDir; // package node_modules 路径
    this.packageName = packageName; // package name
    this.packageVersion = packageVersion; // package version
    this.cacheFilePathPrefix = this.packageName.replace('/', '_'); // 解析package的缓存目录前缀
  }

  // 准备阶段
  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      // 创建本地缓存目录
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      // 获取最新版本
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`);
  }

  // 判断本地缓存是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
      // C:\Users\username\.der-cli\dependencies\node_modules\_@der-cli_init@1.0.1@@der-cli\init
    } else {
      return pathExists(this.targetPath);
    }
  }

  // 安装Package
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{
        name: this.packageName,
        version: this.packageVersion,
      }],
    });
  }

  // 更新Package
  async update() {
    await this.prepare();
    // 1. 获取最新的npm模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    // 2. 查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    // 3. 如果不存在，则直接安装最新版本
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{
          name: this.packageName,
          version: latestPackageVersion,
        }],
      });
    }
    // TODO: downloadTemplate时此行未打印?
    log.info(`[Package] 检测到更新: 已更新至 ${this.packageVersion} => ${latestPackageVersion}`);
    this.packageVersion = latestPackageVersion;
  }

  // 获取入口文件的路径 /commands/init/
  getRootFilePath() {
    function _getRootFile(targetPath) {
      // 1. 获取 package.json 所在目录
      const _dir = pkgDir(targetPath); // Current terminal directory or '-targetPath' directory

      if (_dir) {
        // 2. 读取 package.json
        const pkgFile = require(path.resolve(_dir, 'package.json'));
        // 3. 寻找 main/lib -> path
        if (pkgFile && pkgFile.main) {
          // 4. 路径的兼容(macOS/windows, '\' -> '/')
          return formatPath(path.resolve(_dir, pkgFile.main));
        }
      }
      return null;
    }

    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;