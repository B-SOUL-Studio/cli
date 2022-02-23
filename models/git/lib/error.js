const Error_CAN_NOT_FIND_USER_HOME = () => {
  throw new Error('[Git]用户主目录获取失败!');
};

const Error_INIT_GIT_SERVER_FAILED = () => {
  throw new Error('[Git]GitServer初始化失败, 检查.git_server文件内容是否被修改, 或使用[-refreshServer]参数更新.git_server文件')
}

const Error_FAILED_GET_INFO = () => {
  throw new Error('[Git]用户或组织信息获取失败');
}

const Error_FAILED_CREATE_REMOTE_REPO = () => {
  throw new Error('[Git]远程仓库创建失败');
}

const Error_CODE_CONFLICTS = () => {
  throw new Error('[Git]当前代码存在冲突, 请手动处理合并后再试!');
}

module.exports = {
  Error_CAN_NOT_FIND_USER_HOME,
  Error_INIT_GIT_SERVER_FAILED,
  Error_FAILED_GET_INFO,
  Error_FAILED_CREATE_REMOTE_REPO,
  Error_CODE_CONFLICTS
}