const Error_FOLDER_NOT_EXISTS = () => {
  throw new Error('[Cache] Local Cache is not exsits.')
};

const Error_FILE_CACHE_NOT_EXISTS = (filePath) => {
  throw new Error(`[Cache] Cache file is not exsits: ${filePath}`)
}

module.exports = {
  Error_FOLDER_NOT_EXISTS,
  Error_FILE_CACHE_NOT_EXISTS
}