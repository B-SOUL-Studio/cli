const Error_PACKAGE_JSON_NOT_FOUND = () => {
  throw new Error('[Go] package.json不存在');
}

const Error_PACKAGE_JSON_INFO_NOT_COMPLETE = () => {
  throw new Error('[Go] package.json信息不完整, 请检查name, version属性是否填写');
}

module.exports = {
  Error_PACKAGE_JSON_NOT_FOUND,
  Error_PACKAGE_JSON_INFO_NOT_COMPLETE
}