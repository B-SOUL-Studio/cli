const colors = require('colors/safe');
const locale = require('@der-cli/locale');

const DEFAULT_CLI_HOME = '.der-cli';

const DER_CLI_LOGO = colors.cyan(`  ________              
  ___  __ \\____________    
  __  / / /  _ \\_  ___/  
  _  /_/ //  __/  /      ${colors.white(locale.welcome)}
  /_____/ \\___//_/       ${colors.green('</>')} with ${colors.red('♥')} by yesmore ©2022
`)

module.exports = {
  DEFAULT_CLI_HOME,
  DER_CLI_LOGO,
};