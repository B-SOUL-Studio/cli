const request = require('@der-cli-dev/request');

module.exports = function () {
  return request({
    url: '/project/template',
  });
};