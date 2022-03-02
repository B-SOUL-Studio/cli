// 默认本地依赖缓存路径
const CACHE_DIR = 'dependencies';

// 默认推荐用户安装最新版
const DEFAULT_CORE_PACKAGE_VERSION = 'latest';

// Cmd映射表: cmdName -> packageName
const SETTINGS = {
  init: '@der-cli/init',
  go: '@der-cli/publish',
  clean: '@der-cli/clean',
  cache: '@der-cli/cache',
  tpl: '@der-cli/tpl',
};

module.exports = {
  CACHE_DIR,
  DEFAULT_CORE_PACKAGE_VERSION,
  SETTINGS
}