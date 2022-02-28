const Spinner = require('cli-spinner').Spinner;

function spinnerStart(msg, spinnerString = '|/-\\') {
  const spinner = new Spinner(`${msg}.. %s`);
  spinner.setSpinnerString(spinnerString);
  spinner.start();
  return spinner;
}

module.exports = { spinnerStart }