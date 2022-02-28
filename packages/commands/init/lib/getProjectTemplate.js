const request = require('@der-cli/request');

module.exports = function () {
  return request({
    url: '/project/tpl',
  });
};