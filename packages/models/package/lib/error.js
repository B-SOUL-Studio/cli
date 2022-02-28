const Error_CONST_EMPTY_OPTION = '[Package] Package类的options参数不能为空!'
const Error_CONST_OPTION_IS_NOT_OBJECT = '[Package] Package类的options参数必须为对象!'

const Error_EMPTY_OPTION = () => {
  throw new Error(Error_CONST_EMPTY_OPTION);
}

const Error_OPTION_IS_NOT_OBJECT = () => {
  throw new Error(Error_CONST_OPTION_IS_NOT_OBJECT);
}

module.exports = {
  Error_CONST_EMPTY_OPTION,
  Error_CONST_OPTION_IS_NOT_OBJECT,
  Error_EMPTY_OPTION,
  Error_OPTION_IS_NOT_OBJECT
}