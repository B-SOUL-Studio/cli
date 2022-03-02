'use strict';

class TplCommand extends Command {
  init() {
    // 参数处理
    this.options = {
      ...this._argv[0]
    }
    console.log(this.options);
  }

  exec() {
    // this.doClean()
  }
}

function init(argv) {
  return new TplCommand(argv);
}

module.exports = init
module.exports.TplCommand = CacheCommand;