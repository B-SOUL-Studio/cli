const Error_EMPTY_OPTION = () => {
  throw new Error('Package类的options参数不能为空!');
}

const Error_OPTION_IS_NOT_OBJECT = () => {
  throw new Error('Package类的options参数必须为对象!');
}

module.exports = {
  Error_EMPTY_OPTION,
  Error_OPTION_IS_NOT_OBJECT
}