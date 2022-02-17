const Error_PROJECT_TEMPLATE_IS_NOT_EXSITS = () => {
  throw new Error('项目模板不存在')
}

const Error_PROJECT_NAME_IS_INVALID = (title) => {
  return `请输入合法的${title}名称(eg:derderder/der-cli)`
}

const Error_PROJECT_VERSION_IS_INVALID = () => {
  return '请输入合法的版本号(eg:1.0.0)'
}

module.exports = {
  Error_PROJECT_TEMPLATE_IS_NOT_EXSITS,
  Error_PROJECT_NAME_IS_INVALID,
  Error_PROJECT_VERSION_IS_INVALID
}