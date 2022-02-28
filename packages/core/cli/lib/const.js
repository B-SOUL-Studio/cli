const locale = require('@der-cli/locale');

const DEFAULT_CLI_HOME = '.der-cli';

const DER_CLI_LOGO = `  ________              
  ___  __ \\____________    
  __  / / /  _ \\_  ___/  
  _  /_/ //  __/  /      ${locale.welcome}
  /_____/ \\___//_/       </> with ♥ by yesmore ©2022
`

module.exports = {
  DEFAULT_CLI_HOME,
  DER_CLI_LOGO,
};