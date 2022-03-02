'use strict';

const colors = require('colors/safe');
const Command = require('@der-cli/command');
const log = require('@der-cli/log');
const getProjectTemplate = require('./getProjectTemplate');
const { Error_PROJECT_TEMPLATE_IS_NOT_EXSITS } = require('./error');

class TplCommand extends Command {
  init() {
    // 参数处理
    this.options = {
      ...this._argv[0]
    }
  }

  async exec() {
    try {
      const template = await getProjectTemplate()
      if (!template || template.length === 0) {
        Error_PROJECT_TEMPLATE_IS_NOT_EXSITS()
      }

      if (!this.options.pro && !this.options.com) {
        this.template = template;
      } else {
        const type = this.options.com ? 'component' : 'project';
        this.template = template.filter(tpl =>
          tpl.tag.includes(type));
      }

      this.fmtNameAndLog()
    } catch (e) {
      log.error(e.message);
      if (process.env.DER_CLI_LOG_LEVEL === 'verbose') {
        console.log(e);
      }
    }
  }

  fmtNameAndLog() {
    console.log();
    log.notice(`[Template]  ******** TEMPLATES ********`);
    this.template.forEach((tpl, index) => {
      console.log(colors.cyan(`  [${index + 1}] ${tpl.name} -- v${tpl.version}`));
    })
  }
}

function init(argv) {
  return new TplCommand(argv);
}

module.exports = init
module.exports.TplCommand = TplCommand;