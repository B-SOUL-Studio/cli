const Error_PROJECT_TEMPLATE_IS_NOT_EXSITS = () => {
  throw new Error('模板不存在')
}

const Error_PROJECT_NAME_IS_INVALID = (title) => {
  return `请输入合法的${title}名称(eg:derderder/der-cli)`
}

const Error_PROJECT_VERSION_IS_INVALID = () => {
  return '请输入合法的版本号(eg:1.0.0)'
}

const Error_UNRECOGNIZED_TEMPLATE_TYPE = () => {
  throw new Error('无法识别项目模板类型');
}

const Error_TEMPLATE_INFO_IS_NOT_EXISTS = () => {
  throw new Error('项目模板信息不存在');
}

const Error_DEPENDENCY_INSTALLATION_FAILD = () => {
  return '依赖安装失败';
}

const Error_NPM_START_FAILD = () => {
  return '启动执行命令失败'
}

const Error_COMMAND_IS_NOT_EXISTS = (command) => {
  throw new Error(`命令 ${command} 不存在`);
}

const Error_COMPONENT_DESCRIPTION_INFO_IS_EMPTY = () => {
  return '请输入组件描述信息'
}

const Error_COSTOM_TEMPLATE_INDEX_IS_NOT_EXISTS = () => {
  throw new Error('自定义模板入口文件不存在!');
}

module.exports = {
  Error_PROJECT_TEMPLATE_IS_NOT_EXSITS,
  Error_PROJECT_NAME_IS_INVALID,
  Error_PROJECT_VERSION_IS_INVALID,
  Error_UNRECOGNIZED_TEMPLATE_TYPE,
  Error_TEMPLATE_INFO_IS_NOT_EXISTS,
  Error_DEPENDENCY_INSTALLATION_FAILD,
  Error_NPM_START_FAILD,
  Error_COMMAND_IS_NOT_EXISTS,
  Error_COMPONENT_DESCRIPTION_INFO_IS_EMPTY,
  Error_COSTOM_TEMPLATE_INDEX_IS_NOT_EXISTS
}