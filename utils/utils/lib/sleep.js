function sleep(timeout = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

module.exports = {
  sleep
}