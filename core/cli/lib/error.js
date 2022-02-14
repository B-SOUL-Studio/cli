const colors = require('colors/safe');

const Error_USER_HOME_NOT_EXISTS = () => {
  throw new Error(colors.red('[core/cli] 当前登录用户主目录不存在!'));
}

const Error_ROOT_USER = () => {
  return colors.red('[core/cli] 请避免使用 root 账户启动本应用')
}

const Error_NPM_VERSION = (npmName, currentVersion, lastVersion) => {
  return colors.yellow(`[core/cli] 更新说明: ${npmName}@${lastVersion} 为最新版本
         当前版本: ${currentVersion} => ${lastVersion}, 建议手动更新
         更新命令: npm install -g ${npmName}`);
}

const Error_UNKNOWN_CMD = (cmd) => {
  return colors.red('[core/cli] 未知的命令: ' + cmd)
}

const Error_ALL_CMDS = (cmds) => {
  return colors.white('[core/cli] 可用命令: ' + cmds.join(','))
}

module.exports = {
  Error_USER_HOME_NOT_EXISTS,
  Error_ROOT_USER,
  Error_NPM_VERSION,
  Error_UNKNOWN_CMD,
  Error_ALL_CMDS
}