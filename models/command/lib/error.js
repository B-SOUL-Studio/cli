const colors = require('colors/safe');

const Error_EMPTY_ARGS = () => {
  throw new Error('[models/Command] 参数不能为空!');
}

const Error_ARGS_IS_NOT_ARRAY = () => {
  throw new Error('[models/Command] 参数必须为数组!');
}

const Error_ARGS_IS_EMPTY = () => {
  throw new Error('[models/Command] 参数列表为空!');
}

const Error_INIT_IS_NOT_EXSITS = () => {
  throw new Error('[models/Command] init必须实现!');
}

const Error_EXEC_IS_NOT_EXSITS = () => {
  throw new Error('[models/Command] exec必须实现!');
}

const Error_NODE_VERSION_IS_TOO_LOW = (lowestVersion) => {
  throw new Error(colors.red(`[models/Command] der-cli 需要安装 v${lowestVersion} 以上版本的 Node.js (官网http://nodejs.cn/download/)`));
}

module.exports = {
  Error_EMPTY_ARGS,
  Error_ARGS_IS_NOT_ARRAY,
  Error_ARGS_IS_EMPTY,
  Error_INIT_IS_NOT_EXSITS,
  Error_EXEC_IS_NOT_EXSITS,
  Error_NODE_VERSION_IS_TOO_LOW
}